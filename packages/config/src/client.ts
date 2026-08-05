import { z } from "zod";

export const clientSchema = z.object({
  NODE_ENV: z.string(),
  IS_MOCK_ENV: z.boolean(),
  NEXT_PUBLIC_API_URL: z.string(),
  NEXT_PUBLIC_APP_URL: z.string(),
  NEXT_PUBLIC_SUPABASE_URL: z.string(),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string(),
});

export type ClientConfig = z.infer<typeof clientSchema>;

let parsedConfig: ClientConfig;

try {
  const isMockRun = process.env.INFISICAL_MOCK === "true";
  parsedConfig = clientSchema.parse({
    NODE_ENV: process.env.NODE_ENV ?? (isMockRun ? "test" : undefined),
    IS_MOCK_ENV: process.env.IS_MOCK_ENV === "true" || isMockRun,
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isMockRun ? "mock" : undefined),
    NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY:
      process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY ??
      (isMockRun ? "mock" : undefined),
  });
} catch (error) {
  console.error(
    "[@soustools/config] FATAL: Missing or invalid environment variables from Infisical.",
    error,
  );
  if (typeof process !== "undefined" && process.exit) {
    process.exit(1);
  } else {
    throw error;
  }
}

/**
 * Validates and exports client-side configuration.
 * Explicitly maps process.env.NEXT_PUBLIC_... properties so the Next.js
 * static compiler can inject them at build time.
 */
export const clientConfig = parsedConfig;
