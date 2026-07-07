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
  readonly VISION_PROVIDER: string;
  readonly OLLAMA_HOST: string;
  readonly OLLAMA_MODEL: string;
}

const isDevelopment = process.env.NODE_ENV === "development";
const isMockEnv =
  String(process.env.INFISICAL_MOCK).toLowerCase() === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.VITEST === "true" ||
  (process.env.SUPABASE_URL || "").includes("placeholder-project.supabase.co");

export const config: Config = Object.freeze({
  SUPABASE_URL: process.env.SUPABASE_URL || "https://placeholder-project.supabase.co",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || "placeholder-anon-key",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role",
  IS_MOCK_ENV: isMockEnv,
  IS_DEVELOPMENT: isDevelopment,
  SQUARE_CLIENT_ID: process.env.SQUARE_CLIENT_ID || "sandbox-sq0idb-placeholder",
  SQUARE_CLIENT_SECRET: process.env.SQUARE_CLIENT_SECRET || "sandbox-sq0csp-placeholder",
  SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT || "sandbox",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "google-client-id-placeholder",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-placeholder",
  API_BASE_URL: process.env.API_BASE_URL || "http://localhost:6001",
  APP_BASE_URL: process.env.APP_BASE_URL || "http://localhost:5001",
  PRODUCTION_SQUARE_ACCESS_TOKEN: process.env.PRODUCTION_SQUARE_ACCESS_TOKEN || "prod-square-token-placeholder",
  PORT: Number(process.env.PORT || 6001),
  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: Number(process.env.REDIS_PORT || 6379),
  SQUARE_WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "gemini-api-key-placeholder",
  TV_BASE_URL: process.env.NEXT_PUBLIC_TV_URL || "http://localhost:5003",
  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY || "new-relic-license-key-placeholder",
  NEW_RELIC_ENABLED:
    !isMockEnv &&
    !isDevelopment &&
    !!process.env.NEW_RELIC_LICENSE_KEY &&
    process.env.NEW_RELIC_LICENSE_KEY !== "new-relic-license-key-placeholder",
  USDA_FDC_API_KEY: process.env.USDA_FDC_API_KEY || "DEMO_KEY",
  VERCEL_AI_GATEWAY_API_KEY: process.env.VERCEL_AI_GATEWAY_API_KEY || "",
  VISION_PROVIDER: process.env.VISION_PROVIDER || "cloud",
  OLLAMA_HOST: process.env.OLLAMA_HOST || "http://localhost:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL || "llama3.2-vision",
});
