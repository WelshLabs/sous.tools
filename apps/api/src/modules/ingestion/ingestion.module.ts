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
import { config } from "@soustools/config";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
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

