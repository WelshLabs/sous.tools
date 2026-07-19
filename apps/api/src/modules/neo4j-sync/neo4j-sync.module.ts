import { Module } from "@nestjs/common";
import { Neo4jService } from "./neo4j.service";
import { Neo4jSyncService } from "./neo4j-sync.service";
import { Neo4jSyncController } from "./neo4j-sync.controller";

@Module({
  controllers: [Neo4jSyncController],
  providers: [Neo4jService, Neo4jSyncService],
  exports: [Neo4jService, Neo4jSyncService],
})
export class Neo4jSyncModule {}
