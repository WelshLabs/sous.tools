import { type SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, type SquareInventoryCount } from "./square-client.helper";

export { getSquareBaseUrl, getVariationAndLocationId } from "./square-client.helper";
export { seedSquareCatalog } from "./square-seed.helper";

export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // 1. Fetch Catalog Items & Modifier Lists
  const listRes = await fetch(`${baseUrl}/v2/catalog/list?types=ITEM,MODIFIER_LIST`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) {
    throw new Error(`Square catalog list failed: ${await listRes.text()}`);
  }
  const listData = (await listRes.json()) as { objects?: any[] };
  const objects = listData.objects || [];

  const items = objects.filter((o) => o.type === "ITEM");
  const modifierLists = objects.filter((o) => o.type === "MODIFIER_LIST");

  // 2. Fetch Inventory Counts for Variation IDs
  const variationIds = items.flatMap((item) =>
    (item.item_data?.variations || []).map((v: any) => v.id)
  );
  const countsMap: Record<string, number> = {};

  if (variationIds.length > 0) {
    const countsRes = await fetch(`${baseUrl}/v2/inventory/batch-retrieve-counts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ catalog_object_ids: variationIds }),
    });
    if (countsRes.ok) {
      const countsData = (await countsRes.json()) as { counts?: SquareInventoryCount[] };
      (countsData.counts || []).forEach((c) => {
        countsMap[c.catalog_object_id] = parseInt(c.quantity || "0", 10);
      });
    }
  }

  // 3. Upsert Modifier Groups
  const modifierGroupsToUpsert = modifierLists.map((ml) => ({
    organization_id: orgId,
    pos_provider: "SQUARE",
    external_id: ml.id,
    name: ml.modifier_list_data?.name || "Unnamed Modifier Group",
    min_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 0,
    max_selected_modifiers: ml.modifier_list_data?.selection_type === "SINGLE" ? 1 : 99,
    updated_at: new Date().toISOString(),
  }));

  if (modifierGroupsToUpsert.length > 0) {
    const { error: mgErr } = await supabaseClient
      .from("pos_modifier_groups")
      .upsert(modifierGroupsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (mgErr) {
      console.error(`Failed to upsert modifier groups: ${mgErr.message}`);
    }
  }

  // Fetch updated modifier groups to map external_id to local UUID
  const { data: dbModifierGroups } = await supabaseClient
    .from("pos_modifier_groups")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const mgMap = new Map((dbModifierGroups || []).map((g) => [g.external_id, g.id]));

  // 4. Upsert Modifier Options
  const modifierOptionsToUpsert: any[] = [];
  modifierLists.forEach((ml) => {
    const localGroupId = mgMap.get(ml.id);
    if (!localGroupId) return;

    const modifiers = ml.modifier_list_data?.modifiers || [];
    modifiers.forEach((m: any) => {
      const priceAmount = m.modifier_data?.price_money?.amount || 0;
      modifierOptionsToUpsert.push({
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

  if (modifierOptionsToUpsert.length > 0) {
    const { error: moErr } = await supabaseClient
      .from("pos_modifier_options")
      .upsert(modifierOptionsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (moErr) {
      console.error(`Failed to upsert modifier options: ${moErr.message}`);
    }
  }

  // 5. Upsert POS Items
  const posItemsToUpsert = items.map((item) => {
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

  if (posItemsToUpsert.length > 0) {
    const { error: itemErr } = await supabaseClient
      .from("pos_items")
      .upsert(posItemsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (itemErr) {
      throw new Error(`Failed to upsert POS items: ${itemErr.message}`);
    }
  }

  // Fetch updated POS items to map external_id to local UUID
  const { data: dbPosItems } = await supabaseClient
    .from("pos_items")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const itemMap = new Map((dbPosItems || []).map((i) => [i.external_id, i.id]));

  // 6. Upsert POS Item Modifier Groups join table
  const itemModifierGroupsToUpsert: any[] = [];
  items.forEach((item) => {
    const localItemId = itemMap.get(item.id);
    if (!localItemId) return;

    const modifierInfo = item.item_data?.modifier_list_info || [];
    modifierInfo.forEach((info: any) => {
      const localGroupId = mgMap.get(info.modifier_list_id);
      if (localGroupId) {
        itemModifierGroupsToUpsert.push({
          pos_item_id: localItemId,
          modifier_group_id: localGroupId,
        });
      }
    });
  });

  if (itemModifierGroupsToUpsert.length > 0) {
    await supabaseClient
      .from("pos_item_modifier_groups")
      .upsert(itemModifierGroupsToUpsert, { onConflict: "pos_item_id,modifier_group_id" });
  }

  // 7. Sync Transactions / Orders
  await syncSquareTransactions(accessToken, orgId, supabaseClient, itemMap);
}

async function syncSquareTransactions(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient,
  itemMap: Map<string, string>
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // Resolve active locations
  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!locRes.ok) return;
  const locData = (await locRes.json()) as { locations?: Array<{ id: string; status: string }> };
  const locationIds = (locData.locations || []).filter((l) => l.status === "ACTIVE").map((l) => l.id);

  if (locationIds.length === 0) return;

  // Search orders (last 30 days)
  const beginTime = new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString();
  const ordersRes = await fetch(`${baseUrl}/v2/orders/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location_ids: locationIds,
      query: {
        filter: {
          date_time_filter: {
            created_at: {
              start_at: beginTime,
            },
          },
          state_filter: {
            states: ["COMPLETED"],
          },
        },
        sort: {
          sort_field: "CREATED_AT",
          sort_order: "DESC",
        },
      },
    }),
  });

  if (!ordersRes.ok) {
    console.error(`Square orders search failed: ${await ordersRes.text()}`);
    return;
  }

  const ordersData = (await ordersRes.json()) as { orders?: any[] };
  const orders = ordersData.orders || [];

  const transactionsToUpsert: any[] = [];

  orders.forEach((order) => {
    const lineItems = order.line_items || [];
    lineItems.forEach((line: any, idx: number) => {
      // Find corresponding pos_item
      const externalItemId = line.catalog_object_id;
      const posItemId = itemMap.get(externalItemId) || null;

      const grossRevenue = (line.gross_sales_money?.amount || 0) / 100;
      const discountAmount = (line.total_discount_money?.amount || 0) / 100;

      transactionsToUpsert.push({
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

  if (transactionsToUpsert.length > 0) {
    const { error: txnErr } = await supabaseClient
      .from("pos_transactions")
      .upsert(transactionsToUpsert, { onConflict: "external_transaction_id" });
    if (txnErr) {
      console.error(`Failed to sync transactions: ${txnErr.message}`);
    }
  }
}
