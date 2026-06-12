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
  squareId: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  isSoldOut: boolean;
  createdAt: string;
  updatedAt: string;
}
