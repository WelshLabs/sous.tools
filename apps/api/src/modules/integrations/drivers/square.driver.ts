import { BaseIntegrationDriver } from './base.driver';
import { Injectable } from '@nestjs/common';
import { config } from '@soustools/config';
import { supabase } from '../../../lib/supabase';
import * as crypto from 'crypto';

@Injectable()
export class SquareDriver extends BaseIntegrationDriver {
  
  async exchangeTokens(code: string, orgId: string): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProd ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
    const clientId = config.SQUARE_CLIENT_ID;
    const clientSecret = config.SQUARE_CLIENT_SECRET;

    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to exchange Square tokens: ${errText}`);
    }

    const data = await response.json();
    
    // Map to active Supabase organization settings
    await supabase
      .from('integrations')
      .upsert({
        organization_id: orgId,
        provider: 'SQUARE',
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + 1000 * 3600 * 24 * 30).toISOString(),
        settings: {
          merchant_id: data.merchant_id
        }
      }, { onConflict: 'organization_id,provider' });

    return data;
  }

  async syncData(orgId: string): Promise<void> {
    // Sync logic here
    console.log(`Syncing data for ${orgId}`);
  }

  async createOrder(orgId: string, orderData: { items: any[] }): Promise<any> {
    const isProd = config.SQUARE_ENVIRONMENT === 'production';
    const baseUrl = isProd ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';

    // 1. Get access token from integrations table
    const { data: integration, error } = await supabase
      .from('integrations')
      .select('access_token')
      .eq('organization_id', orgId)
      .eq('provider', 'SQUARE')
      .single();

    if (error || !integration) {
      throw new Error(`No Square integration found for organization ${orgId}`);
    }

    const token = integration.access_token;

    // 2. Fetch first location ID
    const locRes = await fetch(`${baseUrl}/v2/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!locRes.ok) {
      throw new Error(`Failed to fetch Square locations: ${await locRes.text()}`);
    }
    const locData = await locRes.json();
    const locationId = locData.locations?.[0]?.id;
    if (!locationId) {
      throw new Error("No locations found on the Square merchant profile.");
    }

    // 3. Build order payload
    const lineItems = orderData.items.map(item => {
      const modifiers = (item.modifiers || []).map((m: any) => ({
        catalog_object_id: m.external_id || undefined,
        name: m.name
      })).filter((m: any) => m.catalog_object_id);

      return {
        name: item.name,
        quantity: String(item.quantity || 1),
        base_price_money: {
          amount: Math.round(Number(item.price || 0) * 100), // convert to cents
          currency: 'USD'
        },
        modifiers: modifiers.length > 0 ? modifiers : undefined
      };
    });

    const idempotencyKey = crypto.randomUUID();

    const orderRes = await fetch(`${baseUrl}/v2/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        idempotency_key: idempotencyKey,
        order: {
          location_id: locationId,
          line_items: lineItems
        }
      })
    });

    if (!orderRes.ok) {
      throw new Error(`Square Order creation failed: ${await orderRes.text()}`);
    }

    const responseData = await orderRes.json();
    return responseData;
  }
}
