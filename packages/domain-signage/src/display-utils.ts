import { type SignageDisplay } from "@soustools/api-types";

/**
 * Maps raw backend display record to typed SignageDisplay interface.
 */
export const mapDisplay = (
  d: Record<string, unknown> | null | undefined,
): SignageDisplay | null => {
  if (!d) return null;
  return {
    id: String(d.id || ""),
    organizationId: String(d.organization_id || d.organizationId || ""),
    name: String(d.name || ""),
    deviceId:
      d.device_id !== undefined
        ? (d.device_id as string | null)
        : (d.deviceId as string | null),
    portLabel:
      d.port_label !== undefined
        ? (d.port_label as string | null)
        : (d.portLabel as string | null),
    deckId:
      d.deck_id !== undefined
        ? (d.deck_id as string | null)
        : (d.deckId as string | null),
    lastSeenAt:
      d.last_seen_at !== undefined
        ? (d.last_seen_at as string | null)
        : (d.lastSeenAt as string | null),
    createdAt: String(d.created_at || d.createdAt || ""),
  };
};

/**
 * Determines if a display is online based on its last seen timestamp.
 */
export const isOnline = (lastSeen: string | null): boolean => {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < 30000;
};

import { type PosItem } from "@soustools/api-types";

export interface RawDbPosItem {
  id: string;
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

export function mapDbItemToPosItem(item: RawDbPosItem): PosItem {
  return {
    id: item.id,
    organizationId: item.organization_id,
    posProvider: item.pos_provider,
    externalId: item.external_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    isSoldOut: item.is_sold_out,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}
