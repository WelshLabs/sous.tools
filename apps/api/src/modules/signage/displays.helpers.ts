import { supabase } from "../../core/database/supabase";
import { SignageGateway } from "./signage.gateway";

/**
 * Handles validation of database results, throwing an error if one occurred.
 *
 * @param result - The database query result object.
 * @returns The queried data.
 */
export function handleDbResult<T>(result: {
  data: T | null;
  error: { message: string } | null;
}): T {
  if (result.error) {
    throw new Error(result.error.message);
  }
  if (result.data === null || result.data === undefined) {
    throw new Error("Resource not found");
  }
  return result.data;
}

/**
 * Generates a random alphanumeric pairing code of a specified length.
 *
 * @param length - The length of the pairing code.
 * @returns A randomly generated pairing code string.
 */
export function generatePairingCode(length = 4): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Registers a display slot with a generated unique pairing code.
 *
 * @param name - The name of the display.
 * @returns The registered display node details.
 */
export async function dbRegisterPairingCode(name?: string): Promise<unknown> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generatePairingCode();
    const { data, error } = await supabase
      .from("signage_displays")
      .insert([
        {
          organization_id: "d0000000-0000-0000-0000-000000000000",
          name: name || "New Display",
          pairing_code: code,
          is_paired: false,
        },
      ])
      .select()
      .single();

    if (!error) return data;
    if (error.code !== "23505") {
      throw new Error(error.message);
    }
  }
  throw new Error("Failed to generate a unique pairing code");
}

/**
 * Confirms pairing code matching for a display node.
 *
 * @param gateway - The signage gateway to broadcast layout updates.
 * @param pairingCode - The input pairing code.
 * @param name - The optional new display name.
 * @param layoutId - The optional layout ID.
 * @returns The updated and paired display details.
 */
export async function dbConfirmPairing(
  gateway: SignageGateway,
  pairingCode: string,
  name?: string,
  layoutId?: string | null,
): Promise<unknown> {
  const { data: display, error: findError } = await supabase
    .from("signage_displays")
    .select("*")
    .eq("pairing_code", pairingCode.toUpperCase())
    .single();

  if (findError || !display) {
    throw new Error("Invalid pairing code");
  }

  const { data: updated, error: updateError } = await supabase
    .from("signage_displays")
    .update({
      is_paired: true,
      pairing_code: null,
      name: name || display.name,
      layout_id: layoutId !== undefined ? layoutId : display.layout_id,
    })
    .eq("id", display.id)
    .select()
    .single();

  if (updateError || !updated) {
    throw new Error(updateError?.message || "Failed to confirm pairing");
  }

  gateway.broadcastLayoutUpdate(updated.id);
  return updated;
}
