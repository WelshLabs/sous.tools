import { PosItem } from "@soustools/api-types";

/**
 * Represents the structure of a raw Square item in the database.
 */
export interface RawDbSquareItem {
  id: string;
  organization_id: string;
  square_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database representation of a Square item to a standard POS item.
 *
 * @param item - The raw database square item.
 * @returns The standard typed POS item.
 */
export function mapDbItemToPosItem(item: RawDbSquareItem): PosItem {
  return {
    id: item.id,
    organizationId: item.organization_id,
    squareId: item.square_id || "",
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    isSoldOut: item.is_sold_out,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

/**
 * Registers a display device with the backend service.
 *
 * @param displayId - The custom name or ID of the display device.
 * @returns The registered display ID, or null if registration fails.
 */
export async function registerDisplayDevice(displayId: string): Promise<string | null> {
  const registerUrl = `${window.location.protocol}//${window.location.hostname}:6000/signage/displays/pair/register`;
  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Display ${displayId}` }),
    });
    const result = await res.json();
    if (result.success && result.data?.id) {
      return result.data.id;
    }
  } catch (err) {
    console.error("Device registration request failed", err);
  }
  return null;
}
