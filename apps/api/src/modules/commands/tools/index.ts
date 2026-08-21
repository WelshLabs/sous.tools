import { AddToPurchaseOrderTool } from "./add-to-purchase-order.tool";
import { AddToWhiteboardTool } from "./add-to-whiteboard.tool";
import { GetRecipeCostTool } from "./get-recipe-cost.tool";
import { UpdateItemStatusTool } from "./update-item-status.tool";
import { AdjustThrottleTimeTool } from "./adjust-throttle-time.tool";
import { ReconcileInventoryTool } from "./reconcile-inventory.tool";
import { IngestDocumentTool } from "./ingest-document.tool";
import { ExecuteCypherQueryTool } from "./execute-cypher-query.tool";
import { RenderUiComponentTool } from "./render-ui-component.tool";
import { EnqueueBackgroundTaskTool } from "./enqueue-background-task.tool";
import { IngestKnowledgeSourceTool } from "./ingest-knowledge-source.tool";
import { SearchTheWebTool } from "./search-the-web.tool";
import { UpdateReviewStateTool } from "./update-review-state.tool";
import { GetPosSalesStatsTool } from "./get-pos-sales-stats.tool";

export {
  AddToPurchaseOrderTool,
  AddToWhiteboardTool,
  GetRecipeCostTool,
  UpdateItemStatusTool,
  AdjustThrottleTimeTool,
  ReconcileInventoryTool,
  IngestDocumentTool,
  ExecuteCypherQueryTool,
  RenderUiComponentTool,
  EnqueueBackgroundTaskTool,
  IngestKnowledgeSourceTool,
  SearchTheWebTool,
  UpdateReviewStateTool,
  GetPosSalesStatsTool,
};

export const ALL_COMMAND_TOOL_PROVIDERS = [
  AddToPurchaseOrderTool,
  AddToWhiteboardTool,
  GetRecipeCostTool,
  UpdateItemStatusTool,
  AdjustThrottleTimeTool,
  ReconcileInventoryTool,
  IngestDocumentTool,
  ExecuteCypherQueryTool,
  RenderUiComponentTool,
  EnqueueBackgroundTaskTool,
  IngestKnowledgeSourceTool,
  SearchTheWebTool,
  UpdateReviewStateTool,
  GetPosSalesStatsTool,
];
