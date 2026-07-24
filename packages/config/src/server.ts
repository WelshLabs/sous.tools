import { z } from "zod";

export const serverSchema = z.object({
  NODE_ENV: z.string().default("development"),
  IS_PRODUCTION: z.boolean().default(false),
  IS_MOCK_ENV: z.boolean().default(false),
  IS_SECURE_ENV: z.boolean().default(false),

  PORT: z.coerce.number().default(3001),
  REDIS_HOST: z.string().default("127.0.0.1"),
  REDIS_PORT: z.coerce.number().default(6379),

  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string().optional().default(""),

  SUPABASE_ACCESS_TOKEN: z
    .string()
    .default("placeholder-service-role-key-from-mock-sync"),
  SUPABASE_PROJECT_TOKEN: z
    .string()
    .default("placeholder-service-role-key-from-mock-sync"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .default("placeholder-service-role-key-from-mock-sync"),
  SUPABASE_URL: z.string().default("https://placeholder-project.supabase.co"),
  SUPABASE_DIRECT_URL: z
    .string()
    .default("https://placeholder-project.supabase.co"),
  SUPABASE_WEBHOOK_SECRET: z
    .string()
    .default("sous-tools-neo4j-sync-secret-key"),

  GITHUB_ID: z.string().optional().default(""),
  GITHUB_SECRET: z.string().optional().default(""),
  AUTH_SECRET: z.string().optional().default(""),

  NEW_RELIC_LICENSE_KEY: z.string().optional().default(""),
  NEW_RELIC_APP_NAME: z.string().optional().default(""),
  NEW_RELIC_ENABLED: z.boolean().default(false),

  GEMINI_API_KEY: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),

  SQUARE_CLIENT_ID: z.string().optional().default(""),
  SQUARE_CLIENT_SECRET: z.string().optional().default(""),
  SQUARE_ENVIRONMENT: z.string().default("sandbox"),
  SQUARE_ACCESS_TOKEN: z.string().optional().default(""),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().optional().default(""),

  USDA_FDC_API_KEY: z.string().optional().default("DEMO_KEY"),
  OLLAMA_HOST: z.string().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default("llava"),
  VISION_PROVIDER: z.string().default("openai"),

  APP_VERSION: z.string().default("dev-local"),
  SOUS_KIOSK_MODE_FILE: z.string().default("/etc/sous/kiosk-mode"),
  SOUS_DEVICE_CONFIG: z.string().default("/etc/sous/device-config.json"),
  SOUS_BOOTSTRAP_LOG: z.string().default("/var/log/sous-bootstrap.log"),

  NEO4J_URI: z.string().default("bolt://localhost:7687"),
  NEO4J_USERNAME: z.string().default("neo4j"),
  NEO4J_PASSWORD: z.string().default("sousToolsPassword"),
});

export type ServerConfig = z.infer<typeof serverSchema>;

const isProd = process.env.NODE_ENV === "production";
const isMock = process.env.IS_MOCK_ENV === "true";
const isSecure = isProd || process.env.ENVIRONMENT === "staging";

export const serverConfig: ServerConfig = serverSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_PRODUCTION: isProd,
  IS_MOCK_ENV: isMock,
  IS_SECURE_ENV: isSecure,

  PORT: process.env.PORT,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,

  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY:
    process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY,

  SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN,
  SUPABASE_PROJECT_TOKEN: process.env.SUPABASE_PROJECT_TOKEN,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_DIRECT_URL: process.env.SUPABASE_DIRECT_URL,
  SUPABASE_WEBHOOK_SECRET: process.env.SUPABASE_WEBHOOK_SECRET,

  GITHUB_ID: process.env.GITHUB_ID,
  GITHUB_SECRET: process.env.GITHUB_SECRET,
  AUTH_SECRET: process.env.AUTH_SECRET,

  NEW_RELIC_LICENSE_KEY: process.env.NEW_RELIC_LICENSE_KEY,
  NEW_RELIC_APP_NAME: process.env.NEW_RELIC_APP_NAME,
  NEW_RELIC_ENABLED: process.env.NEW_RELIC_ENABLED === "true",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  SQUARE_CLIENT_ID: process.env.SQUARE_CLIENT_ID,
  SQUARE_CLIENT_SECRET: process.env.SQUARE_CLIENT_SECRET,
  SQUARE_ENVIRONMENT: process.env.SQUARE_ENVIRONMENT,
  SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN,
  SQUARE_WEBHOOK_SIGNATURE_KEY: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY,

  USDA_FDC_API_KEY: process.env.USDA_FDC_API_KEY,
  OLLAMA_HOST: process.env.OLLAMA_HOST,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  VISION_PROVIDER: process.env.VISION_PROVIDER,

  APP_VERSION: process.env.APP_VERSION,
  SOUS_KIOSK_MODE_FILE: process.env.SOUS_KIOSK_MODE_FILE,
  SOUS_DEVICE_CONFIG: process.env.SOUS_DEVICE_CONFIG,
  SOUS_BOOTSTRAP_LOG: process.env.SOUS_BOOTSTRAP_LOG,

  NEO4J_URI: process.env.NEO4J_URI,
  NEO4J_USERNAME: process.env.NEO4J_USERNAME,
  NEO4J_PASSWORD: process.env.NEO4J_PASSWORD,
});
