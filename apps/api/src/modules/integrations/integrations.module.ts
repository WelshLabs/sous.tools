import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";
import { WebhooksController } from "./webhooks.controller";
import { PosSyncProcessor } from "./pos-sync.processor";
import { GoogleDriveService } from "./google-drive.service";

/**
 * Module responsible for third-party integrations and POS synchronization.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: "pos-sync",
    }),
  ],
  controllers: [IntegrationsController, WebhooksController],
  providers: [IntegrationsService, PosSyncProcessor, GoogleDriveService],
  exports: [IntegrationsService, GoogleDriveService],
})
export class IntegrationsModule {}
