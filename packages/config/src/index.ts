import { secrets } from "./secrets.js";

export interface Config {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly SUPABASE_SERVICE_ROLE_KEY: string;
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
  readonly REDIS_HOST: string;
  readonly REDIS_PORT: number;
  readonly SQUARE_WEBHOOK_SIGNATURE_KEY: string;
  readonly GEMINI_API_KEY: string;
  readonly IS_DEVELOPMENT: boolean;
  readonly TV_BASE_URL: string;
  readonly NEW_RELIC_LICENSE_KEY: string;
  readonly NEW_RELIC_ENABLED: boolean;
  readonly USDA_FDC_API_KEY: string;
  readonly VERCEL_AI_GATEWAY_API_KEY: string;
}

/**
 * Immutable configuration token contract.
 * Exposes core environment secrets synced from Infisical.
 */
const isMockEnv =
  process.env.INFISICAL_MOCK === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  !!(
    secrets.SUPABASE_URL &&
    secrets.SUPABASE_URL.includes("placeholder-project.supabase.co")
  );

const isDevelopment = process.env.NODE_ENV === "development";

const sec = secrets as Record<string, string | number | undefined>;

export const config: Config = Object.freeze({
  SUPABASE_URL: process.env.SUPABASE_URL || secrets.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_URL || secrets.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY:
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    secrets.SUPABASE_SERVICE_ROLE_KEY ||
    (isMockEnv ? "supabase_service_role_key_placeholder" : ""),
  IS_MOCK_ENV: isMockEnv,
  IS_DEVELOPMENT: isDevelopment,
  SQUARE_CLIENT_ID: isMockEnv
    ? "sandbox-sq0idb-placeholder"
    : process.env.SQUARE_CLIENT_ID ||
      secrets.SQUARE_CLIENT_ID ||
      "sandbox-sq0idb-placeholder",
  SQUARE_CLIENT_SECRET: isMockEnv
    ? "sandbox-sq0csp-placeholder"
    : process.env.SQUARE_CLIENT_SECRET ||
      secrets.SQUARE_CLIENT_SECRET ||
      "sandbox-sq0csp-placeholder",
  SQUARE_ENVIRONMENT: isMockEnv
    ? "sandbox"
    : process.env.SQUARE_ENVIRONMENT || "sandbox",
  GOOGLE_CLIENT_ID: isMockEnv
    ? "google-client-id-placeholder"
    : process.env.GOOGLE_CLIENT_ID ||
      secrets.GOOGLE_CLIENT_ID ||
      "google-client-id-placeholder",
  GOOGLE_CLIENT_SECRET: isMockEnv
    ? "google-client-secret-placeholder"
    : process.env.GOOGLE_CLIENT_SECRET ||
      secrets.GOOGLE_CLIENT_SECRET ||
      "google-client-secret-placeholder",
  API_BASE_URL: isMockEnv
    ? "http://localhost:6001"
    : process.env.API_BASE_URL ||
      (sec.API_BASE_URL as string) ||
      "http://localhost:6001",
  APP_BASE_URL: isMockEnv
    ? "http://localhost:5001"
    : process.env.APP_BASE_URL ||
      (sec.APP_BASE_URL as string) ||
      "http://localhost:5001",
  PRODUCTION_SQUARE_ACCESS_TOKEN: isMockEnv
    ? "prod-square-token-placeholder"
    : process.env.PRODUCTION_SQUARE_ACCESS_TOKEN ||
      (sec.PRODUCTION_SQUARE_ACCESS_TOKEN as string) ||
      "prod-square-token-placeholder",
  PORT: Number(isMockEnv ? 6001 : process.env.PORT || sec.PORT || 6001),
  REDIS_HOST: isMockEnv
    ? "127.0.0.1"
    : process.env.REDIS_HOST || (sec.REDIS_HOST as string) || "127.0.0.1",
  REDIS_PORT: Number(
    isMockEnv ? 6379 : process.env.REDIS_PORT || sec.REDIS_PORT || 6379,
  ),
  SQUARE_WEBHOOK_SIGNATURE_KEY: isMockEnv
    ? ""
    : process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ||
      (sec.SQUARE_WEBHOOK_SIGNATURE_KEY as string) ||
      "",
  GEMINI_API_KEY:
    process.env.GEMINI_API_KEY ||
    (sec.GEMINI_API_KEY as string) ||
    (isMockEnv ? "gemini-api-key-placeholder" : "gemini-api-key-placeholder"),
  TV_BASE_URL: isMockEnv
    ? "http://localhost:5003"
    : process.env.NEXT_PUBLIC_TV_URL ||
      (sec.NEXT_PUBLIC_TV_URL as string) ||
      "http://localhost:5003",
  NEW_RELIC_LICENSE_KEY: isMockEnv
    ? "new-relic-license-key-placeholder"
    : process.env.NEW_RELIC_LICENSE_KEY ||
      (sec.NEW_RELIC_LICENSE_KEY as string) ||
      "new-relic-license-key-placeholder",
  NEW_RELIC_ENABLED:
    !isMockEnv &&
    !isDevelopment &&
    !!(process.env.NEW_RELIC_LICENSE_KEY || sec.NEW_RELIC_LICENSE_KEY) &&
    (process.env.NEW_RELIC_LICENSE_KEY || sec.NEW_RELIC_LICENSE_KEY) !==
      "new-relic-license-key-placeholder",
  USDA_FDC_API_KEY:
    process.env.USDA_FDC_API_KEY ||
    (sec.USDA_FDC_API_KEY as string) ||
    (isMockEnv ? "DEMO_KEY" : "DEMO_KEY"),
  VERCEL_AI_GATEWAY_API_KEY:
    process.env.VERCEL_AI_GATEWAY_API_KEY ||
    (sec.VERCEL_AI_GATEWAY_API_KEY as string) ||
    "",
});
