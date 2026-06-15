import type { SignageLayoutConfig } from "./signage";

/** A physical hardware device (e.g., Raspberry Pi). Created on pairing. */
export interface SignageDevice {
  id: string;
  organizationId: string;
  name: string;
  pairingCode: string;
  isPaired: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

/** A single output port on a device, or a manually-created browser display. */
export interface SignageDisplay {
  id: string;
  organizationId: string;
  /** null = browser/URL-only display with no hardware device */
  deviceId: string | null;
  /** e.g., 'HDMI-1', 'HDMI-2'. null for browser displays. */
  portLabel: string | null;
  name: string;
  /** Which deck this display is currently showing. null = unassigned. */
  deckId: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

/** A named, independently playable slide deck. */
export interface SignageDeck {
  id: string;
  organizationId: string;
  name: string;
  /** URL-safe slug, unique per organization. Auto-generated from name. */
  slug: string;
  config: SignageLayoutConfig;
  createdAt: string;
  updatedAt: string;
}
