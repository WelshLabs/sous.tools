import { Type, type FunctionDeclaration } from '@google/genai';

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
  description: 'Ingests a vendor invoice file URL into the OCR pipeline for processing.',
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

export const ALL_COMMAND_TOOLS: FunctionDeclaration[] = [
  addToPurchaseOrderTool,
  addToWhiteboardTool,
  getRecipeCostTool,
  ingestVendorInvoiceTool,
  updateItemStatusTool,
  adjustThrottleTimeTool,
  reconcileInventoryTool,
];
