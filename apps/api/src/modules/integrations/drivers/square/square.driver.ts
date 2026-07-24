import { BaseIntegrationDriver } from "../base.driver";
import { IPosDriver, NormalizedPosEvent } from "../pos-driver.interface";
import { Injectable } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";
import { supabase } from "../../../../lib/supabase";
import * as crypto from "crypto";

@Injectable()
export class SquareDriver extends BaseIntegrationDriver implements IPosDriver {
  verifyWebhookSignature(
    signature: string,
    rawBody: string,
    signatureKey?: string
  ): boolean {
    const key = signatureKey || config.SQUARE_WEBHOOK_SIGNATURE_KEY;
    if (config.IS_MOCK_ENV || !key) {
      return true;
    }
    if (!signature) {
      return false;
    }

    const notificationUrl = `${config.NEXT_PUBLIC_API_URL}/integrations/webhooks/square`;
    const hash = crypto
      .createHmac("sha256", String(key))
      .update(notificationUrl + rawBody)
      .digest("base64");

    return hash === signature;
  }

  normalizeWebhookEvent(rawPayload: Record<string, unknown>): NormalizedPosEvent {
    const eventId = String(rawPayload.event_id || rawPayload.eventId || "");
    const merchantId = (rawPayload.merchant_id || rawPayload.merchantId) as string | undefined;
    const rawType = String(rawPayload.type || "");

    let eventType: NormalizedPosEvent["eventType"] = "unknown";
    if (rawType.includes("catalog")) {
      eventType = "catalog.updated";
    } else if (rawType.includes("order")) {
      eventType = "order.updated";
    } else if (rawType.includes("inventory")) {
      eventType = "inventory.updated";
    }

    const dataObj = (rawPayload.data || {}) as Record<string, unknown>;

    return {
      eventId,
      merchantId,
      eventType,
      rawType,
      data: dataObj,
      createdAt: rawPayload.created_at as string | undefined,
    };
  }

  async exchangeTokens(code: string, orgId: string): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === "production";
    const baseUrl = isProd
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";
    const clientId = config.SQUARE_CLIENT_ID;
    const clientSecret = config.SQUARE_CLIENT_SECRET;

    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to exchange Square tokens: ${errText}`);
    }

    const data = await response.json();

    // Map to active Supabase organization settings
    await supabase.from("integrations").upsert(
      {
        organization_id: orgId,
        provider: "SQUARE",
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(),
        settings: {
          merchant_id: data.merchant_id,
        },
      },
      { onConflict: "organization_id,provider" }
    );

    return data;
  }

  async syncData(orgId: string): Promise<void> {
    const { syncSquareCatalog } = await import("./square-sync.helper");
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("organization_id", orgId)
      .eq("provider", "SQUARE")
      .single();

    if (error || !integration) {
      throw new Error(`No Square integration found for organization ${orgId}`);
    }

    await syncSquareCatalog(integration.access_token, orgId, supabase);
  }

  async createOrder(orgId: string, orderData: { items: any[] }): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === "production";
    const baseUrl = isProd
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

    // 1. Get access token from integrations table
    const { data: integration, error } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("organization_id", orgId)
      .eq("provider", "SQUARE")
      .single();

    if (error || !integration) {
      throw new Error(`No Square integration found for organization ${orgId}`);
    }

    const token = integration.access_token;

    // 2. Fetch first location ID
    const locRes = await fetch(`${baseUrl}/v2/locations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!locRes.ok) {
      throw new Error(
        `Failed to fetch Square locations: ${await locRes.text()}`
      );
    }
    const locData = await locRes.json();
    const locationId = locData.locations?.[0]?.id;
    if (!locationId) {
      throw new Error("No locations found on the Square merchant profile.");
    }

    // 3. Build order payload
    const lineItems = orderData.items.map((item) => {
      const modifiers = (item.modifiers || [])
        .map((m: any) => ({
          catalog_object_id: m.external_id || undefined,
          name: m.name,
        }))
        .filter((m: any) => m.catalog_object_id);

      return {
        name: item.name,
        quantity: String(item.quantity || 1),
        base_price_money: {
          amount: Math.round(Number(item.price || 0) * 100),
          currency: "USD",
        },
        modifiers: modifiers.length > 0 ? modifiers : undefined,
      };
    });

    const idempotencyKey = crypto.randomUUID();

    const orderRes = await fetch(`${baseUrl}/v2/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        order: {
          location_id: locationId,
          line_items: lineItems,
        },
      }),
    });

    if (!orderRes.ok) {
      throw new Error(`Square Order creation failed: ${await orderRes.text()}`);
    }

    const responseData = await orderRes.json();
    return responseData;
  }
}
