import { Injectable, Logger } from "@nestjs/common";
import { INeo4jSyncRepository } from "../domain/neo4j-sync.repository.interface";
import { Neo4jService } from "../neo4j.service";

function sanitize(val: string): string {
  // Safe validation - alphanumeric and underscore only for dynamic SQL/Cypher interpolation
  return val.replace(/[^a-zA-Z0-9_]/g, "");
}

@Injectable()
export class Neo4jSyncRepository implements INeo4jSyncRepository {
  private readonly logger = new Logger(Neo4jSyncRepository.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  async upsertNode(
    label: string,
    id: string,
    properties: Record<string, any>,
  ): Promise<void> {
    const cleanLabel = sanitize(label);
    this.logger.log(`Upserting ${cleanLabel} node in Neo4j: ${id}`);
    const query = `
      MERGE (n:${cleanLabel} {id: $id})
      SET n += $properties
    `;
    await this.neo4jService.runQuery(query, { id, properties });
  }

  async deleteNode(label: string, id: string): Promise<void> {
    const cleanLabel = sanitize(label);
    this.logger.log(`Deleting ${cleanLabel} node in Neo4j: ${id}`);
    const query = `
      MATCH (n:${cleanLabel} {id: $id})
      DETACH DELETE n
    `;
    await this.neo4jService.runQuery(query, { id });
  }

  async clearRelationship(
    srcLabel: string,
    srcId: string,
    relationLabel: string,
    direction: "in" | "out" = "out",
  ): Promise<void> {
    const cleanSrc = sanitize(srcLabel);
    const cleanRel = sanitize(relationLabel);

    this.logger.log(
      `Clearing existing relationship of type ${cleanRel} (${
        direction === "in" ? "incoming" : "outgoing"
      }) from ${cleanSrc}:${srcId}`,
    );

    const query =
      direction === "in"
        ? `
        MATCH (src:${cleanSrc} {id: $srcId})<-[r:${cleanRel}]-()
        DELETE r
      `
        : `
        MATCH (src:${cleanSrc} {id: $srcId})-[r:${cleanRel}]->()
        DELETE r
      `;

    await this.neo4jService.runQuery(query, { srcId });
  }

  async createRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
    direction: "in" | "out" = "out",
  ): Promise<void> {
    const cleanSrc = sanitize(srcLabel);
    const cleanTarget = sanitize(targetLabel);
    const cleanRel = sanitize(relationLabel);

    this.logger.log(
      `Creating relationship (${cleanSrc}:${srcId}) ${
        direction === "in" ? "<-" : "-"
      }[:${cleanRel}]${direction === "in" ? "-" : "->"} (${cleanTarget}:${targetId})`,
    );

    const query =
      direction === "in"
        ? `
        MERGE (src:${cleanSrc} {id: $srcId})
        MERGE (target:${cleanTarget} {id: $targetId})
        MERGE (src)<-[:${cleanRel}]-(target)
      `
        : `
        MERGE (src:${cleanSrc} {id: $srcId})
        MERGE (target:${cleanTarget} {id: $targetId})
        MERGE (src)-[:${cleanRel}]->(target)
      `;

    await this.neo4jService.runQuery(query, { srcId, targetId });
  }

  async createDirectRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
    properties: Record<string, any> = {},
  ): Promise<void> {
    const cleanSrc = sanitize(srcLabel);
    const cleanTarget = sanitize(targetLabel);
    const cleanRel = sanitize(relationLabel);

    this.logger.log(
      `Creating direct relationship (${cleanSrc}:${srcId})-[:${cleanRel}]->(${cleanTarget}:${targetId})`,
    );

    const query = `
      MERGE (src:${cleanSrc} {id: $srcId})
      MERGE (target:${cleanTarget} {id: $targetId})
      MERGE (src)-[r:${cleanRel}]->(target)
      SET r += $properties
    `;

    await this.neo4jService.runQuery(query, { srcId, targetId, properties });
  }

  async deleteRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
  ): Promise<void> {
    const cleanSrc = sanitize(srcLabel);
    const cleanTarget = sanitize(targetLabel);
    const cleanRel = sanitize(relationLabel);

    this.logger.log(
      `Deleting relationship (${cleanSrc}:${srcId})-[:${cleanRel}]->(${cleanTarget}:${targetId})`,
    );

    const query = `
      MATCH (src:${cleanSrc} {id: $srcId})-[r:${cleanRel}]->(target:${cleanTarget} {id: $targetId})
      DELETE r
    `;

    await this.neo4jService.runQuery(query, { srcId, targetId });
  }
}
