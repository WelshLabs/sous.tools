import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionProcessor } from "./ingestion.processor";
import { IntegrationsModule } from "../integrations/integrations.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
    IntegrationsModule,
  ],
  controllers: [IngestionController],
  providers: [IngestionProcessor],
})
export class IngestionModule {}
