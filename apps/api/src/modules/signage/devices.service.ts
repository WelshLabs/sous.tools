import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageDevice } from "@soustools/api-types";

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
    day_of_week: string;
  };
  created_at: string;
}

interface MaintenanceWindowInput {
  hour: number;
  minute: number;
  dayOfWeek: string;
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
        dayOfWeek: row.maintenance_window?.day_of_week ?? "*",
      },
      createdAt: row.created_at,
    };
  }
}
