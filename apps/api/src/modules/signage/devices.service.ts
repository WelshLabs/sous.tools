import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageDevice } from "@soustools/api-types";
import { config } from "@soustools/config";

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
  /**
   * Registers a new device natively from the Pi, returning a pairing code.
   */
  async register(): Promise<{ deviceId: string; pairingCode: string }> {
    const pairingCode = Math.floor(100000 + Math.random() * 900000).toString();
    const { data, error } = await supabase
      .from("signage_devices")
      .insert([{
        name: "Unpaired Device",
        pairing_code: pairingCode,
        is_paired: false,
        timezone: "UTC",
        maintenance_window: { hour: 3, minute: 0, day_of_week: null },
      }])
      .select("id, pairing_code")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return { deviceId: data.id, pairingCode: data.pairing_code };
  }

  /**
   * Checks pairing status. If paired, returns the auth config for the Pi.
   */
  async getStatus(id: string): Promise<{ paired: boolean; supabaseUrl?: string; supabaseAnonKey?: string }> {
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
        supabaseUrl: config.SUPABASE_URL,
        supabaseAnonKey: config.SUPABASE_ANON_KEY,
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
        dayOfWeek: typeof row.maintenance_window?.day_of_week === "number"
          ? row.maintenance_window.day_of_week
          : null,
      },
      createdAt: row.created_at,
    };
  }
}
