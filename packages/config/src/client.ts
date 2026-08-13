import { z } from "zod";

export const clientSchema = z.object({
  NODE_ENV: z.string().default("development"),
  IS_MOCK_ENV: z.boolean().default(false),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional().default(""),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string().optional().default(""),
});

export type ClientConfig = z.infer<typeof clientSchema>;

let parsedConfig: ClientConfig;

try {
  const isMockRun = process.env.INFISICAL_MOCK === "true";
  parsedConfig = clientSchema.parse({
    NODE_ENV: process.env.NODE_ENV ?? (isMockRun ? "test" : "development"),
    IS_MOCK_ENV: process.env.IS_MOCK_ENV === "true" || isMockRun,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      (isMockRun ? "mock" : "http://localhost:3001"),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ||
      (isMockRun ? "mock" : "http://localhost:3000"),
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || (isMockRun ? "mock" : ""),
    NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY:
      process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY ??
      process.env.NEW_RELIC_LICENSE_KEY ??
      (isMockRun ? "mock" : ""),
  });
} catch (error) {
  console.error(
    "[@soustools/config] WARNING: Missing or invalid environment variables.",
    error,
  );
  if (
    typeof process !== "undefined" &&
    typeof process.exit === "function" &&
    process.env.NODE_ENV === "production"
  ) {
    process.exit(1);
  } else {
    parsedConfig = {
      NODE_ENV: process.env.NODE_ENV || "development",
      IS_MOCK_ENV: false,
      NEXT_PUBLIC_API_URL:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
      NEXT_PUBLIC_APP_URL:
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: "",
    };
  }
}

export const clientConfig = new Proxy(parsedConfig, {
  get(target, prop: keyof ClientConfig) {
    if (typeof window !== "undefined" && window.location?.origin) {
      if (prop === "NEXT_PUBLIC_APP_URL") {
        return window.location.origin;
      }
      if (
        prop === "NEXT_PUBLIC_API_URL" &&
        window.location.hostname.includes("dev.sous.tools")
      ) {
        return "https://dev-api.sous.tools";
      }
    }
    return target[prop];
  },
});
