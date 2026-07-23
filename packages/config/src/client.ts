import { z } from "zod";

export const clientSchema = z.object({
  NODE_ENV: z.string().default("development"),
  IS_MOCK_ENV: z.boolean().default(false),
  NEXT_PUBLIC_API_URL: z.string().default("http://localhost:3001"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().default("https://placeholder-project.supabase.co"),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string().optional().default(""),
});

export type ClientConfig = z.infer<typeof clientSchema>;

/**
 * Validates and exports client-side configuration.
 * Explicitly maps process.env.NEXT_PUBLIC_... properties so the Next.js
 * static compiler can inject them at build time.
 */
export const clientConfig: ClientConfig = clientSchema.parse({
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_MOCK_ENV: process.env.IS_MOCK_ENV === "true",
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY,
});
