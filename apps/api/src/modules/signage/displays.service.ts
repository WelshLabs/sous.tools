import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { handleDbResult } from "./displays.helpers";
import { type SignageGateway } from "./signage.gateway";

/**
 * Service managing signage displays in the database.
 * A Display is a single output (HDMI port or browser URL).
 * It belongs to a Device (hardware) or is standalone (browser-only).
 *
 * @tenant-docs-export
 */
@Injectable()
export class DisplaysService {
  constructor(private readonly gateway: SignageGateway) {}

  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("organization_id", orgId);
    return handleDbResult({ data: data || [], error });
  }

  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("id", id)
      .single();
    return handleDbResult({ data, error });
  }

  /** Creates a browser-only display (no device, no port label). */
  async create(orgId: string, name: string, deckId?: string | null): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .insert([{ organization_id: orgId, name, deck_id: deckId ?? null }])
      .select()
      .single();
    return handleDbResult({ data, error });
  }

  /** Updates a display's name or deck assignment. */
  async update(
    id: string,
    name?: string,
    deckId?: string | null,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (deckId !== undefined) updateData.deck_id = deckId;

    const { data, error } = await supabase
      .from("signage_displays")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    const result = handleDbResult({ data, error });
    this.gateway.broadcastLayoutUpdate(id);
    return result;
  }

  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .delete()
      .eq("id", id)
      .select()
      .single();
    return handleDbResult({ data, error });
  }

  /** Updates the last_seen_at timestamp for a display (called by the player on heartbeat). */
  async heartbeat(id: string): Promise<void> {
    await supabase
      .from("signage_displays")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", id);
  }

  /** Pairs a hardware device and automatically registers its display ports (HDMI-1, HDMI-2). */
  async pairDevice(orgId: string, pairingCode: string, name: string): Promise<unknown> {
    const { data: device, error: deviceError } = await supabase
      .from("signage_devices")
      .select("*")
      .eq("pairing_code", pairingCode)
      .single();

    if (deviceError || !device) {
      throw new Error("Invalid pairing code");
    }

    const { data: updatedDevice, error: updateError } = await supabase
      .from("signage_devices")
      .update({ is_paired: true, name, organization_id: orgId })
      .eq("id", device.id)
      .select()
      .single();

    if (updateError || !updatedDevice) {
      throw new Error(updateError?.message || "Failed to update device");
    }

    const { data: existingDisplays, error: displaysError } = await supabase
      .from("signage_displays")
      .select("*")
      .eq("device_id", device.id);

    if (displaysError) throw new Error(displaysError.message);

    const ports = ["HDMI-1", "HDMI-2"];
    const displaysToCreate = [];

    for (const port of ports) {
      if (!existingDisplays?.some((d) => d.port_label === port)) {
        displaysToCreate.push({
          organization_id: orgId,
          name: `${name} (${port})`,
          device_id: device.id,
          port_label: port,
          deck_id: null,
        });
      }
    }

    if (displaysToCreate.length > 0) {
      const { error: insertError } = await supabase
        .from("signage_displays")
        .insert(displaysToCreate);
      if (insertError) throw new Error(insertError.message);
    }

    this.gateway.broadcastDevicePaired(device.id, orgId);

    return updatedDevice;
  }
}
