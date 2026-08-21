import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionController } from "./ingestion.controller";
import { IngestionService } from "./ingestion.service";
import { IngestionProcessor } from "./ingestion.processor";
import { NutritionModule } from "../nutrition/nutrition.module";
import { Neo4jSyncModule } from "../neo4j-sync/neo4j-sync.module";
import { CommandsModule } from "../commands/commands.module";
import { RecipeModule } from "../recipe/recipe.module";

@Module({
  imports: [
    BullModule.registerQueue({
      name: "ingestion",
    }),
    NutritionModule,
    Neo4jSyncModule,
    CommandsModule,
    RecipeModule,
  ],
  controllers: [IngestionController],
  providers: [IngestionService, IngestionProcessor],
  exports: [IngestionService],
})
export class IngestionModule {}
