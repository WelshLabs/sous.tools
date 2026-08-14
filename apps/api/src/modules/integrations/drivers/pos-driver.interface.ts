export interface NormalizedPosEvent {
  eventId: string;
  merchantId?: string;
  eventType:
    "catalog.updated" | "order.updated" | "inventory.updated" | "unknown";
  rawType?: string;
  data: Record<string, unknown>;
  createdAt?: string;
}

export interface IPosDriver {
  /**
   * Verifies the provider-specific webhook signature.
   */
  verifyWebhookSignature(
    signature: string,
    rawBody: string,
    signatureKey?: string,
  ): boolean;

  /**
   * Normalizes the provider-specific webhook payload into a standardized event format.
   */
  normalizeWebhookEvent(
    rawPayload: Record<string, unknown>,
  ): NormalizedPosEvent;
}
