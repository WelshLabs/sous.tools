import { Injectable } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import { SignageDevice } from "@soustools/api-types";
import { serverConfig as config } from "@soustools/config/server";
import Redis from "ioredis";
import * as jwt from "jsonwebtoken";

interface DbDeviceRow {
  id: string;
  organization_id: string;
  name: string;
  pairing_code: string;
  is_paired: boolean;
  last_seen_at: string | null;
  timezone: string;
  maintenance_window: {
    hour: number;
    minute: number;
    day_of_week: string | number;
  };
  created_at: string;
}

interface MaintenanceWindowInput {
  hour: number;
  minute: number;
  dayOfWeek: number | null;
}

/**
 * Service managing hardware signage devices.
 * Handles loading and updating device-specific configurations
 * like timezones and maintenance windows.
 *
 * @tenant-docs-export
 * Timezones and maintenance windows can be configured per paired hardware device
 * to ensure updates and restarts occur during off-hours.
 */
@Injectable()
export class DevicesService {
  private readonly redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
  });

  /**
   * Registers a new device natively from the Pi, returning a pairing code.
   */
  async register(): Promise<{ deviceId: string; pairingCode: string }> {
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase
      .from("signage_devices")
      .insert([
        {
          name: "Unpaired Device",
          pairing_code: pairingCode,
          is_paired: false,
          timezone: "UTC",
          maintenance_window: { hour: 3, minute: 0, day_of_week: null },
        },
      ])
      .select("id, pairing_code")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { deviceId: data.id, pairingCode: data.pairing_code };
  }

  /**
   * Pairs a device using a Captive Portal Handshake.
   * Returns a mock device_pairing_token locked to the organization.
   */
  async pair(
    _hardwareMac: string,
    _tenantAdminToken: string,
    _requestedName: string,
  ): Promise<{ device_pairing_token: string }> {
    // In a real implementation, we would decode tenantAdminToken to get the org ID,
    // and store the hardwareMac and requestedName in the database.
    // For this PoC, we blindly bypass real DB validation and return the dummy token.

    return { device_pairing_token: "mock_jwt_token_123" };
  }

  /**
   * Checks pairing status. If paired, returns the auth config for the Pi.
   */
  async getStatus(id: string): Promise<{
    paired: boolean;
    supabaseUrl?: string;
  }> {
    const { data, error } = await supabase
      .from("signage_devices")
      .select("is_paired")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (data.is_paired) {
      return {
        paired: true,
        supabaseUrl: config.NEXT_PUBLIC_SUPABASE_URL,
      };
    }
    return { paired: false };
  }

  /**
   * Fetches a single paired hardware device's settings by ID.
   */
  async findOne(id: string): Promise<SignageDevice> {
    const { data, error } = await supabase
      .from("signage_devices")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.mapRow(data as DbDeviceRow);
  }

  /**
   * Updates a paired hardware device's settings.
   */
  async update(
    id: string,
    name?: string,
    timezone?: string,
    maintenanceWindow?: MaintenanceWindowInput,
  ): Promise<SignageDevice> {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (maintenanceWindow !== undefined) {
      updateData.maintenance_window = {
        hour: maintenanceWindow.hour,
        minute: maintenanceWindow.minute,
        day_of_week: maintenanceWindow.dayOfWeek,
      };
    }

    const { data, error } = await supabase
      .from("signage_devices")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.mapRow(data as DbDeviceRow);
  }

  async initPairing(deviceType: "wearos" | "rpi"): Promise<{ code: string }> {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await this.redis.setex(
      `pairing:${code}`,
      900,
      JSON.stringify({ deviceType, status: "pending" }),
    );
    return { code };
  }

  async confirmPairing(
    code: string,
    deviceType: "wearos" | "rpi",
    user: any,
  ): Promise<{ success: boolean }> {
    const dataStr = await this.redis.get(`pairing:${code}`);
    if (!dataStr) throw new Error("Invalid or expired pairing code");
    const data = JSON.parse(dataStr);

    if (data.deviceType !== deviceType) throw new Error("Device type mismatch");

    const orgId = user.user_metadata?.organization_id || "mock-org-id";

    if (deviceType === "wearos") {
      data.status = "confirmed";
      data.userId = user.id;
    } else {
      data.status = "confirmed";
      data.orgId = orgId;
    }

    await this.redis.setex(`pairing:${code}`, 900, JSON.stringify(data));
    return { success: true };
  }

  async getPairingStatus(
    code: string,
  ): Promise<{ status: string; token?: string }> {
    const dataStr = await this.redis.get(`pairing:${code}`);
    if (!dataStr) return { status: "expired" };

    const data = JSON.parse(dataStr);
    if (data.status === "confirmed") {
      const payload =
        data.deviceType === "wearos"
          ? { sub: data.userId, deviceType: "wearos" }
          : { orgId: data.orgId, deviceType: "rpi" };
      const token = jwt.sign(payload, config.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        expiresIn: "1y",
      });

      await this.redis.del(`pairing:${code}`);
      return { status: "confirmed", token };
    }

    return { status: "pending" };
  }

  async revokeDevice(id: string): Promise<{ success: boolean }> {
    await this.redis.del(`device_session:${id}`);
    await supabase
      .from("signage_devices")
      .update({ is_paired: false, pairing_code: null })
      .eq("id", id);
    return { success: true };
  }

  private mapRow(row: DbDeviceRow): SignageDevice {
    return {
      id: row.id,
      organizationId: row.organization_id,
      name: row.name,
      pairingCode: row.pairing_code,
      isPaired: row.is_paired,
      lastSeenAt: row.last_seen_at,
      timezone: row.timezone,
      maintenanceWindow: {
        hour: row.maintenance_window?.hour ?? 3,
        minute: row.maintenance_window?.minute ?? 0,
        dayOfWeek:
          typeof row.maintenance_window?.day_of_week === "number"
            ? row.maintenance_window.day_of_week
            : null,
      },
      createdAt: row.created_at,
    };
  }
}
