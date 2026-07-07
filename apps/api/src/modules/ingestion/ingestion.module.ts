import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcessor } from "./ingestion.processor";
import { IntegrationsModule } from "../integrations/integrations.module";
import { ItemsModule } from "../items/items.module";
import { CloudVisionService } from "./CloudVisionService";
import { OllamaVisionService } from "./OllamaVisionService";
import { config } from "@soustools/config";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
    IntegrationsModule,
    ItemsModule,
  ],
  controllers: [IngestionController],
  providers: [
    IngestionProcessor,
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
  exports: ["IVisionService"],
})
export class IngestionModule {}

