export interface INeo4jSyncRepository {
  upsertNode(label: string, id: string, properties: Record<string, any>): Promise<void>;
  deleteNode(label: string, id: string): Promise<void>;
  createRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
    direction?: "in" | "out",
  ): Promise<void>;
  clearRelationship(
    srcLabel: string,
    srcId: string,
    relationLabel: string,
    direction?: "in" | "out",
  ): Promise<void>;
  createDirectRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
    properties?: Record<string, any>,
  ): Promise<void>;
  deleteRelationship(
    srcLabel: string,
    srcId: string,
    targetLabel: string,
    targetId: string,
    relationLabel: string,
  ): Promise<void>;
}
