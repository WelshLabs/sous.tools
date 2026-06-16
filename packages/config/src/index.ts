import { secrets } from "./secrets.js";

export interface Config {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly IS_MOCK_ENV: boolean;
  readonly SQUARE_CLIENT_ID: string;
  readonly SQUARE_CLIENT_SECRET: string;
  readonly SQUARE_ENVIRONMENT: string;
  readonly GOOGLE_CLIENT_ID: string;
  readonly GOOGLE_CLIENT_SECRET: string;
  readonly API_BASE_URL: string;
  readonly APP_BASE_URL: string;
  readonly PRODUCTION_SQUARE_ACCESS_TOKEN: string;
  readonly PORT: number;
}

/**
 * Immutable configuration token contract.
 * Exposes core environment secrets synced from Infisical.
 */
const isMockEnv =
  process.env.INFISICAL_MOCK === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  !!(secrets.SUPABASE_URL && secrets.SUPABASE_URL.includes("placeholder-project.supabase.co"));

export const config: Config = Object.freeze({
  SUPABASE_URL: secrets.SUPABASE_URL,
  SUPABASE_ANON_KEY: secrets.SUPABASE_ANON_KEY,
  IS_MOCK_ENV: isMockEnv,
  SQUARE_CLIENT_ID: isMockEnv
    ? "sandbox-sq0idb-placeholder"
    : (process.env.SQUARE_CLIENT_ID || secrets.SQUARE_CLIENT_ID || "sandbox-sq0idb-placeholder"),
  SQUARE_CLIENT_SECRET: isMockEnv
    ? "sandbox-sq0csp-placeholder"
    : (process.env.SQUARE_CLIENT_SECRET || secrets.SQUARE_CLIENT_SECRET || "sandbox-sq0csp-placeholder"),
  SQUARE_ENVIRONMENT: isMockEnv
    ? "sandbox"
    : (process.env.SQUARE_ENVIRONMENT || "sandbox"),
  GOOGLE_CLIENT_ID: isMockEnv
    ? "google-client-id-placeholder"
    : (process.env.GOOGLE_CLIENT_ID || secrets.GOOGLE_CLIENT_ID || "google-client-id-placeholder"),
  GOOGLE_CLIENT_SECRET: isMockEnv
    ? "google-client-secret-placeholder"
    : (process.env.GOOGLE_CLIENT_SECRET || secrets.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder"),
  API_BASE_URL: isMockEnv
    ? "http://localhost:6000"
    : (process.env.API_BASE_URL || (secrets as any).API_BASE_URL || "http://localhost:6000"),
  APP_BASE_URL: isMockEnv
    ? "http://localhost:3000"
    : (process.env.APP_BASE_URL || (secrets as any).APP_BASE_URL || "http://localhost:3000"),
  PRODUCTION_SQUARE_ACCESS_TOKEN: isMockEnv
    ? "prod-square-token-placeholder"
    : (process.env.PRODUCTION_SQUARE_ACCESS_TOKEN || (secrets as any).PRODUCTION_SQUARE_ACCESS_TOKEN || "prod-square-token-placeholder"),
  PORT: Number(
    isMockEnv
      ? 6000
      : (process.env.PORT || (secrets as any).PORT || 6000)
  ),
});

