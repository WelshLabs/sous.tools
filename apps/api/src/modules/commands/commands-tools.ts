import { Type, FunctionDeclaration } from '@google/genai';

export const addToPurchaseOrderTool: FunctionDeclaration = {
  name: 'add_to_purchase_order',
  description: 'Adds an item to a draft purchase order for a specific vendor.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The name of the item to add' },
      quantity: { type: Type.NUMBER, description: 'The quantity to order' },
      unit: { type: Type.STRING, description: 'The unit of measure (e.g., cases, lbs, unit)' },
      vendorName: { type: Type.STRING, description: 'The name of the vendor' },
    },
    required: ['itemName', 'quantity', 'unit', 'vendorName'],
  },
};

export const addToWhiteboardTool: FunctionDeclaration = {
  name: 'add_to_whiteboard',
  description: 'Adds an item to the kitchen whiteboard when a vendor is not specified or unknown.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: 'The name of the item to add' },
      quantity: { type: Type.NUMBER, description: 'The quantity to order' },
      unit: { type: Type.STRING, description: 'The unit of measure' },
    },
    required: ['itemName', 'quantity', 'unit'],
  },
};

export const getRecipeCostTool: FunctionDeclaration = {
  name: 'get_recipe_cost',
  description: 'Calculates the current cost of a specific recipe.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      recipeId: { type: Type.STRING, description: 'The ID of the recipe' },
    },
    required: ['recipeId'],
  },
};

export const ingestVendorInvoiceTool: FunctionDeclaration = {
  name: 'ingest_vendor_invoice',
  description: 'STRICTLY for vendor/supplier invoices, receipts, and order bills. DO NOT call for books, manuals, or general documentation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fileUrl: { type: Type.STRING, description: 'The URL of the uploaded invoice file' },
    },
    required: ['fileUrl'],
  },
};

export const updateItemStatusTool: FunctionDeclaration = {
  name: 'update_item_status',
  description: 'Updates the status of an item (e.g., 86ing an item by setting it to out_of_stock).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING, description: 'The ID or name of the item' },
      status: { type: Type.STRING, description: 'The new status (e.g., out_of_stock)' },
    },
    required: ['itemId', 'status'],
  },
};

export const adjustThrottleTimeTool: FunctionDeclaration = {
  name: 'adjust_throttle_time',
  description: 'Adjusts the ticket or kitchen throttle time when the kitchen is busy.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      minutes: { type: Type.NUMBER, description: 'The number of minutes to add to the throttle time' },
    },
    required: ['minutes'],
  },
};

export const reconcileInventoryTool: FunctionDeclaration = {
  name: 'reconcile_inventory',
  description: 'Performs an absolute overwrite of an inventory count.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING, description: 'The ID or name of the item' },
      quantity: { type: Type.NUMBER, description: 'The absolute quantity on hand' },
      unit: { type: Type.STRING, description: 'The unit of measure' },
    },
    required: ['itemId', 'quantity', 'unit'],
  },
};


// ─── V1 ReAct Tool Registry ───────────────────────────────────────────────────

export const executeCypherQueryTool: FunctionDeclaration = {
  name: 'execute_cypher_query',
  description: 'Executes a raw Cypher query against the Neo4j Core Matrix to read or write graph data. Use for relationship traversal, knowledge lookups, or schema inspection.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The Cypher query string to execute (e.g., MATCH (n:Ingredient) RETURN n LIMIT 10)',
      },
      params: {
        type: Type.OBJECT,
        description: 'Optional named parameters to bind into the Cypher query (e.g., { "id": "abc-123" })',
      },
    },
    required: ['query'],
  },
};

export const renderUiComponentTool: FunctionDeclaration = {
  name: 'render_ui_component',
  description: 'Instructs the frontend to swap the current chat bubble for a rich interactive component. Use when the response is better represented as a UI widget (e.g., a POS ticket, a metric chart, an ingredient table).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      componentName: {
        type: Type.STRING,
        description: 'The name of the registered frontend component to render (e.g., "PosTicket", "MetricChart", "IngredientTable")',
      },
      props: {
        type: Type.OBJECT,
        description: 'The data props to pass into the component',
      },
    },
    required: ['componentName', 'props'],
  },
};

export const enqueueBackgroundTaskTool: FunctionDeclaration = {
  name: 'enqueue_background_task',
  description: 'Offloads a heavy or long-running operation to the Redis/BullMQ background queue. Use for tasks that would block the real-time response (e.g., bulk PDF parsing, large dataset sync).',
  parameters: {
    type: Type.OBJECT,
    properties: {
      jobName: {
        type: Type.STRING,
        description: 'The registered BullMQ job name (e.g., "process-ingestion", "sync-square-catalog")',
      },
      payload: {
        type: Type.OBJECT,
        description: 'The job payload to enqueue',
      },
      priority: {
        type: Type.NUMBER,
        description: 'Optional job priority (lower number = higher priority). Defaults to 5.',
      },
    },
    required: ['jobName', 'payload'],
  },
};

export const ingestKnowledgeSourceTool: FunctionDeclaration = {
  name: 'ingest_knowledge_source',
  description: 'Parses and ingests a knowledge source (book, URL, PDF) into the Neo4j knowledge graph. Routes to the correct namespace: "tenant" for restaurant-specific data or "global" for shared culinary knowledge.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      sourceUrl: {
        type: Type.STRING,
        description: 'The URL or file URL of the knowledge source to ingest',
      },
      scope: {
        type: Type.STRING,
        description: 'Routing scope: "tenant" (organization-specific) or "global" (shared across all tenants)',
      },
      instructions: {
        type: Type.STRING,
        description: 'Natural language instructions for the parser (e.g., "Extract all recipes and map ingredients to master list")',
      },
      sourceName: {
        type: Type.STRING,
        description: 'Optional human-readable name for the source (e.g., "The French Laundry Cookbook")',
      },
    },
    required: ['sourceUrl', 'scope', 'instructions'],
  },
};

export const searchTheWebTool: FunctionDeclaration = {
  name: 'search_the_web',
  description: 'Searches the internet for missing culinary data such as recipes, ingredient substitutions, or supplier information. Use when internal knowledge is insufficient.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: 'The search query string (e.g., "classic beef bourguignon recipe ingredients")',
      },
      maxResults: {
        type: Type.NUMBER,
        description: 'Maximum number of results to return. Defaults to 5.',
      },
    },
    required: ['query'],
  },
};

export const updateReviewStateTool: FunctionDeclaration = {
  name: 'update_review_state',
  description: 'Dynamically updates page navigation or item mappings on the active UniversalReviewComponent UI based on natural language instructions.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      action: {
        type: Type.STRING,
        description: 'The action type: "TURN_PAGE", "ACCEPT_ALL_PAGE", or "MAP_ITEM"',
      },
      pageNumber: {
        type: Type.NUMBER,
        description: 'The target page number to navigate to (1-indexed)',
      },
      itemIndex: {
        type: Type.NUMBER,
        description: 'The zero-indexed or 1-indexed item number to map',
      },
      targetName: {
        type: Type.STRING,
        description: 'Target master item or ingredient name',
      },
    },
    required: ['action'],
  },
};

export const getPosSalesStatsTool: FunctionDeclaration = {
  name: 'get_pos_sales_stats',
  description: 'Queries real POS orders from Supabase Postgres database to calculate sales totals, order counts, and daily revenue metrics.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      days: { type: Type.NUMBER, description: 'Number of past days to calculate sales for (defaults to 7)' },
    },
  },
};

export const ALL_COMMAND_TOOLS: FunctionDeclaration[] = [
  addToPurchaseOrderTool,
  addToWhiteboardTool,
  getRecipeCostTool,
  ingestVendorInvoiceTool,
  updateItemStatusTool,
  adjustThrottleTimeTool,
  reconcileInventoryTool,
  executeCypherQueryTool,
  renderUiComponentTool,
  enqueueBackgroundTaskTool,
  ingestKnowledgeSourceTool,
  searchTheWebTool,
  updateReviewStateTool,
  getPosSalesStatsTool,
];
