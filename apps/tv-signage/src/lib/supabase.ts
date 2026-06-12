import { createBrowserClient } from "@soustools/supabase";

/**
 * Shared Supabase client instance for client-side execution in the TV signage player.
 * Configured automatically via the shared Supabase package.
 */
export const supabase = createBrowserClient();
