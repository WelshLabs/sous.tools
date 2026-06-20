export interface SquareModifier {
  type: string;
  id: string;
  modifier_data?: {
    name: string;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareModifierListInfo {
  modifier_list_id: string;
  min_selected_modifiers?: number;
  max_selected_modifiers?: number;
  enabled?: boolean;
}

export interface SquareVariation {
  type: string;
  id: string;
  version?: number;
  item_variation_data?: {
    name?: string;
    pricing_type?: string;
    track_inventory?: boolean;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareItemData {
  name: string;
  description?: string;
  modifier_list_info?: SquareModifierListInfo[];
  variations?: SquareVariation[];
}

export interface SquareModifierListData {
  name: string;
  selection_type?: string;
  modifiers?: SquareModifier[];
}

export interface SquareObject {
  type: string;
  id: string;
  version?: number;
  item_data?: SquareItemData;
  modifier_list_data?: SquareModifierListData;
}

export function mapModifierListToSandbox(ml: SquareObject): SquareObject {
  return {
    type: "MODIFIER_LIST",
    id: `#modlist_${ml.id}`,
    modifier_list_data: {
      name: ml.modifier_list_data?.name || "Modifiers",
      selection_type: ml.modifier_list_data?.selection_type || "SINGLE",
      modifiers: (ml.modifier_list_data?.modifiers || []).map((m) => ({
        type: "MODIFIER",
        id: `#modifier_${m.id}`,
        modifier_data: {
          name: m.modifier_data?.name || "Option",
          price_money: m.modifier_data?.price_money || { amount: 0, currency: "USD" },
        },
      })),
    },
  };
}

export function mapItemToSandbox(item: SquareObject): SquareObject {
  const mappedModifierInfo = (item.item_data?.modifier_list_info || []).map((info) => ({
    modifier_list_id: `#modlist_${info.modifier_list_id}`,
    min_selected_modifiers: info.min_selected_modifiers,
    max_selected_modifiers: info.max_selected_modifiers,
    enabled: info.enabled,
  }));

  const mappedVariations = (item.item_data?.variations || []).map((v) => ({
    type: "ITEM_VARIATION",
    id: `#var_${v.id}`,
    item_variation_data: {
      name: v.item_variation_data?.name || "Regular",
      pricing_type: v.item_variation_data?.pricing_type || "FIXED_PRICING",
      price_money: v.item_variation_data?.price_money || { amount: 1000, currency: "USD" },
    },
  }));

  return {
    type: "ITEM",
    id: `#item_${item.id}`,
    item_data: {
      name: item.item_data?.name || "Unnamed Item",
      description: item.item_data?.description || "",
      modifier_list_info: mappedModifierInfo,
      variations: mappedVariations,
    },
  };
}
