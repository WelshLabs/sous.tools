import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, SquareInventoryCount } from "./square-client.helper";
import {
  SquareCatalogObject,
  SquareOrder,
  mapSquareModifierGroups,
  mapSquareModifierOptions,
  mapSquarePosItems,
  mapSquareItemModifierGroups,
  mapSquareTransactions,
  mapSquareCategories,
  mapSquareDiscounts,
  mapSquareOrders,
  mapSquareOrderLineItems,
} from "./square-mapper.helper";

export {
  getSquareBaseUrl,
  getVariationAndLocationId,
} from "./square-client.helper";

async function bulkUpsert<T>(
  supabaseClient: SupabaseClient,
  table: string,
  data: T[],
  onConflict: string,
  chunkSize = 500,
): Promise<void> {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const { error } = await supabaseClient
      .from(table)
      .upsert(chunk as any, { onConflict });
    if (error) {
      console.error(`Failed to bulk upsert into ${table}: ${error.message}`);
    }
  }
}

/**
 * 1. Fetch all catalog objects with pagination cursor.
 */
async function fetchCatalogObjects(
  baseUrl: string,
  accessToken: string,
): Promise<SquareCatalogObject[]> {
  const allObjects: SquareCatalogObject[] = [];
  let cursor: string | undefined = undefined;

  do {
    const url = new URL(`${baseUrl}/v2/catalog/list`);
    url.searchParams.set("types", "ITEM,MODIFIER_LIST,CATEGORY,DISCOUNT");
    if (cursor) url.searchParams.set("cursor", cursor);

    const listRes = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!listRes.ok) {
      throw new Error(`Square catalog list failed: ${await listRes.text()}`);
    }

    const listData = (await listRes.json()) as {
      objects?: SquareCatalogObject[];
      cursor?: string;
    };
    if (listData.objects && listData.objects.length > 0) {
      allObjects.push(...listData.objects);
    }
    cursor = listData.cursor;
  } while (cursor);

  return allObjects;
}

/**
 * 2. Fetch inventory counts for variation IDs in chunks of 100.
 */
async function fetchInventoryCounts(
  baseUrl: string,
  accessToken: string,
  items: SquareCatalogObject[],
): Promise<Record<string, number>> {
  const variationIds = items.flatMap((item) =>
    (item.item_data?.variations || []).map((v) => v.id),
  );
  const countsMap: Record<string, number> = {};

  if (variationIds.length === 0) return countsMap;

  for (let i = 0; i < variationIds.length; i += 100) {
    const chunk = variationIds.slice(i, i + 100);
    const countsRes = await fetch(
      `${baseUrl}/v2/inventory/batch-retrieve-counts`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ catalog_object_ids: chunk }),
      },
    );
    if (countsRes.ok) {
      const countsData = (await countsRes.json()) as {
        counts?: SquareInventoryCount[];
      };
      (countsData.counts || []).forEach((c) => {
        countsMap[c.catalog_object_id] = parseInt(c.quantity || "0", 10);
      });
    }
  }

  return countsMap;
}

/**
 * 3. Sync categories and discounts.
 */
async function syncCategoriesAndDiscounts(
  supabaseClient: SupabaseClient,
  orgId: string,
  categories: SquareCatalogObject[],
  discounts: SquareCatalogObject[],
): Promise<Map<string, string>> {
  const categoriesToUpsert = mapSquareCategories(categories, orgId);
  if (categoriesToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_categories",
      categoriesToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  const { data: dbCategories } = await supabaseClient
    .from("pos_categories")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");

  const catMap = new Map(
    (dbCategories || []).map((c) => [c.external_id, c.id]),
  );

  const discountsToUpsert = mapSquareDiscounts(discounts, orgId);
  if (discountsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_discounts",
      discountsToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  return catMap;
}

/**
 * 4. Sync modifier groups and options.
 */
async function syncModifierGroupsAndOptions(
  supabaseClient: SupabaseClient,
  orgId: string,
  modifierLists: SquareCatalogObject[],
): Promise<Map<string, string>> {
  const modifierGroupsToUpsert = mapSquareModifierGroups(modifierLists, orgId);
  if (modifierGroupsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_modifier_groups",
      modifierGroupsToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  const { data: dbModifierGroups } = await supabaseClient
    .from("pos_modifier_groups")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");

  const mgMap = new Map(
    (dbModifierGroups || []).map((g) => [g.external_id, g.id]),
  );

  const modifierOptionsToUpsert = mapSquareModifierOptions(
    modifierLists,
    mgMap,
    orgId,
  );
  if (modifierOptionsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_modifier_options",
      modifierOptionsToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  return mgMap;
}

/**
 * 5. Sync POS items and build dual ID mapping (Item ID & Variation IDs -> local pos_item.id).
 */
async function syncPosItems(
  supabaseClient: SupabaseClient,
  orgId: string,
  items: SquareCatalogObject[],
  countsMap: Record<string, number>,
  catMap: Map<string, string>,
): Promise<Map<string, string>> {
  const posItemsToUpsert = mapSquarePosItems(items, countsMap, catMap, orgId);
  if (posItemsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_items",
      posItemsToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  const { data: dbPosItems } = await supabaseClient
    .from("pos_items")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");

  const itemMap = new Map<string, string>();
  const dbItemMap = new Map(
    (dbPosItems || []).map((i) => [i.external_id, i.id]),
  );

  dbItemMap.forEach((localId, extItemId) => {
    itemMap.set(extItemId, localId);
  });

  items.forEach((item) => {
    const localId = dbItemMap.get(item.id);
    if (localId && item.item_data?.variations) {
      item.item_data.variations.forEach((v) => {
        if (v.id) itemMap.set(v.id, localId);
      });
    }
  });

  return itemMap;
}

/**
 * 6. Sync relations between items and modifier groups.
 */
async function syncItemModifierGroups(
  supabaseClient: SupabaseClient,
  items: SquareCatalogObject[],
  itemMap: Map<string, string>,
  mgMap: Map<string, string>,
): Promise<void> {
  const itemModifierGroupsToUpsert = mapSquareItemModifierGroups(
    items,
    itemMap,
    mgMap,
  );
  if (itemModifierGroupsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_item_modifier_groups",
      itemModifierGroupsToUpsert,
      "pos_item_id,modifier_group_id",
    );
  }
}

/**
 * 7. Sync orders and sales transactions.
 */
async function syncSquareTransactions(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient,
  itemMap: Map<string, string>,
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!locRes.ok) return;
  const locData = (await locRes.json()) as {
    locations?: Array<{ id: string; status: string }>;
  };
  const locationIds = (locData.locations || [])
    .filter((l) => l.status === "ACTIVE")
    .map((l) => l.id);

  if (locationIds.length === 0) return;

  const beginTime = new Date(Date.now() - 1000 * 3600 * 24 * 30).toISOString();
  const allOrders: SquareOrder[] = [];
  let orderCursor: string | undefined = undefined;

  do {
    const bodyPayload: Record<string, any> = {
      location_ids: locationIds,
      query: {
        filter: {
          date_time_filter: { created_at: { start_at: beginTime } },
          state_filter: { states: ["COMPLETED"] },
        },
        sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
      },
    };
    if (orderCursor) bodyPayload.cursor = orderCursor;

    const ordersRes = await fetch(`${baseUrl}/v2/orders/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!ordersRes.ok) {
      console.error(`Square orders search failed: ${await ordersRes.text()}`);
      break;
    }

    const ordersData = (await ordersRes.json()) as {
      orders?: SquareOrder[];
      cursor?: string;
    };
    if (ordersData.orders && ordersData.orders.length > 0) {
      allOrders.push(...ordersData.orders);
    }
    orderCursor = ordersData.cursor;
  } while (orderCursor);

  const ordersToUpsert = mapSquareOrders(allOrders, orgId);
  if (ordersToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_orders",
      ordersToUpsert,
      "organization_id,pos_provider,external_id",
    );
  }

  const { data: dbOrders } = await supabaseClient
    .from("pos_orders")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");

  const orderMap = new Map((dbOrders || []).map((o) => [o.external_id, o.id]));

  const lineItemsToUpsert = mapSquareOrderLineItems(
    allOrders,
    orderMap,
    itemMap,
    orgId,
  );
  if (lineItemsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_order_line_items",
      lineItemsToUpsert,
      "pos_order_id,external_id",
    );
  }

  const transactionsToUpsert = mapSquareTransactions(allOrders, itemMap, orgId);
  if (transactionsToUpsert.length > 0) {
    await bulkUpsert(
      supabaseClient,
      "pos_transactions",
      transactionsToUpsert,
      "external_transaction_id",
    );
  }
}

/**
 * Main orchestration function for syncing Square catalog, inventory, orders & transactions.
 */
export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient,
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  const allObjects = await fetchCatalogObjects(baseUrl, accessToken);

  const items = allObjects.filter((o) => o.type === "ITEM");
  const modifierLists = allObjects.filter((o) => o.type === "MODIFIER_LIST");
  const categories = allObjects.filter((o) => o.type === "CATEGORY");
  const discounts = allObjects.filter((o) => o.type === "DISCOUNT");

  const countsMap = await fetchInventoryCounts(baseUrl, accessToken, items);
  const catMap = await syncCategoriesAndDiscounts(supabaseClient, orgId, categories, discounts);
  const mgMap = await syncModifierGroupsAndOptions(supabaseClient, orgId, modifierLists);
  const itemMap = await syncPosItems(supabaseClient, orgId, items, countsMap, catMap);

  await syncItemModifierGroups(supabaseClient, items, itemMap, mgMap);
  await syncSquareTransactions(accessToken, orgId, supabaseClient, itemMap);
}
