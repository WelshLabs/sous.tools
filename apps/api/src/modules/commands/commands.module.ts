import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { CommandsController } from "./commands.controller";
import { CommandsService } from "./commands.service";
import { CommandsGateway } from "./commands.gateway";
import { CommandsResolver } from "./commands.resolver";
import { ChatPersistenceService } from "./chat-persistence.service";
import { ToolRegistryService } from "./tool-registry.service";
import { ALL_COMMAND_TOOL_PROVIDERS } from "./tools";
import { ItemsModule } from "../items/items.module";
import { RecipeModule } from "../recipe/recipe.module";
import { Neo4jSyncModule } from "../neo4j-sync/neo4j-sync.module";

@Module({
  imports: [
    DiscoveryModule,
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
    ToolRegistryService,
    CommandsService,
    CommandsGateway,
    CommandsResolver,
    ChatPersistenceService,
    ...ALL_COMMAND_TOOL_PROVIDERS,
  ],
  exports: [
    ToolRegistryService,
    CommandsService,
    CommandsGateway,
    ChatPersistenceService,
  ],
})
export class CommandsModule {}
