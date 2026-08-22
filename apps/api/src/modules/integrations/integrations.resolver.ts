import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { IntegrationsService } from "./integrations.service";
import { GoogleDriveService } from "./drivers/google-drive/google-drive.service";
import { PosGateway } from "../pos/pos.gateway";
import { randomUUID } from "crypto";
import {
  IntegrationStatusGQL,
  GoogleDriveFileGQL,
  GoogleDriveImportResultGQL,
} from "./integrations.types";
import { Optional } from "@nestjs/common";

@Resolver(() => IntegrationStatusGQL)
export class IntegrationsResolver {
  constructor(
    private readonly service: IntegrationsService,
    private readonly driveService: GoogleDriveService,
    @Optional() private readonly posGateway?: PosGateway,
  ) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [IntegrationStatusGQL], { name: "integrationStatuses" })
  async getIntegrationStatuses(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.service.getIntegrationStatus(orgId);
  }

  @Query(() => [GoogleDriveFileGQL], { name: "googleDriveFiles" })
  async getGoogleDriveFiles(
    @Args("query", { nullable: true }) query: string,
    @Args("folderId", { nullable: true }) folderId: string,
    @Context() ctx: any,
  ): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.driveService.listFiles(orgId, query, folderId);
  }

  @Mutation(() => Boolean, { name: "disconnectIntegration" })
  async disconnectIntegration(
    @Args("provider") provider: string,
    @Context() ctx: any,
  ): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    await this.service.disconnect(provider, orgId);
    return true;
  }

  @Mutation(() => Boolean, { name: "syncSquareCatalog" })
  async syncSquareCatalog(@Context() ctx: any): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    await this.service.syncSquareCatalog(orgId);
    this.posGateway?.broadcastCatalogUpdate(orgId);
    this.posGateway?.broadcastOrdersUpdate(orgId);
    return true;
  }

  @Mutation(() => GoogleDriveImportResultGQL, { name: "importGoogleDriveFile" })
  async importGoogleDriveFile(
    @Args("fileId") fileId: string,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    const reviewId = randomUUID();
    const result = await this.driveService.processDriveFile(
      fileId,
      orgId,
      reviewId,
    );
    if (!result.sourceDocumentUrl) {
      throw new Error("Failed to process Google Drive file");
    }
    return {
      url: result.sourceDocumentUrl,
      name: result.sourceName || "Google Drive File",
    };
  }
}
