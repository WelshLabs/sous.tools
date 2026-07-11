import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, SquareInventoryCount } from "./square-client.helper";
import { 
  SquareCatalogObject, SquareOrder,
  mapSquareModifierGroups,
  mapSquareModifierOptions,
  mapSquarePosItems,
  mapSquareItemModifierGroups,
  mapSquareTransactions,
  mapSquareCategories,
  mapSquareDiscounts,
  mapSquareOrders
} from "./square-mapper.helper";

export { getSquareBaseUrl, getVariationAndLocationId } from "./square-client.helper";
export { seedSquareCatalog } from "./square-seed.helper";

export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // 1. Fetch Catalog Items, Modifier Lists, Categories & Discounts
  const listRes = await fetch(`${baseUrl}/v2/catalog/list?types=ITEM,MODIFIER_LIST,CATEGORY,DISCOUNT`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) {
    throw new Error(`Square catalog list failed: ${await listRes.text()}`);
  }
  const listData = (await listRes.json()) as { objects?: SquareCatalogObject[] };
  const objects = listData.objects || [];

  const items = objects.filter((o) => o.type === "ITEM");
  const modifierLists = objects.filter((o) => o.type === "MODIFIER_LIST");
  const categories = objects.filter((o) => o.type === "CATEGORY");
  const discounts = objects.filter((o) => o.type === "DISCOUNT");

  // 2. Fetch Inventory Counts for Variation IDs
  const variationIds = items.flatMap((item) =>
    (item.item_data?.variations || []).map((v) => v.id)
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

  // 3. Upsert Categories & Discounts
  const categoriesToUpsert = mapSquareCategories(categories, orgId);
  if (categoriesToUpsert.length > 0) {
    const { error: catErr } = await supabaseClient
      .from("pos_categories")
      .upsert(categoriesToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (catErr) console.error(`Failed to upsert categories: ${catErr.message}`);
  }

  const { data: dbCategories } = await supabaseClient
    .from("pos_categories")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  const catMap = new Map((dbCategories || []).map((c) => [c.external_id, c.id]));

  const discountsToUpsert = mapSquareDiscounts(discounts, orgId);
  if (discountsToUpsert.length > 0) {
    const { error: discErr } = await supabaseClient
      .from("pos_discounts")
      .upsert(discountsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (discErr) console.error(`Failed to upsert discounts: ${discErr.message}`);
  }

  // 4. Upsert Modifier Groups
  const modifierGroupsToUpsert = mapSquareModifierGroups(modifierLists, orgId);
  if (modifierGroupsToUpsert.length > 0) {
    const { error: mgErr } = await supabaseClient
      .from("pos_modifier_groups")
      .upsert(modifierGroupsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (mgErr) console.error(`Failed to upsert modifier groups: ${mgErr.message}`);
  }

  const { data: dbModifierGroups } = await supabaseClient
    .from("pos_modifier_groups")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const mgMap = new Map((dbModifierGroups || []).map((g) => [g.external_id, g.id]));

  // 5. Upsert Modifier Options
  const modifierOptionsToUpsert = mapSquareModifierOptions(modifierLists, mgMap, orgId);
  if (modifierOptionsToUpsert.length > 0) {
    const { error: moErr } = await supabaseClient
      .from("pos_modifier_options")
      .upsert(modifierOptionsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (moErr) console.error(`Failed to upsert modifier options: ${moErr.message}`);
  }

  // 6. Upsert POS Items
  const posItemsToUpsert = mapSquarePosItems(items, countsMap, catMap, orgId);
  if (posItemsToUpsert.length > 0) {
    const { error: itemErr } = await supabaseClient
      .from("pos_items")
      .upsert(posItemsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (itemErr) throw new Error(`Failed to upsert POS items: ${itemErr.message}`);
  }

  const { data: dbPosItems } = await supabaseClient
    .from("pos_items")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const itemMap = new Map((dbPosItems || []).map((i) => [i.external_id, i.id]));

  // 7. Upsert POS Item Modifier Groups
  const itemModifierGroupsToUpsert = mapSquareItemModifierGroups(items, itemMap, mgMap);
  if (itemModifierGroupsToUpsert.length > 0) {
    await supabaseClient
      .from("pos_item_modifier_groups")
      .upsert(itemModifierGroupsToUpsert, { onConflict: "pos_item_id,modifier_group_id" });
  }

  // 8. Sync Transactions / Orders
  await syncSquareTransactions(accessToken, orgId, supabaseClient, itemMap);
}

async function syncSquareTransactions(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient,
  itemMap: Map<string, string>
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!locRes.ok) return;
  const locData = (await locRes.json()) as { locations?: Array<{ id: string; status: string }> };
  const locationIds = (locData.locations || []).filter((l) => l.status === "ACTIVE").map((l) => l.id);

  if (locationIds.length === 0) return;

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

  const ordersData = (await ordersRes.json()) as { orders?: SquareOrder[] };
  const orders = ordersData.orders || [];

  const ordersToUpsert = mapSquareOrders(orders, orgId);
  if (ordersToUpsert.length > 0) {
    const { error: ordErr } = await supabaseClient
      .from("pos_orders")
      .upsert(ordersToUpsert, { onConflict: "organization_id,pos_provider,external_id" });
    if (ordErr) console.error(`Failed to sync orders: ${ordErr.message}`);
  }

  const transactionsToUpsert = mapSquareTransactions(orders, itemMap, orgId);
  if (transactionsToUpsert.length > 0) {
    const { error: txnErr } = await supabaseClient
      .from("pos_transactions")
      .upsert(transactionsToUpsert, { onConflict: "external_transaction_id" });
    if (txnErr) console.error(`Failed to sync transactions: ${txnErr.message}`);
  }
}

