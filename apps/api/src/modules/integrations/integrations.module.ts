import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IntegrationsController } from "./integrations.controller";
import { IntegrationsService } from "./integrations.service";
import { PosWebhookController } from "./pos-webhook.controller";
import { PosSyncProcessor } from "./pos-sync.processor";
import { GoogleDriveService } from "./drivers/google-drive/google-drive.service";
import { SquareDriver } from "./drivers/square/square.driver";

/**
 * Module responsible for third-party integrations and POS synchronization.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: "pos-sync",
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        removeOnComplete: {
          count: 100,
        },
        removeOnFail: {
          count: 500,
        },
      },
    }),
  ],
  controllers: [IntegrationsController, PosWebhookController],
  providers: [IntegrationsService, PosSyncProcessor, GoogleDriveService, SquareDriver],
  exports: [IntegrationsService, GoogleDriveService, SquareDriver],
})
export class IntegrationsModule {}
