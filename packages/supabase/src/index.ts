import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import {
  createBrowserClient as createSupabaseBrowserClient,
  createServerClient as createSupabaseServerClient,
} from "@supabase/ssr";
import { clientConfig as config } from "@soustools/config/client";

function validateConfig(): void {
  if (config.IS_MOCK_ENV) {
    return;
  }
  if (!config.NEXT_PUBLIC_SUPABASE_URL || config.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder-project.supabase.co")) {
    throw new Error(
      "Supabase configuration is missing or placeholder values are being used. " +
        "Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correctly configured in Infisical and synced."
    );
  }
}

/**
 * Creates a Supabase client instance for use in browser/client-side components.
 * Automatically loads configurations from `@soustools/config/client`.
 */
export function createBrowserClient(): ReturnType<typeof createSupabaseBrowserClient> {
  validateConfig();
  return createSupabaseBrowserClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Shape of Next.js cookies() wrapper required for server-side cookie sync. */
export interface CookieStore {
  getAll: () => Array<{ name: string; value: string }>;
  set: (name: string, value: string, options: Record<string, unknown>) => void;
}

/** Cookie item shape used internally by @supabase/ssr. */
interface CookieItem {
  name: string;
  value: string;
  options: Record<string, unknown>;
}

/**
 * Creates a request-specific Supabase client for Next.js Server Components, Actions, or Route Handlers.
 * Synchronizes session states using cookies to prevent auth token leaks between requests.
 */
export function createServerClient(cookieStore: CookieStore): ReturnType<typeof createSupabaseServerClient> {
  validateConfig();
  return createSupabaseServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieItem[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
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
 * @param serviceRoleKey Optional override service role key.
 */
export function createAdminClient(serviceRoleKey?: string): SupabaseClient {
  validateConfig();
  const key = serviceRoleKey || config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return createClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    key,
  );
}
