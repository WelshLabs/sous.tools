import { Module } from "@nestjs/common";
import { CommandsController } from "./commands.controller";
import { CommandsService } from "./commands.service";
import { CommandsGateway } from "./commands.gateway";
import { CommandsResolver } from "./commands.resolver";
import { ChatPersistenceService } from "./chat-persistence.service";
import { ItemsModule } from "../items/items.module";
import { RecipeModule } from "../recipe/recipe.module";
import { Neo4jSyncModule } from "../neo4j-sync/neo4j-sync.module";
import { BullModule } from "@nestjs/bullmq";

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
    ItemsModule,
    RecipeModule,
    Neo4jSyncModule,
  ],
  controllers: [CommandsController],
  providers: [
    CommandsService,
    CommandsGateway,
    CommandsResolver,
    ChatPersistenceService,
  ],
  exports: [
    CommandsService,
    CommandsGateway,
    CommandsResolver,
    ChatPersistenceService,
  ],
})
export class CommandsModule {}
