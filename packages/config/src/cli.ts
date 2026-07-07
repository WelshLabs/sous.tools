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
  API_BASE_URL: "http://localhost:6001",
  APP_BASE_URL: "http://localhost:5001",
  PRODUCTION_SQUARE_ACCESS_TOKEN: "prod-square-token-placeholder",
  PORT: "6001",
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "6379",
  NEW_RELIC_LICENSE_KEY: "new-relic-license-key-placeholder",
  GEMINI_API_KEY: "gemini-api-key-placeholder",
  USDA_FDC_API_KEY: "DEMO_KEY",
  VERCEL_AI_GATEWAY_API_KEY: "",
  SUPABASE_URL: "https://placeholder-project.supabase.co",
  SUPABASE_ANON_KEY: "placeholder-anon-key-from-mock-sync",
  SUPABASE_SERVICE_ROLE_KEY: "placeholder-service-role-key-from-mock-sync",
};

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

    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(finalSecrets, null, 2), "utf8");
    return finalSecrets;
  } catch (error) {
    console.error("[@soustools/config] Infisical fetch failed:", (error as Error).message);
    return loadCache();
  }
}

function loadCache(): Record<string, string> {
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
