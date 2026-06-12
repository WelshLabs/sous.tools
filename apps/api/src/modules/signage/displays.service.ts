import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { SignageGateway } from "./signage.gateway";
import {
  handleDbResult,
  dbRegisterPairingCode,
  dbConfirmPairing,
} from "./displays.helpers";

/**
 * Service managing signage displays in the database.
 *
 * @tenant-docs-export
 * Interfaces with Supabase database to query, register, and update display player instances.
 */
@Injectable()
export class DisplaysService {
  constructor(private readonly gateway: SignageGateway) {}

  /**
   * Retrieves all displays associated with an organization.
   *
   * @param orgId - The ID of the organization.
   * @returns List of signage displays.
   */
  async findAll(orgId: string): Promise<unknown[]> {
    const { data, error } = await supabase.from("signage_displays").select("*").eq("organization_id", orgId);
    return handleDbResult({ data: data || [], error });
  }

  /**
   * Retrieves details for a specific display device.
   *
   * @param id - The unique ID of the display.
   * @returns The signage display details.
   */
  async findOne(id: string): Promise<unknown> {
    const { data, error } = await supabase.from("signage_displays").select("*").eq("id", id).single();
    return handleDbResult({ data, error });
  }

  /**
   * Creates a new signage display within an organization.
   *
   * @param orgId - The ID of the organization.
   * @param name - The name of the display.
   * @param layoutId - Optional layout ID to assign.
   * @returns The created signage display details.
   */
  async create(orgId: string, name: string, layoutId?: string | null): Promise<unknown> {
    const { data, error } = await supabase
      .from("signage_displays")
      .insert([{ organization_id: orgId, name, layout_id: layoutId || null, is_paired: false }])
      .select()
      .single();

    return handleDbResult({ data, error });
  }

  /**
   * Updates display configuration.
   *
   * @param id - The ID of the display to update.
   * @param name - Optional new name.
   * @param layoutId - Optional new layout ID.
   * @param isPaired - Optional updated pairing status.
   * @returns The updated display details.
   */
  async update(
    id: string,
    name?: string,
    layoutId?: string | null,
    isPaired?: boolean,
  ): Promise<unknown> {
    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (layoutId !== undefined) updateData.layout_id = layoutId;
    if (isPaired !== undefined) updateData.is_paired = isPaired;

    const { data, error } = await supabase.from("signage_displays").update(updateData).eq("id", id).select().single();
    const result = handleDbResult({ data, error });
    this.gateway.broadcastLayoutUpdate(id);
    return result;
  }

  /**
   * Removes a display from the system.
   *
   * @param id - The display ID to remove.
   * @returns The removed display resource record.
   */
  async remove(id: string): Promise<unknown> {
    const { data, error } = await supabase.from("signage_displays").delete().eq("id", id).select().single();
    const result = handleDbResult({ data, error });
    this.gateway.broadcastLayoutUpdate(id);
    return result;
  }

  /**
   * Registers a temporary display slot using a unique pairing code.
   *
   * @param name - Optional label for the display.
   * @returns The registered display node details.
   */
  async registerPairingCode(name?: string): Promise<unknown> {
    return dbRegisterPairingCode(name);
  }

  /**
   * Pairs an registered display device with a pairing code.
   *
   * @param pairingCode - The numeric/alphabetic pairing code.
   * @param name - Optional new name.
   * @param layoutId - Optional layout ID to link.
   * @returns The confirmed display details.
   */
  async confirmPairing(
    pairingCode: string,
    name?: string,
    layoutId?: string | null,
  ): Promise<unknown> {
    return dbConfirmPairing(this.gateway, pairingCode, name, layoutId);
  }
}
