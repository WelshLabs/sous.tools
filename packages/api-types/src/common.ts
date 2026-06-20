/**
 * Standard API response envelope pattern.
 * Use this to wrap all server responses for consistency.
 *
 * @template T The type of the payload data returned by the API.
 */
export interface ApiResponse<T> {
  /** Indicates if the operation was successful. */
  success: boolean;
  /** The payload data of the response, present if successful. */
  data?: T;
  /** Error message details, present if the operation failed. */
  error?: string;
  /** Timestamp indicating when the response was generated. */
  timestamp: string;
}

/**
 * Interface representing the structure of the hello endpoint response.
 */
export interface HelloResponse {
  /** The greeting message returned by the server. */
  message: string;
  /** The version of the API service. */
  version: string;
  /** Current server status. */
  status: "healthy" | "degraded" | "down";
}

/**
 * Represents a menu item synchronized from Square/Toast POS.
 */
export interface PosItem {
  id: string;
  organizationId: string;
  posProvider: "SQUARE" | "TOAST" | "MANUAL";
  externalId: string | null;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a POS modifier group.
 */
export interface PosModifierGroup {
  id: string;
  organizationId: string;
  posProvider: "SQUARE" | "TOAST" | "MANUAL";
  externalId: string | null;
  name: string;
  minSelectedModifiers: number | null;
  maxSelectedModifiers: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a POS modifier option.
 */
export interface PosModifierOption {
  id: string;
  organizationId: string;
  modifierGroupId: string;
  posProvider: "SQUARE" | "TOAST" | "MANUAL";
  externalId: string | null;
  name: string;
  price: number;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a local overlay override for a POS item.
 */
export interface PosItemLocalOverlay {
  id: string;
  organizationId: string;
  posItemId: string;
  name: string | null;
  description: string | null;
  price: number | null;
  isSoldOut: boolean | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents the connection status of an external third-party integration.
 */
export interface IntegrationStatus {
  provider: "SQUARE" | "GOOGLE";
  connected: boolean;
  connectedAs?: string;
  details?: Record<string, any>;
}

