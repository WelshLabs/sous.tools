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
import { ApiResponse, IntegrationStatus } from "@soustools/api-types";
import { serverConfig as config } from "@soustools/config/server";
import { randomUUID } from "crypto";
import { runControllerAction } from "../signage/response.helper";
import { IntegrationsService } from "./integrations.service";
import { GoogleDriveService } from "./drivers/google-drive/google-drive.service";

function getOrgId(orgId?: string): string {
  return !orgId || orgId === "default"
    ? "d0000000-0000-0000-0000-000000000000"
    : orgId;
}

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
        // Kick off catalog + orders sync in the background — don't await so the
        // OAuth redirect completes immediately while data populates asynchronously.
        this.service.syncSquareCatalog(orgId).catch(() => {});
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

  @Get("status")
  async getStatus(
    @Query("orgId") orgId?: string,
  ): Promise<ApiResponse<IntegrationStatus[]>> {
    return runControllerAction(async () => {
      return this.service.getIntegrationStatus(getOrgId(orgId));
    });
  }

  @Delete("disconnect/:provider")
  async disconnect(
    @Param("provider") provider: string,
    @Query("orgId") orgId?: string,
  ): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      await this.service.disconnect(provider, getOrgId(orgId));
    });
  }

  @Post("square/sync")
  async syncSquare(@Query("orgId") orgId?: string): Promise<ApiResponse<void>> {
    return runControllerAction(async () => {
      await this.service.syncSquareCatalog(getOrgId(orgId));
    });
  }

  @Get("google/files")
  async getGoogleFiles(
    @Query("q") query?: string,
    @Query("folderId") folderId?: string,
    @Query("orgId") orgId?: string,
  ) {
    return this.driveService.listFiles(getOrgId(orgId), query, folderId);
  }

  @Post("google/import-file")
  async importGoogleFile(@Body() body: { fileId: string; orgId?: string }) {
    return runControllerAction(async () => {
      const reviewId = randomUUID();
      const result = await this.driveService.processDriveFile(
        body.fileId,
        getOrgId(body.orgId),
        reviewId,
      );
      if (!result.sourceDocumentUrl) {
        throw new Error("Failed to process Google Drive file");
      }
      return {
        url: result.sourceDocumentUrl,
        name: result.sourceName || "Google Drive File",
      };
    });
  }

  @Post("checkout")
  async checkout(@Body() body: { orgId: string; orderData: any }) {
    return runControllerAction(async () => {
      return this.service.checkout(getOrgId(body.orgId), body.orderData);
    });
  }
}
