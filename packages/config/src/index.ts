import { z } from "zod";

const baseSchema = z.object({
  SQUARE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  API_BASE_URL: z.string().default("http://localhost:3001"),
  APP_BASE_URL: z.string().default("http://localhost:3000"),
  PORT: z.coerce.number().default(3001),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),
  TV_BASE_URL: z.string().default("http://localhost:3003"),
  VISION_PROVIDER: z.string().default("cloud"),
  OLLAMA_HOST: z.string().default("http://localhost:11434"),
  OLLAMA_MODEL: z.string().default("llama3.2-vision"),
  USDA_FDC_API_KEY: z.string().default("DEMO_KEY"),
});

const devSchema = baseSchema.extend({
  IS_DEVELOPMENT: z.literal(true).default(true),
  IS_MOCK_ENV: z.boolean().default(true),
  SUPABASE_URL: z.string().default("https://placeholder-project.supabase.co"),
  SUPABASE_ANON_KEY: z.string().default("placeholder-anon-key"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default("placeholder-service-role"),
  SQUARE_CLIENT_ID: z.string().default("sandbox-sq0idb-placeholder"),
  SQUARE_CLIENT_SECRET: z.string().default("sandbox-sq0csp-placeholder"),
  GOOGLE_CLIENT_ID: z.string().default("google-client-id-placeholder"),
  GOOGLE_CLIENT_SECRET: z.string().default("google-client-secret-placeholder"),
  PRODUCTION_SQUARE_ACCESS_TOKEN: z.string().default("prod-square-token-placeholder"),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().default(""),
  GEMINI_API_KEY: z.string().default("gemini-api-key-placeholder"),
  NEW_RELIC_LICENSE_KEY: z.string().default("new-relic-license-key-placeholder"),
  NEW_RELIC_ENABLED: z.boolean().default(false),
  VERCEL_AI_GATEWAY_API_KEY: z.string().default(""),
});

const prodSchema = baseSchema.extend({
  IS_DEVELOPMENT: z.literal(false).default(false),
  IS_MOCK_ENV: z.literal(false).default(false),
  SUPABASE_URL: z.string().min(1),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SQUARE_CLIENT_ID: z.string().min(1),
  SQUARE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  PRODUCTION_SQUARE_ACCESS_TOKEN: z.string().min(1),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  NEW_RELIC_LICENSE_KEY: z.string().optional(),
  NEW_RELIC_ENABLED: z.boolean().default(true),
  VERCEL_AI_GATEWAY_API_KEY: z.string().optional(),
});

export type Config = Omit<z.infer<typeof prodSchema>, "IS_DEVELOPMENT" | "IS_MOCK_ENV"> & {
  IS_DEVELOPMENT: boolean;
  IS_MOCK_ENV: boolean;
};

function loadConfig(): Config {
  const env = process.env;
  
  // Basic boolean conversions
  const parsedEnv: Record<string, unknown> = { ...env };
  
  // Merge Next.js public env vars if server vars are missing
  parsedEnv.SUPABASE_URL = parsedEnv.SUPABASE_URL || parsedEnv.NEXT_PUBLIC_SUPABASE_URL;
  parsedEnv.SUPABASE_ANON_KEY = parsedEnv.SUPABASE_ANON_KEY || parsedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  parsedEnv.TV_BASE_URL = parsedEnv.TV_BASE_URL || parsedEnv.NEXT_PUBLIC_TV_URL;

  const isProd = env.NODE_ENV === "production";
  
  if (isProd) {
    parsedEnv.IS_DEVELOPMENT = false;
    parsedEnv.IS_MOCK_ENV = false;
    
    const parsed = prodSchema.safeParse(parsedEnv);
    if (!parsed.success) {
      console.error("❌ Invalid Production Environment Variables:", parsed.error.format());
      process.exit(1);
    }
    return Object.freeze(parsed.data);
  } else {
    parsedEnv.IS_DEVELOPMENT = true;
    
    const isMockEnv =
      String(env.INFISICAL_MOCK).toLowerCase() === "true" ||
      env.NODE_ENV === "test" ||
      env.VITEST === "true" ||
      (typeof parsedEnv.SUPABASE_URL === "string" && parsedEnv.SUPABASE_URL.includes("placeholder-project.supabase.co"));
      
    parsedEnv.IS_MOCK_ENV = isMockEnv;
    
    // Auto-enable new relic locally if you provide a real key
    const hasRealNewRelicKey = 
      !!env.NEW_RELIC_LICENSE_KEY && 
      env.NEW_RELIC_LICENSE_KEY !== "new-relic-license-key-placeholder";
    parsedEnv.NEW_RELIC_ENABLED = !isMockEnv && hasRealNewRelicKey;

    const parsed = devSchema.safeParse(parsedEnv);
    if (!parsed.success) {
      console.error("❌ Invalid Development Environment Variables:", parsed.error.format());
      process.exit(1);
    }
    // We cast to unknown then to Config to satisfy TS because devSchema has literal trues
    return Object.freeze(parsed.data) as unknown as Config;
  }
}

export const config: Config = loadConfig();
