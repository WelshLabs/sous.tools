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

async function bulkUpsert<T>(
  supabaseClient: SupabaseClient,
  table: string,
  data: T[],
  onConflict: string,
  chunkSize = 500
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

export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const baseUrl = getSquareBaseUrl();

  // 1. Fetch ALL Catalog Items, Modifier Lists, Categories & Discounts with pagination cursor
  const allObjects: SquareCatalogObject[] = [];
  let cursor: string | undefined = undefined;

  do {
    const url = new URL(`${baseUrl}/v2/catalog/list`);
    url.searchParams.set("types", "ITEM,MODIFIER_LIST,CATEGORY,DISCOUNT");
    if (cursor) {
      url.searchParams.set("cursor", cursor);
    }

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

  const items = allObjects.filter((o) => o.type === "ITEM");
  const modifierLists = allObjects.filter((o) => o.type === "MODIFIER_LIST");
  const categories = allObjects.filter((o) => o.type === "CATEGORY");
  const discounts = allObjects.filter((o) => o.type === "DISCOUNT");

  // 2. Fetch Inventory Counts for Variation IDs (chunked in batches of 100)
  const variationIds = items.flatMap((item) =>
    (item.item_data?.variations || []).map((v) => v.id)
  );
  const countsMap: Record<string, number> = {};

  if (variationIds.length > 0) {
    for (let i = 0; i < variationIds.length; i += 100) {
      const chunk = variationIds.slice(i, i + 100);
      const countsRes = await fetch(`${baseUrl}/v2/inventory/batch-retrieve-counts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ catalog_object_ids: chunk }),
      });
      if (countsRes.ok) {
        const countsData = (await countsRes.json()) as { counts?: SquareInventoryCount[] };
        (countsData.counts || []).forEach((c) => {
          countsMap[c.catalog_object_id] = parseInt(c.quantity || "0", 10);
        });
      }
    }
  }

  // 3. Bulk Upsert Categories & Discounts
  const categoriesToUpsert = mapSquareCategories(categories, orgId);
  if (categoriesToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_categories", categoriesToUpsert, "organization_id,pos_provider,external_id");
  }

  const { data: dbCategories } = await supabaseClient
    .from("pos_categories")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  const catMap = new Map((dbCategories || []).map((c) => [c.external_id, c.id]));

  const discountsToUpsert = mapSquareDiscounts(discounts, orgId);
  if (discountsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_discounts", discountsToUpsert, "organization_id,pos_provider,external_id");
  }

  // 4. Bulk Upsert Modifier Groups
  const modifierGroupsToUpsert = mapSquareModifierGroups(modifierLists, orgId);
  if (modifierGroupsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_modifier_groups", modifierGroupsToUpsert, "organization_id,pos_provider,external_id");
  }

  const { data: dbModifierGroups } = await supabaseClient
    .from("pos_modifier_groups")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  const mgMap = new Map((dbModifierGroups || []).map((g) => [g.external_id, g.id]));

  // 5. Bulk Upsert Modifier Options
  const modifierOptionsToUpsert = mapSquareModifierOptions(modifierLists, mgMap, orgId);
  if (modifierOptionsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_modifier_options", modifierOptionsToUpsert, "organization_id,pos_provider,external_id");
  }

  // 6. Bulk Upsert POS Items
  const posItemsToUpsert = mapSquarePosItems(items, countsMap, catMap, orgId);
  if (posItemsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_items", posItemsToUpsert, "organization_id,pos_provider,external_id");
  }

  const { data: dbPosItems } = await supabaseClient
    .from("pos_items")
    .select("id, external_id")
    .eq("organization_id", orgId)
    .eq("pos_provider", "SQUARE");
  
  // Build DUAL itemMap: both Square Item ID and Variation IDs -> pos_item.id
  const itemMap = new Map<string, string>();
  const dbItemMap = new Map((dbPosItems || []).map((i) => [i.external_id, i.id]));

  dbItemMap.forEach((localId, extItemId) => {
    itemMap.set(extItemId, localId);
  });

  items.forEach((item) => {
    const localId = dbItemMap.get(item.id);
    if (localId && item.item_data?.variations) {
      item.item_data.variations.forEach((v) => {
        if (v.id) {
          itemMap.set(v.id, localId);
        }
      });
    }
  });

  // 7. Bulk Upsert POS Item Modifier Groups
  const itemModifierGroupsToUpsert = mapSquareItemModifierGroups(items, itemMap, mgMap);
  if (itemModifierGroupsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_item_modifier_groups", itemModifierGroupsToUpsert, "pos_item_id,modifier_group_id");
  }

  // 8. Sync Sales, Orders, and Transactions
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
  const allOrders: SquareOrder[] = [];
  let orderCursor: string | undefined = undefined;

  do {
    const bodyPayload: Record<string, any> = {
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
    };
    if (orderCursor) {
      bodyPayload.cursor = orderCursor;
    }

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

    const ordersData = (await ordersRes.json()) as { orders?: SquareOrder[]; cursor?: string };
    if (ordersData.orders && ordersData.orders.length > 0) {
      allOrders.push(...ordersData.orders);
    }
    orderCursor = ordersData.cursor;
  } while (orderCursor);

  const ordersToUpsert = mapSquareOrders(allOrders, orgId);
  if (ordersToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_orders", ordersToUpsert, "organization_id,pos_provider,external_id");
  }

  const transactionsToUpsert = mapSquareTransactions(allOrders, itemMap, orgId);
  if (transactionsToUpsert.length > 0) {
    await bulkUpsert(supabaseClient, "pos_transactions", transactionsToUpsert, "external_transaction_id");
  }
}
