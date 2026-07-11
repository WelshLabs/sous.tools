import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Res,
  Body,
} from "@nestjs/common";
import { type Response } from "express";
import { type ApiResponse, type IntegrationStatus } from "@soustools/api-types";
import { config } from "@soustools/config";
import { runControllerAction } from "../signage/response.helper";
import { type IntegrationsService } from "./integrations.service";
import { type GoogleDriveService } from "./google-drive.service";

@Controller("integrations")
export class IntegrationsController {
  constructor(
    private readonly service: IntegrationsService,
    private readonly driveService: GoogleDriveService,
  ) {}

  @Get("connect/:provider")
  connect(
    @Param("provider") provider: string,
    @Query("orgId") orgId: string,
    @Res() res: Response,
  ): void {
    const url = this.service.getOAuthUrl(provider, orgId);
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
      const orgId = state || "d0000000-0000-0000-0000-000000000000";
      if (provider === "google") {
        await this.service.handleGoogleCallback(code, orgId);
      } else if (provider === "square") {
        await this.service.handleSquareCallback(code, orgId);
      } else {
        throw new Error(`Unsupported provider: ${provider}`);
      }
      res.redirect(
        `${config.APP_BASE_URL}/settings?tab=integrations&status=success`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      res.redirect(
        `${config.APP_BASE_URL}/settings?tab=integrations&status=error&message=${encodeURIComponent(msg)}`,
      );
    }
  }

  @Get("status")
  async getStatus(
    @Query("orgId") orgId?: string,
  ): Promise<ApiResponse<IntegrationStatus[]>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      return this.service.getIntegrationStatus(targetOrgId);
    });
  }

  @Delete("disconnect/:provider")
  async disconnect(
    @Param("provider") provider: string,
    @Query("orgId") orgId?: string,
  ): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.disconnect(provider, targetOrgId);
    });
  }

  @Post("square/sync")
  async syncSquare(@Query("orgId") orgId?: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.syncSquareCatalog(targetOrgId);
    });
  }

  @Post("square/seed")
  async seedSquare(@Query("orgId") orgId?: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
      await this.service.seedSquareCatalog(targetOrgId);
    });
  }

  @Get("google/files")
  async getGoogleFiles(
    @Query("q") query?: string,
    @Query("folderId") folderId?: string,
    @Query("orgId") orgId?: string,
  ) {
    const targetOrgId = orgId || "d0000000-0000-0000-0000-000000000000";
    return this.driveService.listFiles(targetOrgId, query, folderId);
  }

  @Post("checkout")
  async checkout(@Body() body: { orgId: string; orderData: any }) {
    return runControllerAction(async () => {
      const orgId = body.orgId || "d0000000-0000-0000-0000-000000000000";
      return this.service.checkout(orgId, body.orderData);
    });
  }
}
