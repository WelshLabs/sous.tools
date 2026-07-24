import { SupabaseClient } from "@supabase/supabase-js";
import { getSquareBaseUrl, getVariationAndLocationId } from "../integrations/drivers/square/square-sync.helper";

export { getMockItems } from "./pos-simulator.mock";
export type { MockPosItem } from "./pos-simulator.mock";

/**
 * Resolves organization ID and Square ID from optional input IDs.
 */
export async function resolveItemDetails(
  supabaseClient: SupabaseClient,
  itemId?: string,
  squareId?: string,
  defaultOrgId: string = "d0000000-0000-0000-0000-000000000000"
): Promise<{ orgId: string; targetSquareId?: string }> {
  let targetSquareId = squareId;
  let orgId = defaultOrgId;
  if (itemId) {
    const { data } = await supabaseClient.from("pos_items").select("organization_id, external_id").eq("id", itemId).single();
    if (data) { orgId = data.organization_id; targetSquareId = data.external_id || undefined; }
  }
  if (!orgId && targetSquareId) {
    const { data } = await supabaseClient.from("pos_items").select("organization_id").eq("external_id", targetSquareId).eq("pos_provider", "SQUARE").single();
    if (data) orgId = data.organization_id;
  }
  return { orgId, targetSquareId };
}


/**
 * Communicates with Square Catalog & Inventory APIs to adjust stock tracking or item counts.
 */
export async function handleSquareStockToggle(
  squareId: string,
  isSoldOut: boolean,
  accessToken: string,
  quantity?: number,
  unlimited?: boolean
): Promise<void> {
  const { variationId, locationId } = await getVariationAndLocationId(accessToken, squareId);
  const baseUrl = getSquareBaseUrl();

  if (!isSoldOut && unlimited) {
    const varRes = await fetch(`${baseUrl}/v2/catalog/object/${variationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!varRes.ok) throw new Error(`Fetch variation failed: ${await varRes.text()}`);
    const varData = (await varRes.json()) as { object?: { version?: number; item_variation_data?: Record<string, unknown> } };
    const variationObject = varData.object;
    const version = variationObject?.version;
    if (version && variationObject) {
      const updateRes = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idempotency_key: crypto.randomUUID(),
          batches: [{
            objects: [{
              type: "ITEM_VARIATION",
              id: variationId,
              version,
              item_variation_data: {
                ...variationObject.item_variation_data,
                track_inventory: false,
              },
            }],
          }],
        }),
      });
      if (!updateRes.ok) throw new Error(`Disable stock tracking failed: ${await updateRes.text()}`);
    }
  } else {
    const varRes = await fetch(`${baseUrl}/v2/catalog/object/${variationId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (varRes.ok) {
      const varData = (await varRes.json()) as { object?: { version?: number; item_variation_data?: Record<string, unknown> } };
      const variationObject = varData.object;
      const version = variationObject?.version;
      const trackInventory = variationObject?.item_variation_data?.track_inventory;
      if (version && !trackInventory && variationObject) {
        const enableRes = await fetch(`${baseUrl}/v2/catalog/batch-upsert`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idempotency_key: crypto.randomUUID(),
            batches: [{
              objects: [{
                type: "ITEM_VARIATION",
                id: variationId,
                version,
                item_variation_data: {
                  ...variationObject.item_variation_data,
                  track_inventory: true,
                },
              }],
            }],
          }),
        });
        if (!enableRes.ok) throw new Error(`Enable stock tracking failed: ${await enableRes.text()}`);
      }
    }

    const stockQty = isSoldOut ? 0 : (quantity !== undefined ? quantity : 100);
    const changeRes = await fetch(`${baseUrl}/v2/inventory/changes/batch-create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: crypto.randomUUID(),
        changes: [{
          type: "PHYSICAL_COUNT",
          physical_count: {
            catalog_object_id: variationId,
            state: "IN_STOCK",
            quantity: String(stockQty),
            location_id: locationId,
            occurred_at: new Date().toISOString(),
          },
        }],
      }),
    });
    if (!changeRes.ok) {
      throw new Error(`Failed to update inventory: ${await changeRes.text()}`);
    }
  }
}
