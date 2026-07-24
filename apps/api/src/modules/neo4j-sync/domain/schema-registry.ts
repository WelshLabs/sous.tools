export const IGNORED_FIELDS = ["instance_id"];

export interface RelationshipConfig {
  fkField: string;
  relationLabel: string;
  targetLabel: string;
  direction?: "in" | "out";
}

export interface TableConfig {
  isJoinTable?: false;
  nodeLabel: string;
  relationships: RelationshipConfig[];
  customProperties?: (record: Record<string, any>) => Record<string, any>;
}

export interface JoinTableConfig {
  isJoinTable: true;
  relationLabel: string;
  source: {
    fkField: string;
    targetLabel: string;
  };
  target: {
    fkField: string;
    targetLabel: string;
  };
  customProperties?: (record: Record<string, any>) => Record<string, any>;
}

export type RegistryConfig = TableConfig | JoinTableConfig;

export const SCHEMA_REGISTRY: Record<string, RegistryConfig> = {
  users: {
    nodeLabel: "User",
    relationships: [],
    customProperties: (record) => {
      const rawMeta = record.raw_user_meta_data || {};
      const fullName = rawMeta.full_name || rawMeta.name || null;
      return {
        email: record.email || null,
        role: record.role || null,
        fullName,
        createdAt: record.created_at || null,
        updatedAt: record.updated_at || null,
      };
    },
  },
  user_profiles: {
    nodeLabel: "UserProfile",
    relationships: [
      { fkField: "user_id", relationLabel: "PROFILE_OF", targetLabel: "User" },
    ],
  },
  organizations: {
    nodeLabel: "Organization",
    relationships: [],
  },
  org_members: {
    isJoinTable: true,
    relationLabel: "MEMBER_OF",
    source: { fkField: "user_id", targetLabel: "User" },
    target: { fkField: "organization_id", targetLabel: "Organization" },
    customProperties: (record) => ({
      role: record.role || "MEMBER",
      createdAt: record.created_at || null,
    }),
  },
  integrations: {
    nodeLabel: "Integration",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  signage_devices: {
    nodeLabel: "SignageDevice",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  signage_decks: {
    nodeLabel: "SignageDeck",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  signage_layouts: {
    nodeLabel: "SignageLayout",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  signage_displays: {
    nodeLabel: "SignageDisplay",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "layout_id", relationLabel: "HAS_LAYOUT", targetLabel: "SignageLayout" },
    ],
  },
  vessel_profiles: {
    nodeLabel: "VesselProfile",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  master_items: {
    nodeLabel: "MasterItem",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },

  recipe_categories: {
    nodeLabel: "RecipeCategory",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  recipe_tags: {
    nodeLabel: "RecipeTag",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  recipes: {
    nodeLabel: "Recipe",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "vessel_id", relationLabel: "USES_VESSEL", targetLabel: "VesselProfile" },
    ],
  },
  recipe_ingredients: {
    nodeLabel: "RecipeIngredient",
    relationships: [
      { fkField: "recipe_id", relationLabel: "INGREDIENT_OF", targetLabel: "Recipe" },
      { fkField: "master_item_id", relationLabel: "OF_INGREDIENT", targetLabel: "MasterItem" },
      { fkField: "sub_recipe_id", relationLabel: "OF_SUB_RECIPE", targetLabel: "Recipe" },
      { fkField: "item_id", relationLabel: "OF_ITEM", targetLabel: "Item" },
    ],
  },
  recipe_tag_assignments: {
    isJoinTable: true,
    relationLabel: "HAS_TAG",
    source: { fkField: "recipe_id", targetLabel: "Recipe" },
    target: { fkField: "tag_id", targetLabel: "RecipeTag" },
  },
  formula_versions: {
    nodeLabel: "FormulaVersion",
    relationships: [
      { fkField: "recipe_id", relationLabel: "VERSION_OF", targetLabel: "Recipe" },
    ],
  },
  recipe_nutrition_cache: {
    nodeLabel: "RecipeNutritionCache",
    relationships: [
      { fkField: "recipe_id", relationLabel: "NUTRITION_OF", targetLabel: "Recipe" },
    ],
  },
  vendors: {
    nodeLabel: "Vendor",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  whiteboard_items: {
    nodeLabel: "WhiteboardItem",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  purchase_orders: {
    nodeLabel: "PurchaseOrder",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "vendor_id", relationLabel: "PLACED_WITH", targetLabel: "Vendor" },
    ],
  },
  purchase_order_items: {
    nodeLabel: "PurchaseOrderItem",
    relationships: [
      { fkField: "po_id", relationLabel: "PART_OF", targetLabel: "PurchaseOrder" },
    ],
  },
  pos_items: {
    nodeLabel: "PosItem",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "category_id", relationLabel: "IN_CATEGORY", targetLabel: "PosCategory" },
    ],
  },
  pos_categories: {
    nodeLabel: "PosCategory",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  pos_modifier_groups: {
    nodeLabel: "PosModifierGroup",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  pos_modifier_options: {
    nodeLabel: "PosModifierOption",
    relationships: [
      { fkField: "modifier_group_id", relationLabel: "PART_OF_GROUP", targetLabel: "PosModifierGroup" },
    ],
  },
  pos_item_modifier_groups: {
    isJoinTable: true,
    relationLabel: "HAS_MODIFIER_GROUP",
    source: { fkField: "pos_item_id", targetLabel: "PosItem" },
    target: { fkField: "modifier_group_id", targetLabel: "PosModifierGroup" },
  },
  pos_item_local_overlays: {
    nodeLabel: "PosItemLocalOverlay",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "item_id", relationLabel: "OVERLAYS_ITEM", targetLabel: "PosItem" },
    ],
  },
  pos_transactions: {
    nodeLabel: "PosTransaction",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "pos_item_id", relationLabel: "FOR_POS_ITEM", targetLabel: "PosItem" },
    ],
  },
  pos_item_recipe_links: {
    isJoinTable: true,
    relationLabel: "LINKED_TO_RECIPE",
    source: { fkField: "pos_item_id", targetLabel: "PosItem" },
    target: { fkField: "recipe_id", targetLabel: "Recipe" },
  },
  items: {
    nodeLabel: "Item",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  price_history: {
    nodeLabel: "PriceHistory",
    relationships: [
      { fkField: "item_id", relationLabel: "PRICE_OF", targetLabel: "Item" },
    ],
  },
  wastage_ledger: {
    nodeLabel: "WastageLedger",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "item_id", relationLabel: "WASTED_ITEM", targetLabel: "Item" },
    ],
  },
  inventory_on_hand: {
    nodeLabel: "InventoryOnHand",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "item_id", relationLabel: "OF_ITEM", targetLabel: "Item" },
    ],
  },
  container_mapping: {
    nodeLabel: "ContainerMapping",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "vessel_id", relationLabel: "MAPPED_VESSEL", targetLabel: "VesselProfile" },
    ],
  },
  par_level_suggestions: {
    nodeLabel: "ParLevelSuggestion",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "item_id", relationLabel: "SUGGESTED_FOR", targetLabel: "Item" },
    ],
  },
  ingestion_reviews: {
    nodeLabel: "IngestionReview",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "user_id", relationLabel: "REVIEWED_BY", targetLabel: "User" },
    ],
  },
  vendor_item_aliases: {
    nodeLabel: "VendorItemAlias",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "vendor_id", relationLabel: "BELONGS_TO_VENDOR", targetLabel: "Vendor" },
      { fkField: "internal_item_id", relationLabel: "ALIAS_OF", targetLabel: "Item" },
    ],
  },
  notifications: {
    nodeLabel: "Notification",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "user_id", relationLabel: "NOTIFIED_USER", targetLabel: "User" },
    ],
  },
  pos_discounts: {
    nodeLabel: "PosDiscount",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  pos_orders: {
    nodeLabel: "PosOrder",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
    ],
  },
  pos_order_line_items: {
    isJoinTable: true,
    relationLabel: "CONTAINS_ITEM",
    source: { fkField: "pos_order_id", targetLabel: "PosOrder" },
    target: { fkField: "pos_item_id", targetLabel: "PosItem" },
    customProperties: (record) => ({
      quantity: record.quantity ? parseFloat(record.quantity) : 1,
      basePriceMoney: record.base_price_money ? parseFloat(record.base_price_money) : 0,
      grossSalesMoney: record.gross_sales_money ? parseFloat(record.gross_sales_money) : 0,
    }),
  },
  tickets: {
    nodeLabel: "Ticket",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "employee_id", relationLabel: "SOLD_BY", targetLabel: "User" },
    ],
  },
  orders: {
    nodeLabel: "Order",
    relationships: [
      { fkField: "ticket_id", relationLabel: "PART_OF", targetLabel: "Ticket" },
    ],
  },
  order_items: {
    nodeLabel: "OrderItem",
    relationships: [
      { fkField: "order_id", relationLabel: "PART_OF", targetLabel: "Order" },
      { fkField: "recipe_id", relationLabel: "OF_RECIPE", targetLabel: "Recipe" },
    ],
  },
  shifts: {
    nodeLabel: "Shift",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "user_id", relationLabel: "WORKED_BY", targetLabel: "User" },
    ],
  },
  time_clocks: {
    nodeLabel: "TimeClock",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "user_id", relationLabel: "CLOCKED_BY", targetLabel: "User" },
    ],
  },
  invoices: {
    nodeLabel: "Invoice",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "vendor_id", relationLabel: "FROM_VENDOR", targetLabel: "Vendor" },
      { fkField: "po_id", relationLabel: "RECONCILES", targetLabel: "PurchaseOrder" },
    ],
  },
  invoice_items: {
    nodeLabel: "InvoiceItem",
    relationships: [
      { fkField: "invoice_id", relationLabel: "PART_OF", targetLabel: "Invoice" },
      { fkField: "item_id", relationLabel: "OF_ITEM", targetLabel: "Item" },
    ],
  },
  wastage_logs: {
    nodeLabel: "WastageLog",
    relationships: [
      { fkField: "organization_id", relationLabel: "BELONGS_TO", targetLabel: "Organization" },
      { fkField: "item_id", relationLabel: "WASTED_ITEM", targetLabel: "Item" },
      { fkField: "recipe_id", relationLabel: "WASTED_RECIPE", targetLabel: "Recipe" },
      { fkField: "recorded_by", relationLabel: "REPORTED_BY", targetLabel: "User" },
    ],
  },
};
