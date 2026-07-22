import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcessor } from "./ingestion.processor";
import { IngestionGateway } from "./ingestion.gateway";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ItemsModule } from "../items/items.module";
import { NutritionModule } from "../nutrition/nutrition.module";
import { CloudVisionService } from "./CloudVisionService";
import { OllamaVisionService } from "./OllamaVisionService";
import { NormalizationService } from "./normalization.service";
import { serverConfig as config } from "@soustools/config/server";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
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
    IntegrationsModule,
    ItemsModule,
    NutritionModule,
  ],
  controllers: [IngestionController],
  providers: [
    IngestionProcessor,
    IngestionGateway,
    NormalizationService,
    {
      provide: "IVisionService",
      useFactory: () => {
        if (config.VISION_PROVIDER === "ollama") {
          return new OllamaVisionService();
        }
        return new CloudVisionService();
      },
    },
  ],
  exports: ["IVisionService", NormalizationService],
})
export class IngestionModule {}

