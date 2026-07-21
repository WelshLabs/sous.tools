import { Module } from "@nestjs/common";
import { Neo4jService } from "./neo4j.service";
import { Neo4jSyncService } from "./neo4j-sync.service";
import { Neo4jSyncController } from "./neo4j-sync.controller";
import { Neo4jSyncRepository } from "./infrastructure/neo4j-sync.repository";

@Module({
  controllers: [Neo4jSyncController],
  providers: [
    Neo4jService,
    Neo4jSyncService,
    {
      provide: "INeo4jSyncRepository",
      useClass: Neo4jSyncRepository,
    },
  ],
  exports: [Neo4jService, Neo4jSyncService, "INeo4jSyncRepository"],
})
export class Neo4jSyncModule {}
