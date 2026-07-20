#!/usr/bin/env node
import { spawn } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";
import { InfisicalSDK } from "@infisical/sdk";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env file inside workspace root if present (dev convenience only).
// In production containers, env vars are injected by Docker / the orchestrator.
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const defaults: Record<string, string> = {
  SQUARE_CLIENT_ID: "sandbox-sq0idb-placeholder",
  SQUARE_CLIENT_SECRET: "sandbox-sq0csp-placeholder",
  GOOGLE_CLIENT_ID: "google-client-id-placeholder",
  GOOGLE_CLIENT_SECRET: "google-client-secret-placeholder",
  API_BASE_URL: "http://localhost:3001",
  APP_BASE_URL: "http://localhost:3000",
  PRODUCTION_SQUARE_ACCESS_TOKEN: "prod-square-token-placeholder",
  PORT: "3001",
  REDIS_HOST: "127.0.0.1", // Localhost default — MUST be overridden by Infisical in production
  REDIS_PORT: "6379",
  NEW_RELIC_LICENSE_KEY: "new-relic-license-key-placeholder",
  GEMINI_API_KEY: "gemini-api-key-placeholder",
  USDA_FDC_API_KEY: "DEMO_KEY",
  VERCEL_AI_GATEWAY_API_KEY: "",
  SUPABASE_URL: "https://placeholder-project.supabase.co",
  SUPABASE_ANON_KEY: "placeholder-anon-key-from-mock-sync",
  SUPABASE_SERVICE_ROLE_KEY: "placeholder-service-role-key-from-mock-sync",
  SQUARE_WEBHOOK_SIGNATURE_KEY: "sandbox-sq0whk-placeholder",
  NEO4J_URI: "bolt://localhost:7687",
  NEO4J_USERNAME: "neo4j",
  NEO4J_PASSWORD: "sousToolsPassword",
  SUPABASE_WEBHOOK_SECRET: "sous-tools-neo4j-sync-secret-key",
};

/**
 * Keys that MUST have real values fetched from Infisical in production.
 * If these still hold their placeholder/localhost defaults, the app MUST NOT boot.
 * This prevents silent ECONNREFUSED errors (e.g., REDIS_HOST defaulting to 127.0.0.1).
 */
const PRODUCTION_CRITICAL_KEYS: Array<{ key: string; placeholder: string }> = [
  { key: "REDIS_HOST", placeholder: "127.0.0.1" },
  { key: "SUPABASE_URL", placeholder: "https://placeholder-project.supabase.co" },
  { key: "SUPABASE_SERVICE_ROLE_KEY", placeholder: "placeholder-service-role-key-from-mock-sync" },
  { key: "SUPABASE_ANON_KEY", placeholder: "placeholder-anon-key-from-mock-sync" },
];

/**
 * Validates that critical production secrets are not placeholder values.
 * Calls process.exit(1) if any critical key still holds a localhost/placeholder value.
 */
function assertProductionSecrets(secrets: Record<string, string>): void {
  const isProduction = process.env.NODE_ENV === "production";
  const isMock = String(process.env.INFISICAL_MOCK).toLowerCase() === "true";
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";

  if (!isProduction || isMock || isTest) return;

  const failedKeys: string[] = [];
  for (const { key, placeholder } of PRODUCTION_CRITICAL_KEYS) {
    const value = secrets[key];
    if (!value || value === placeholder) {
      failedKeys.push(key);
    }
  }

  if (failedKeys.length > 0) {
    console.error(
      `[@soustools/config] FATAL: Production boot blocked. The following critical environment variables ` +
      `were not fetched from Infisical and still contain placeholder/localhost defaults:\n` +
      failedKeys.map((k) => `  - ${k}`).join("\n") +
      `\n\nEnsure INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, and INFISICAL_PROJECT_ID are set ` +
      `in the container environment and that Infisical is reachable.`
    );
    process.exit(1);
  }
}

/**
 * Fetches secrets from Infisical and returns them as a plain in-memory object.
 * No filesystem I/O is performed at any point — secrets never touch disk.
 *
 * In mock/test environments (INFISICAL_MOCK=true or NODE_ENV=test), returns
 * the hardcoded defaults object so CI and local dev work without Infisical.
 *
 * If Infisical credentials are missing entirely, returns defaults and lets
 * assertProductionSecrets() decide whether to halt.
 */
async function fetchSecrets(): Promise<Record<string, string>> {
  const isMock =
    String(process.env.INFISICAL_MOCK).toLowerCase() === "true" ||
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true";

  if (isMock) {
    console.log("[@soustools/config] INFISICAL_MOCK detected. Using defaults.");
    return { ...defaults };
  }

  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;

  if (!clientId || !clientSecret || !projectId) {
    console.warn(
      "[@soustools/config] Missing Infisical credentials " +
      "(INFISICAL_CLIENT_ID / INFISICAL_CLIENT_SECRET / INFISICAL_PROJECT_ID). " +
      "Returning defaults — assertProductionSecrets() will halt if NODE_ENV=production."
    );
    return { ...defaults };
  }

  try {
    const client = new InfisicalSDK();
    await client.auth().universalAuth.login({ clientId, clientSecret });

    const secretsResponse = await client.secrets().listSecrets({
      environment: process.env.INFISICAL_ENV || "dev",
      projectId,
    });

    const secretsArray = (secretsResponse as { secrets?: Array<{ secretKey: string; secretValue: string }> }).secrets || [];
    const finalSecrets: Record<string, string> = { ...defaults };

    for (const secret of secretsArray) {
      if (secret.secretKey && secret.secretValue !== undefined) {
        finalSecrets[secret.secretKey] = secret.secretValue;
      }
    }

    // Secrets are returned entirely in-memory. No filesystem writes, ever.
    return finalSecrets;
  } catch (error) {
    console.error("[@soustools/config] Infisical fetch failed:", (error as Error).message);
    // Return defaults — assertProductionSecrets() will halt if we are in production
    // and any critical key still holds a placeholder value.
    return { ...defaults };
  }
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: sous-config <command> [args...]");
    process.exit(1);
  }

  const secrets = await fetchSecrets();

  // Production safety gate: halt before spawning the child process
  // if critical secrets are still at their placeholder values.
  assertProductionSecrets(secrets);

  // Build the child environment by explicitly merging fetched secrets on top of the
  // current process environment. Secrets already present in the environment (e.g.
  // injected by Docker) take precedence over Infisical values via Object spread order.
  const childEnv: Record<string, string> = {
    ...defaults,           // lowest priority: hardcoded fallbacks
    ...secrets,            // Infisical values override defaults
    ...process.env as Record<string, string>, // host/container env takes highest priority
  };

  // Auto-map Supabase keys for Next.js browser client if not already present.
  if (!childEnv.NEXT_PUBLIC_SUPABASE_URL && childEnv.SUPABASE_URL) {
    childEnv.NEXT_PUBLIC_SUPABASE_URL = childEnv.SUPABASE_URL;
  }
  if (!childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY && childEnv.SUPABASE_ANON_KEY) {
    childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = childEnv.SUPABASE_ANON_KEY;
  }
  if (!childEnv.NEXT_PUBLIC_API_URL && childEnv.API_BASE_URL) {
    childEnv.NEXT_PUBLIC_API_URL = childEnv.API_BASE_URL;
  }

  const [cmd, ...cmdArgs] = args;

  if (cmd === "next" && (cmdArgs.includes("build") || cmdArgs.includes("start"))) {
    childEnv.NODE_ENV = "production";
  } else if (!childEnv.NODE_ENV) {
    childEnv.NODE_ENV = "development";
  }

  console.log(`[@soustools/config] Spawning command "${cmd} ${cmdArgs.join(" ")}" with NODE_ENV="${childEnv.NODE_ENV}" (host process.env.NODE_ENV="${process.env.NODE_ENV}")`);

  // Secrets are passed directly into the spawned process environment — never written
  // to disk, never shared through the filesystem.
  const child = spawn(cmd, cmdArgs, {
    stdio: "inherit",
    env: childEnv,
    shell: process.platform === "win32",
  });

  child.on("close", (code, signal) => {
    if (signal) {
      console.error(`\n[FATAL CRASH] Child process violently killed by OS signal: ${signal}`);
    }
    process.exit(code !== null ? code : 1);
  });

  ["SIGINT", "SIGTERM", "SIGQUIT"].forEach((signal) => {
    process.on(signal, () => {
      if (!child.killed) {
        child.kill(signal as NodeJS.Signals);
      }
    });
  });
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
