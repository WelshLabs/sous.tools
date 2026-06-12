import { createBrowserClient } from "@soustools/supabase";

/**
 * Shared Supabase client instance for client-side execution in the customer site.
 * Configured automatically via the shared Supabase package.
 */
export const supabase = createBrowserClient();
