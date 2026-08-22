import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  Optional,
} from "@nestjs/common";
import { type Response } from "express";
import { serverConfig as config } from "@soustools/config/server";
import { IntegrationsService } from "./integrations.service";
import { PosGateway } from "../pos/pos.gateway";

function getOrgId(orgId?: string): string {
  return !orgId || orgId === "default"
    ? "d0000000-0000-0000-0000-000000000000"
    : orgId;
}

@Controller("integrations")
export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService,
    @Optional() private readonly posGateway?: PosGateway,
  ) {}

  @Get("connect/:provider")
  connect(
    @Param("provider") provider: string,
    @Query("orgId") orgId: string,
    @Res() res: Response,
  ): void {
    const url = this.service.getOAuthUrl(provider, getOrgId(orgId));
    res.redirect(url);
  }

  @Get("callback/:provider")
  async callback(
    @Param("provider") provider: string,
    @Query("code") code: string,
    @Query("state") state: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const orgId = getOrgId(state);
      if (provider === "google") {
        await this.service.handleGoogleCallback(code, orgId);
      } else if (provider === "square") {
        await this.service.handleSquareCallback(code, orgId);
        this.service
          .syncSquareCatalog(orgId)
          .then(() => {
            this.posGateway?.broadcastCatalogUpdate(orgId);
            this.posGateway?.broadcastOrdersUpdate(orgId);
          })
          .catch(() => {});
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      res.redirect(
        `${config.NEXT_PUBLIC_APP_URL}/settings?tab=integrations&status=success`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.redirect(
        `${config.NEXT_PUBLIC_APP_URL}/settings?tab=integrations&status=error&message=${encodeURIComponent(msg)}`,
      );
    }
  }
}
