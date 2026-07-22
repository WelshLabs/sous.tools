import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { serverConfig as config } from "@soustools/config/server";

export function createAdminClient(): SupabaseClient {
  return createClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

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
