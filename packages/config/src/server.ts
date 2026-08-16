import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z.string(),
  IS_PRODUCTION: z.boolean(),
  IS_MOCK_ENV: z.boolean(),
  IS_SECURE_ENV: z.boolean(),

  PORT: z.coerce.number(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),

  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_APP_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string(),

  SUPABASE_ACCESS_TOKEN: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_DIRECT_URL: z.string(),
  SUPABASE_WEBHOOK_SECRET: z.string(),

  NEW_RELIC_LICENSE_KEY: z.string(),
  NEW_RELIC_APP_NAME: z.string(),
  NEW_RELIC_ENABLED: z.boolean(),

  OPENAI_API_KEY: z.string(),
  GEMINI_API_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  SQUARE_CLIENT_ID: z.string(),
  SQUARE_CLIENT_SECRET: z.string(),
  SQUARE_ENVIRONMENT: z.string(),
  SQUARE_ACCESS_TOKEN: z.string(),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string(),

  USDA_FDC_API_KEY: z.string(),
  TAVILY_API_KEY: z.string(),
  OLLAMA_HOST: z.string(),
  OLLAMA_MODEL: z.string(),
  VISION_PROVIDER: z.string(),

  APP_VERSION: z.string(),
  SOUS_KIOSK_MODE_FILE: z.string(),
  SOUS_DEVICE_CONFIG: z.string(),
  SOUS_BOOTSTRAP_LOG: z.string(),

  NEO4J_URI: z.string(),
  NEO4J_USERNAME: z.string(),
  NEO4J_PASSWORD: z.string(),
});

export type ServerConfig = z.infer<typeof serverSchema>;

const isProd = process.env.NODE_ENV === "production";
const isMock =
  process.env.IS_MOCK_ENV === "true" ||
  process.env.INFISICAL_MOCK === "true" ||
  process.env.NODE_ENV === "test" ||
  process.env.JEST_WORKER_ID !== undefined ||
  process.env.VITEST !== undefined;
const isSecure = isProd || process.env.ENVIRONMENT === "staging";

let parsedConfig: ServerConfig;

try {
  const isMockRun = isMock;
  parsedConfig = serverSchema.parse({
    NODE_ENV: process.env.NODE_ENV ?? (isMockRun ? "test" : undefined),
    IS_PRODUCTION: isProd,
    IS_MOCK_ENV: isMock,
    IS_SECURE_ENV: isSecure,

    PORT: process.env.PORT ?? (isMockRun ? 3000 : undefined),
    REDIS_HOST: process.env.REDIS_HOST ?? (isMockRun ? "mock" : undefined),
    REDIS_PORT: process.env.REDIS_PORT ?? (isMockRun ? 6379 : undefined),

    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY:
      process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY ??
      (isMockRun ? "mock" : undefined),

    SUPABASE_ACCESS_TOKEN:
      process.env.SUPABASE_ACCESS_TOKEN ?? (isMockRun ? "mock" : undefined),
    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? (isMockRun ? "mock" : undefined),
    SUPABASE_URL: process.env.SUPABASE_URL ?? (isMockRun ? "mock" : undefined),
    SUPABASE_DIRECT_URL:
      process.env.SUPABASE_DIRECT_URL ?? (isMockRun ? "mock" : undefined),
    SUPABASE_WEBHOOK_SECRET:
      process.env.SUPABASE_WEBHOOK_SECRET ?? (isMockRun ? "mock" : undefined),

    NEW_RELIC_LICENSE_KEY:
      process.env.NEW_RELIC_LICENSE_KEY ?? (isMockRun ? "mock" : undefined),
    NEW_RELIC_APP_NAME:
      process.env.NEW_RELIC_APP_NAME ?? (isMockRun ? "mock" : undefined),
    NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED === "true",

    OPENAI_API_KEY:
      process.env.OPENAI_API_KEY ?? (isMockRun ? "mock" : undefined),
    GEMINI_API_KEY:
      process.env.GEMINI_API_KEY ?? (isMockRun ? "mock" : undefined),
    GOOGLE_CLIENT_ID:
      process.env.GOOGLE_CLIENT_ID ?? (isMockRun ? "mock" : undefined),
    GOOGLE_CLIENT_SECRET:
      process.env.GOOGLE_CLIENT_SECRET ?? (isMockRun ? "mock" : undefined),

    SQUARE_CLIENT_ID:
      process.env.SQUARE_CLIENT_ID ?? (isMockRun ? "mock" : undefined),
    SQUARE_CLIENT_SECRET:
      process.env.SQUARE_CLIENT_SECRET ?? (isMockRun ? "mock" : undefined),
    SQUARE_ENVIRONMENT:
      process.env.SQUARE_ENVIRONMENT ?? (isMockRun ? "mock" : undefined),
    SQUARE_ACCESS_TOKEN:
      process.env.SQUARE_ACCESS_TOKEN ?? (isMockRun ? "mock" : undefined),
    SQUARE_WEBHOOK_SIGNATURE_KEY:
      process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ??
      (isMockRun ? "mock" : undefined),

    USDA_FDC_API_KEY:
      process.env.USDA_FDC_API_KEY ?? (isMockRun ? "mock" : undefined),
    TAVILY_API_KEY:
      process.env.TAVILY_API_KEY ?? (isMockRun ? "mock" : undefined),
    OLLAMA_HOST: process.env.OLLAMA_HOST ?? (isMockRun ? "mock" : undefined),
    OLLAMA_MODEL: process.env.OLLAMA_MODEL ?? (isMockRun ? "mock" : undefined),
    VISION_PROVIDER:
      process.env.VISION_PROVIDER ?? (isMockRun ? "mock" : undefined),

    APP_VERSION: process.env.APP_VERSION ?? (isMockRun ? "mock" : undefined),
    SOUS_KIOSK_MODE_FILE:
      process.env.SOUS_KIOSK_MODE_FILE ?? (isMockRun ? "mock" : undefined),
    SOUS_DEVICE_CONFIG:
      process.env.SOUS_DEVICE_CONFIG ?? (isMockRun ? "mock" : undefined),
    SOUS_BOOTSTRAP_LOG:
      process.env.SOUS_BOOTSTRAP_LOG ?? (isMockRun ? "mock" : undefined),

    NEO4J_URI: process.env.NEO4J_URI ?? (isMockRun ? "mock" : undefined),
    NEO4J_USERNAME:
      process.env.NEO4J_USERNAME ?? (isMockRun ? "mock" : undefined),
    NEO4J_PASSWORD:
      process.env.NEO4J_PASSWORD ?? (isMockRun ? "mock" : undefined),
  });
} catch (error) {
  console.error(
    "[@soustools/config] FATAL: Missing or invalid environment variables from Infisical.",
    error,
  );
  process.exit(1);
}

export const serverConfig = parsedConfig;
