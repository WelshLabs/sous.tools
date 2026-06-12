import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@soustools/supabase";

/**
 * Shared instance of the Supabase Client configured using the config package.
 */
export const supabase: SupabaseClient = createAdminClient();

/**
 * Wrapper class for the Supabase client to facilitate injection or importing within NestJS.
 */
export class SupabaseClientWrapper {
  /** The active Supabase client instance. */
  public readonly client: SupabaseClient = supabase;
}
