import { createBrowserClient } from "@soustools/supabase";

/**
 * Shared Supabase client instance for client-side execution.
 * Configured automatically via the shared Supabase package.
 */
export const supabase = createBrowserClient();
