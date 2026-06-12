import { secrets } from "./secrets.js";

export interface Config {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly IS_MOCK_ENV: boolean;
}

/**
 * Immutable configuration token contract.
 * Exposes core environment secrets synced from Infisical.
 */
export const config: Config = Object.freeze({
  SUPABASE_URL: secrets.SUPABASE_URL,
  SUPABASE_ANON_KEY: secrets.SUPABASE_ANON_KEY,
  IS_MOCK_ENV: process.env.INFISICAL_MOCK === "true" || process.env.NODE_ENV === "test",
});
