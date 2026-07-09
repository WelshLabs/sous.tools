import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { config } from "@soustools/config";
import { type IntegrationStatus } from "@soustools/api-types";
import { supabase } from "../../lib/supabase";
import { seedSquareCatalog, syncSquareCatalog } from "./square-sync.helper";
import { SquareDriver } from "./drivers/square.driver";

@Injectable()
export class IntegrationsService {
  constructor(
    @Inject(SquareDriver) private readonly squareDriver: SquareDriver,
  ) {}

  async checkout(orgId: string, orderData: any): Promise<any> {
    // Route order creation through the driver
    return this.squareDriver.createOrder(orgId, orderData);
  }
  getOAuthUrl(provider: string, orgId?: string): string {
    const state = orgId || "d0000000-0000-0000-0000-000000000000";
    if (provider === "square") {
      const baseUrl = "https://connect.squareup.com";
      const scope =
        "MERCHANT_PROFILE_READ+ITEMS_READ+ITEMS_WRITE+INVENTORY_READ+INVENTORY_WRITE";
      return `${baseUrl}/oauth2/authorize?client_id=${config.SQUARE_CLIENT_ID}&scope=${scope}&state=${state}&redirect_uri=${config.API_BASE_URL}/integrations/callback/square&session=false`;
    } else if (provider === "google") {
      const scope = encodeURIComponent(
        "openid email profile https://www.googleapis.com/auth/drive.readonly",
      );
      const redirectUri = encodeURIComponent(
        `${config.API_BASE_URL}/integrations/callback/google`,
      );
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
    }
    throw new Error(`Unsupported provider: ${provider}`);
  }

  async handleGoogleCallback(code: string, orgId: string): Promise<void> {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.GOOGLE_CLIENT_ID,
        client_secret: config.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${config.API_BASE_URL}/integrations/callback/google`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok)
      throw new Error(`Google token exchange failed: ${await res.text()}`);
    const tokenData = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    const infoRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    let email = "";
    if (infoRes.ok) {
      const userInfo = (await infoRes.json()) as { email: string };
      email = userInfo.email;
    }

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;
    const { error } = await supabase.from("integrations").upsert(
      {
        organization_id: orgId,
        provider: "GOOGLE",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: expiresAt,
        scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
        metadata: { connectedAs: email || "Google Account" },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,provider" },
    );

    if (error)
      throw new Error(`Failed to save Google integration: ${error.message}`);
  }

  async handleSquareCallback(code: string, orgId: string): Promise<void> {
    const isProd = config.SQUARE_ENVIRONMENT === "production";
    const baseUrl = isProd
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";
    const res = await fetch(`${baseUrl}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: config.SQUARE_CLIENT_ID,
        client_secret: config.SQUARE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        short_lived: false,
      }),
    });
    if (!res.ok)
      throw new Error(`Square token exchange failed: ${await res.text()}`);
    const tokenData = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_at?: string;
      merchant_id?: string;
    };

    let businessName = "";
    const merchantRes = await fetch(`${baseUrl}/v2/merchants/me`, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (merchantRes.ok) {
      const mData = (await merchantRes.json()) as {
        merchant?: { business_name?: string };
      };
      businessName = mData.merchant?.business_name || "";
    }

    const { error } = await supabase.from("integrations").upsert(
      {
        organization_id: orgId,
        provider: "SQUARE",
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        expires_at: tokenData.expires_at || null,
        scopes: [
          "MERCHANT_PROFILE_READ",
          "ITEMS_READ",
          "ITEMS_WRITE",
          "INVENTORY_READ",
          "INVENTORY_WRITE",
        ],
        metadata: {
          connectedAs:
            businessName || `Square Merchant ${tokenData.merchant_id || ""}`,
          merchantId: tokenData.merchant_id,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "organization_id,provider" },
    );

    if (error)
      throw new Error(`Failed to save Square integration: ${error.message}`);
  }

  async getIntegrationStatus(orgId: string): Promise<IntegrationStatus[]> {
    const { data, error } = await supabase
      .from("integrations")
      .select("provider, metadata")
      .eq("organization_id", orgId);
    if (error)
      throw new Error(`Failed to fetch integrations: ${error.message}`);

    const connectedMap = new Map<string, string>();
    (data || []).forEach((row) => {
      const metadata = row.metadata as Record<string, unknown>;
      connectedMap.set(
        row.provider,
        String(metadata?.connectedAs || "Connected"),
      );
    });

    return [
      {
        provider: "SQUARE",
        connected: connectedMap.has("SQUARE"),
        connectedAs: connectedMap.get("SQUARE"),
      },
      {
        provider: "GOOGLE",
        connected: connectedMap.has("GOOGLE"),
        connectedAs: connectedMap.get("GOOGLE"),
      },
    ];
  }

  async disconnect(provider: string, orgId: string): Promise<void> {
    const uProvider = provider.toUpperCase();
    const { error } = await supabase
      .from("integrations")
      .delete()
      .eq("organization_id", orgId)
      .eq("provider", uProvider);
    if (error)
      throw new Error(`Failed to disconnect integration: ${error.message}`);
  }

  async syncSquareCatalog(orgId: string): Promise<void> {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("organization_id", orgId)
      .eq("provider", "SQUARE")
      .single();
    if (!integration)
      throw new NotFoundException(
        "No active Square integration found for this organization",
      );
    await syncSquareCatalog(integration.access_token, orgId, supabase);
  }

  async seedSquareCatalog(orgId: string): Promise<void> {
    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("organization_id", orgId)
      .eq("provider", "SQUARE")
      .single();
    if (!integration)
      throw new NotFoundException(
        "No active Square integration found for this organization",
      );
    await seedSquareCatalog(integration.access_token);
  }
}
