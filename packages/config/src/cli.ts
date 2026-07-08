#!/usr/bin/env node
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { InfisicalSDK } from "@infisical/sdk";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env file inside workspace root if present
dotenv.config({ path: path.join(__dirname, "../../../.env") });

const CACHE_FILE_PATH = path.join(__dirname, "../../.secrets.cache.json");

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
    console.warn("[@soustools/config] Missing Infisical creds. Falling back to cache.");
    return loadCache();
  }

  try {
    const client = new InfisicalSDK();
    await client.auth().universalAuth.login({ clientId, clientSecret });

    const secretsResponse = await client.secrets().listSecrets({
      environment: process.env.INFISICAL_ENV || "dev",
      projectId,
    });

    const secretsArray = (secretsResponse as any).secrets || [];
    const finalSecrets: Record<string, string> = { ...defaults };

    for (const secret of secretsArray) {
      if (secret.secretKey && secret.secretValue !== undefined) {
        finalSecrets[secret.secretKey] = secret.secretValue;
      }
    }

    // Only persist the cache to disk outside of production.
    // In Docker, the filesystem is restricted (EACCES) and writing secrets
    // to disk is a security risk. In production, secrets live in memory only.
    if (process.env.NODE_ENV !== "production") {
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(finalSecrets, null, 2), "utf8");
    }
    return finalSecrets;
  } catch (error) {
    console.error("[@soustools/config] Infisical fetch failed:", (error as Error).message);
    const cached = loadCache();
    // In production, a failed Infisical fetch with no valid cache is fatal.
    // We call assertProductionSecrets here; it will process.exit(1) if critical keys are still placeholders.
    assertProductionSecrets(cached);
    return cached;
  }
}

function loadCache(): Record<string, string> {
  // In production, the Docker filesystem is read-restricted and there is no
  // pre-written cache to load. Skip all fs access entirely — assertProductionSecrets()
  // will halt the process if the returned defaults are still placeholder values.
  if (process.env.NODE_ENV === "production") {
    console.warn("[@soustools/config] Production environment: skipping cache read. Infisical is the only source of truth.");
    return { ...defaults };
  }

  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      console.log("[@soustools/config] Loading secrets from local cache.");
      const data = fs.readFileSync(CACHE_FILE_PATH, "utf8");
      return { ...defaults, ...JSON.parse(data) };
    }
  } catch (e) {
    console.error("[@soustools/config] Failed to read cache.", e);
  }
  console.log("[@soustools/config] Using hardcoded defaults.");
  return { ...defaults };
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: sous-config <command> [args...]");
    process.exit(1);
  }

  const secrets = await fetchSecrets();

  // Final production safety gate: abort before spawning the child process
  // if critical secrets are still at their placeholder values.
  assertProductionSecrets(secrets);
  
  // Inject into process.env
  for (const [key, value] of Object.entries(secrets)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
    
    // Auto-map for Next.js browser client
    if (key === "SUPABASE_URL" && process.env.NEXT_PUBLIC_SUPABASE_URL === undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_URL = value;
    }
    if (key === "SUPABASE_ANON_KEY" && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = value;
    }
  }

  const [cmd, ...cmdArgs] = args;
  
  const child = spawn(cmd, cmdArgs, {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  });

  child.on("close", (code) => {
    process.exit(code ?? 1);
  });

  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(signal => {
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
