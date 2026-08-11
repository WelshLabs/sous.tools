export interface SquareCatalogObject {
  id: string;
  type: string;
  item_data?: {
    name?: string;
    description?: string;
    category_id?: string;
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
  category_data?: {
    name: string;
  };
  discount_data?: {
    name: string;
    discount_type: string;
    percentage?: string;
    amount_money?: {
      amount: number;
    };
  };
}

export interface SquareOrder {
  id: string;
  location_id?: string;
  state?: string;
  closed_at?: string;
  created_at?: string;
  total_money?: {
    amount: number;
  };
  total_discount_money?: {
    amount: number;
  };
  total_tax_money?: {
    amount: number;
  };
  total_tip_money?: {
    amount: number;
  };
  tenders?: Array<{
    processing_fee_money?: {
      amount: number;
    };
  }>;
  fulfillments?: Array<{
    state?: string;
    completed_at?: string;
    picked_up_at?: string;
  }>;
  line_items?: Array<{
    catalog_object_id?: string;
    name?: string;
    uid?: string;
    quantity?: string;
    base_price_money?: {
      amount: number;
    };
    gross_sales_money?: {
      amount: number;
    };
    total_discount_money?: {
      amount: number;
    };
  }>;
}

export interface POSOrderLineItemUpsert {
  organization_id: string;
  pos_order_id: string;
  pos_item_id: string | null;
  external_id: string;
  name: string;
  quantity: number;
  base_price_money: number;
  gross_sales_money: number;
  total_discount_money: number;
  updated_at: string;
}

export interface POSCategoryUpsert {
  organization_id: string;
  pos_provider: string;
  external_id: string;
  name: string;
  updated_at: string;
}

export interface POSDiscountUpsert {
  organization_id: string;
  pos_provider: string;
  external_id: string;
  name: string;
  discount_type: string;
  amount_or_percentage: number;
  updated_at: string;
}

export interface POSOrderUpsert {
  organization_id: string;
  pos_provider: string;
  external_id: string;
  location_id: string | null;
  state: string;
  total_money: number;
  total_discount_money: number;
  total_tax_money: number;
  total_tip_money: number;
  total_processing_fee_money: number;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
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
  category_id?: string | null;
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

export function mapSquareCategories(
  categories: SquareCatalogObject[],
  orgId: string
): POSCategoryUpsert[] {
  return categories.map((cat) => ({
    organization_id: orgId,
    pos_provider: "SQUARE",
    external_id: cat.id,
    name: cat.category_data?.name || "Unnamed Category",
    updated_at: new Date().toISOString(),
  }));
}

export function mapSquareDiscounts(
  discounts: SquareCatalogObject[],
  orgId: string
): POSDiscountUpsert[] {
  return discounts.map((disc) => {
    let amountOrPercent = 0;
    if (disc.discount_data?.discount_type === "FIXED_PERCENTAGE" && disc.discount_data.percentage) {
      amountOrPercent = parseFloat(disc.discount_data.percentage);
    } else if (disc.discount_data?.discount_type === "FIXED_AMOUNT" && disc.discount_data.amount_money) {
      amountOrPercent = disc.discount_data.amount_money.amount / 100;
    }
    
    return {
      organization_id: orgId,
      pos_provider: "SQUARE",
      external_id: disc.id,
      name: disc.discount_data?.name || "Unnamed Discount",
      discount_type: disc.discount_data?.discount_type || "UNKNOWN",
      amount_or_percentage: amountOrPercent,
      updated_at: new Date().toISOString(),
    };
  });
}

export function mapSquareOrders(
  orders: SquareOrder[],
  orgId: string,
  feeMap?: Map<string, number>
): POSOrderUpsert[] {
  return orders.map((order) => ({
    organization_id: orgId,
    pos_provider: "SQUARE",
    external_id: order.id,
    location_id: order.location_id || null,
    state: order.state || "UNKNOWN",
    total_money: (order.total_money?.amount || 0) / 100,
    total_discount_money: (order.total_discount_money?.amount || 0) / 100,
    total_tax_money: (order.total_tax_money?.amount || 0) / 100,
    total_tip_money: (order.total_tip_money?.amount || 0) / 100,
    total_processing_fee_money: (() => {
      if (feeMap && feeMap.has(order.id)) {
        return (feeMap.get(order.id) || 0) / 100;
      }
      return 0;
    })(),
    closed_at: (() => {
      // If a fulfillment exists and was completed, use its timestamp
      if (order.fulfillments && order.fulfillments.length > 0) {
        const completedFulfillment = order.fulfillments.find(f => f.state === "COMPLETED");
        if (completedFulfillment && (completedFulfillment.completed_at || completedFulfillment.picked_up_at)) {
          return completedFulfillment.completed_at || completedFulfillment.picked_up_at || null;
        }
      }
      return order.closed_at || null;
    })(),
    created_at: order.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
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
  catMap: Map<string, string>,
  orgId: string
): POSItemUpsert[] {
  return items.map((item) => {
    const firstVariation = item.item_data?.variations?.[0];
    const variationId = firstVariation?.id || "";
    const priceAmount = firstVariation?.item_variation_data?.price_money?.amount || 0;
    const price = priceAmount / 100;
    const stockQuantity = countsMap[variationId] !== undefined ? countsMap[variationId] : 1;
    
    let localCategoryId = null;
    const sqCatId =
      item.item_data?.category_id ||
      (item.item_data as any)?.categories?.[0]?.id ||
      (item.item_data as any)?.reporting_category?.id;
    if (sqCatId) {
      localCategoryId = catMap.get(sqCatId) || null;
    }

    return {
      organization_id: orgId,
      category_id: localCategoryId,
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
      const externalItemId = line.catalog_object_id || "";
      const posItemId = externalItemId ? (itemMap.get(externalItemId) || null) : null;

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

export function mapSquareOrderLineItems(
  orders: SquareOrder[],
  orderMap: Map<string, string>,
  itemMap: Map<string, string>,
  orgId: string
): POSOrderLineItemUpsert[] {
  const result: POSOrderLineItemUpsert[] = [];
  orders.forEach((order) => {
    const posOrderId = orderMap.get(order.id);
    if (!posOrderId) return;

    const lineItems = order.line_items || [];
    lineItems.forEach((line, idx: number) => {
      const externalItemId = line.catalog_object_id || "";
      const posItemId = externalItemId ? (itemMap.get(externalItemId) || null) : null;

      const basePrice = (line.base_price_money?.amount || 0) / 100;
      const grossSales = (line.gross_sales_money?.amount || 0) / 100;
      const totalDiscount = (line.total_discount_money?.amount || 0) / 100;
      const quantity = parseFloat(line.quantity || "1");

      result.push({
        organization_id: orgId,
        pos_order_id: posOrderId,
        pos_item_id: posItemId,
        external_id: line.uid || `line_${idx}`,
        name: line.name || "Unnamed Item",
        quantity: isNaN(quantity) ? 1 : quantity,
        base_price_money: basePrice,
        gross_sales_money: grossSales,
        total_discount_money: totalDiscount,
        updated_at: new Date().toISOString(),
      });
    });
  });
  return result;
}


