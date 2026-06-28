import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";
import { config } from "@soustools/config";

function validateConfig(): void {
  if (config.IS_MOCK_ENV) {
    return;
  }
  if (!config.SUPABASE_URL || config.SUPABASE_URL.includes("placeholder-project.supabase.co")) {
    throw new Error(
      "Supabase configuration is missing or placeholder values are being used. " +
        "Ensure SUPABASE_URL and SUPABASE_ANON_KEY are correctly configured in Infisical and synced."
    );
  }
}

/**
 * Creates a Supabase client instance for use in browser/client-side components.
 * Automatically loads configurations from `@soustools/config`.
 *
 * @returns {any} Initialized Supabase client.
 */
export function createBrowserClient(): any {
  validateConfig();
  return createSupabaseBrowserClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
  );
}

/**
 * Shape of next.js cookies() wrapper required for server side cookie sync.
 */
export interface CookieStore {
  getAll: () => any[];
  set: (name: string, value: string, options: any) => void;
}

/**
 * Creates a request-specific Supabase client for Next.js Server Components, Actions, or Route Handlers.
 * Synchronizes session states using cookies to prevent auth token leaks between requests.
 *
 * @param {CookieStore} cookieStore Active Next.js request cookie store.
 * @returns {any} Request-specific Supabase client.
 */
export function createServerClient(cookieStore: CookieStore): any {
  validateConfig();
  return createSupabaseServerClient(
    config.SUPABASE_URL,
    config.SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Fail silently since server components cannot modify cookies during rendering
          }
        },
      },
    },
  );
}

/**
 * Creates an administrative or backend Supabase client instance for NestJS or background script execution.
 *
 * @param {string} [serviceRoleKey] Optional override service role key. Defaults to service role key from config.
 * @returns {SupabaseClient} Administrative Supabase client.
 */
export function createAdminClient(serviceRoleKey?: string): SupabaseClient {
  validateConfig();
  return createClient(
    config.SUPABASE_URL,
    serviceRoleKey || config.SUPABASE_SERVICE_ROLE_KEY || config.SUPABASE_ANON_KEY,
  );
}
