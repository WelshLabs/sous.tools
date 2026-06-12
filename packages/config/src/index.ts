import { secrets } from "./secrets.js";

export interface Config {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
}

/**
 * Immutable configuration token contract.
 * Exposes core environment secrets synced from Infisical.
 */
export const config: Config = Object.freeze({
  SUPABASE_URL: secrets.SUPABASE_URL,
  SUPABASE_ANON_KEY: secrets.SUPABASE_ANON_KEY,
});
