import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, SquareCatalogObject, SquareInventoryCount } from "./square-client.helper";

export { getSquareBaseUrl, getVariationAndLocationId } from "./square-client.helper";
export { seedSquareCatalog } from "./square-seed.helper";

export async function syncSquareCatalog(
  accessToken: string,
  orgId: string,
  supabaseClient: SupabaseClient
): Promise<void> {
  const baseUrl = getSquareBaseUrl();
  const listRes = await fetch(`${baseUrl}/v2/catalog/list?types=ITEM`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!listRes.ok) {
    throw new Error(`Square catalog list failed: ${await listRes.text()}`);
  }
  const listData = (await listRes.json()) as { objects?: SquareCatalogObject[] };
  const items = listData.objects || [];
  if (items.length === 0) return;

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

  const { error } = await supabaseClient
    .from("pos_items")
    .upsert(posItemsToUpsert, { onConflict: "organization_id,pos_provider,external_id" });

  if (error) {
    throw new Error(`Failed to upsert POS items: ${error.message}`);
  }
}
