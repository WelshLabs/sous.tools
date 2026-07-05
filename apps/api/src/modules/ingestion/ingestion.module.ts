import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcessor } from "./ingestion.processor";
import { IntegrationsModule } from "../integrations/integrations.module";
import { CloudVisionService } from "./CloudVisionService";
import { OllamaVisionService } from "./OllamaVisionService";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
    IntegrationsModule,
  ],
  controllers: [IngestionController],
  providers: [
    IngestionProcessor,
    {
      provide: "IVisionService",
      useFactory: () => {
        if (process.env.VISION_PROVIDER === "ollama") {
          return new OllamaVisionService();
        }
        return new CloudVisionService();
      },
    },
  ],
  exports: ["IVisionService"],
})
export class IngestionModule {}

