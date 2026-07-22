import { serverConfig as config } from "@soustools/config/server";

export interface SquareCatalogObject {
  type: string;
  id: string;
  version?: number;
  item_data?: {
    name: string;
    description?: string;
    variations?: Array<{
      id: string;
      item_variation_data?: {
        track_inventory?: boolean;
        price_money?: { amount: number; currency: string };
      };
    }>;
  };
  item_variation_data?: {
    name?: string;
    track_inventory?: boolean;
    pricing_type?: string;
    price_money?: { amount: number; currency: string };
  };
}

export interface SquareInventoryCount {
  catalog_object_id: string;
  state: string;
  quantity: string;
}

export function getSquareBaseUrl(): string {
  return config.SQUARE_ENVIRONMENT === "production"
    ? "https://connect.squareup.com"
    : "https://connect.squareupsandbox.com";
}

export async function getVariationAndLocationId(
  accessToken: string,
  squareId: string
): Promise<{ variationId: string; locationId: string }> {
  const baseUrl = getSquareBaseUrl();
  const itemRes = await fetch(`${baseUrl}/v2/catalog/object/${squareId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!itemRes.ok) {
    throw new Error(`Square catalog retrieve failed: ${await itemRes.text()}`);
  }
  const itemData = (await itemRes.json()) as { object?: SquareCatalogObject };
  const firstVariation = itemData.object?.item_data?.variations?.[0];
  if (!firstVariation) {
    throw new Error(`No variation found for Square item ${squareId}`);
  }

  let locationId = "main";
  const locRes = await fetch(`${baseUrl}/v2/locations`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (locRes.ok) {
    const locData = (await locRes.json()) as { locations?: Array<{ id: string; status: string }> };
    const activeLoc = locData.locations?.find((l) => l.status === "ACTIVE") || locData.locations?.[0];
    if (activeLoc) {
      locationId = activeLoc.id;
    }
  }
  return { variationId: firstVariation.id, locationId };
}
