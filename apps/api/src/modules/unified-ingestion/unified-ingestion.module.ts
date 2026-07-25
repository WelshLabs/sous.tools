import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { UnifiedIngestionController } from "./unified-ingestion.controller";
import { UnifiedIngestionService } from "./unified-ingestion.service";
import { UnifiedIngestionProcessor } from "./unified-ingestion.processor";
import { NutritionModule } from "../nutrition/nutrition.module";
import { Neo4jSyncModule } from "../neo4j-sync/neo4j-sync.module";

import { CommandsModule } from "../commands/commands.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "unified-ingestion",
    }),
    NutritionModule,
    Neo4jSyncModule,
    CommandsModule,
  ],
  controllers: [UnifiedIngestionController],
  providers: [UnifiedIngestionService, UnifiedIngestionProcessor],
  exports: [UnifiedIngestionService],
})
export class UnifiedIngestionModule {}
