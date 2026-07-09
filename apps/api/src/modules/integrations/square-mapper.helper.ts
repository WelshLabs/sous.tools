export interface SquareCatalogObject {
  id: string;
  type: string;
  item_data?: {
    name?: string;
    description?: string;
    modifier_list_info?: Array<{
      modifier_list_id: string;
    }>;
    variations?: Array<{
      id: string;
      item_variation_data?: {
        price_money?: {
          amount: number;
        };
      };
    }>;
  };
  modifier_list_data?: {
    name?: string;
    selection_type?: "SINGLE" | "MULTIPLE";
    modifiers?: Array<{
      id: string;
      modifier_data?: {
        name?: string;
        price_money?: {
          amount: number;
        };
      };
    }>;
  };
}

export interface SquareOrder {
  id: string;
  closed_at?: string;
  created_at?: string;
  line_items?: Array<{
    catalog_object_id: string;
    uid?: string;
    quantity?: string;
    gross_sales_money?: {
      amount: number;
    };
    total_discount_money?: {
      amount: number;
    };
  }>;
}

export interface POSModifierGroupUpsert {
  organization_id: string;
  pos_provider: string;
  external_id: string;
  name: string;
  min_selected_modifiers: number;
  max_selected_modifiers: number;
  updated_at: string;
}

export interface POSModifierOptionUpsert {
  organization_id: string;
  modifier_group_id: string;
  pos_provider: string;
  external_id: string;
  name: string;
  price: number;
  is_sold_out: boolean;
  updated_at: string;
}

export interface POSItemUpsert {
  organization_id: string;
  pos_provider: string;
  external_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_sold_out: boolean;
  updated_at: string;
}

export interface POSItemModifierGroupUpsert {
  pos_item_id: string;
  modifier_group_id: string;
}

export interface POSTransactionUpsert {
  organization_id: string;
  pos_item_id: string | null;
  quantity_sold: number;
  gross_revenue: number;
  discount_amount: number;
  transaction_time: string;
  source: string;
  external_transaction_id: string;
}

export function mapSquareModifierGroups(
  modifierLists: SquareCatalogObject[],
  orgId: string
): POSModifierGroupUpsert[] {
  return modifierLists.map((ml) => ({
    organization_id: orgId,
    pos_provider: "SQUARE",
    external_id: ml.id,
    name: ml.modifier_list_data?.name || "Unnamed Modifier Group",
    min_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 0,
    max_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 99,
    updated_at: new Date().toISOString(),
  }));
}

export function mapSquareModifierOptions(
  modifierLists: SquareCatalogObject[],
  mgMap: Map<string, string>,
  orgId: string
): POSModifierOptionUpsert[] {
  const result: POSModifierOptionUpsert[] = [];
  modifierLists.forEach((ml) => {
    const localGroupId = mgMap.get(ml.id);
    if (!localGroupId) return;

    const modifiers = ml.modifier_list_data?.modifiers || [];
    modifiers.forEach((m) => {
      const priceAmount = m.modifier_data?.price_money?.amount || 0;
      result.push({
        organization_id: orgId,
        modifier_group_id: localGroupId,
        pos_provider: "SQUARE",
        external_id: m.id,
        name: m.modifier_data?.name || "Unnamed Option",
        price: priceAmount / 100,
        is_sold_out: false,
        updated_at: new Date().toISOString(),
      });
    });
  });
  return result;
}

export function mapSquarePosItems(
  items: SquareCatalogObject[],
  countsMap: Record<string, number>,
  orgId: string
): POSItemUpsert[] {
  return items.map((item) => {
    const firstVariation = item.item_data?.variations?.[0];
    const variationId = firstVariation?.id || "";
    const priceAmount = firstVariation?.item_variation_data?.price_money?.amount || 0;
    const price = priceAmount / 100;
    const stockQuantity = countsMap[variationId] !== undefined ? countsMap[variationId] : 1;
    return {
      organization_id: orgId,
      pos_provider: "SQUARE",
      external_id: item.id,
      name: item.item_data?.name || "Unnamed Item",
      description: item.item_data?.description || null,
      price,
      image_url: null,
      is_sold_out: stockQuantity <= 0,
      updated_at: new Date().toISOString(),
    };
  });
}

export function mapSquareItemModifierGroups(
  items: SquareCatalogObject[],
  itemMap: Map<string, string>,
  mgMap: Map<string, string>
): POSItemModifierGroupUpsert[] {
  const result: POSItemModifierGroupUpsert[] = [];
  items.forEach((item) => {
    const localItemId = itemMap.get(item.id);
    if (!localItemId) return;

    const modifierInfo = item.item_data?.modifier_list_info || [];
    modifierInfo.forEach((info) => {
      const localGroupId = mgMap.get(info.modifier_list_id);
      if (localGroupId) {
        result.push({
          pos_item_id: localItemId,
          modifier_group_id: localGroupId,
        });
      }
    });
  });
  return result;
}

export function mapSquareTransactions(
  orders: SquareOrder[],
  itemMap: Map<string, string>,
  orgId: string
): POSTransactionUpsert[] {
  const result: POSTransactionUpsert[] = [];
  orders.forEach((order) => {
    const lineItems = order.line_items || [];
    lineItems.forEach((line, idx: number) => {
      const externalItemId = line.catalog_object_id;
      const posItemId = itemMap.get(externalItemId) || null;

      const grossRevenue = (line.gross_sales_money?.amount || 0) / 100;
      const discountAmount = (line.total_discount_money?.amount || 0) / 100;

      result.push({
        organization_id: orgId,
        pos_item_id: posItemId,
        quantity_sold: parseInt(line.quantity || "1", 10),
        gross_revenue: grossRevenue,
        discount_amount: discountAmount,
        transaction_time: order.closed_at || order.created_at || new Date().toISOString(),
        source: "square",
        external_transaction_id: `${order.id}_${line.uid || idx}`,
      });
    });
  });
  return result;
}
