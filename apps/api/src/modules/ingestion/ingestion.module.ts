import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { IngestionService } from "./ingestion.service";
import { IngestionProcessor } from "./ingestion.processor";
import { IngestionResolver } from "./ingestion.resolver";
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
  controllers: [],
  providers: [IngestionService, IngestionProcessor, IngestionResolver],
  exports: [IngestionService],
})
export class IngestionModule {}
