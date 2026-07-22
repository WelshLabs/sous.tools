#!/usr/bin/env node
import { spawn } from "child_process";
import * as path from "path";
import { fileURLToPath } from "url";
import { InfisicalSDK } from "@infisical/sdk";
import * as dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load local .env file inside workspace root if present
dotenv.config({ path: path.join(__dirname, "../../../.env") });

/**
 * Fetches secrets from Infisical and returns them as an in-memory object.
 *
 * Strict "Fail Fast" Architecture:
 * - Requires INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, and INFISICAL_PROJECT_ID.
 * - If credentials are missing or if the fetch fails, halts immediately with process.exit(1).
 * - ZERO hardcoded fallbacks or defaults objects.
 */
async function fetchSecretsStrict(): Promise<Record<string, string>> {
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const projectId = process.env.INFISICAL_PROJECT_ID;

  if (!clientId || !clientSecret || !projectId) {
    console.error(
      "[@soustools/config] FATAL: Missing Infisical credentials " +
      "(INFISICAL_CLIENT_ID / INFISICAL_CLIENT_SECRET / INFISICAL_PROJECT_ID). " +
      "Process execution halted immediately."
    );
    process.exit(1);
  }

  try {
    const client = new InfisicalSDK();
    await client.auth().universalAuth.login({ clientId, clientSecret });

    const secretsResponse = await client.secrets().listSecrets({
      environment: process.env.INFISICAL_ENV || "dev",
      projectId,
    });

    const secretsArray =
      (secretsResponse as { secrets?: Array<{ secretKey: string; secretValue: string }> }).secrets || [];

    const fetchedSecrets: Record<string, string> = {};
    for (const secret of secretsArray) {
      if (secret.secretKey && secret.secretValue !== undefined) {
        fetchedSecrets[secret.secretKey] = secret.secretValue;
      }
    }

    return fetchedSecrets;
  } catch (error) {
    console.error(
      "[@soustools/config] FATAL: Infisical secret fetch failed:",
      (error as Error).message
    );
    process.exit(1);
  }
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: sous-config <command> [args...]");
    process.exit(1);
  }

  const secrets = await fetchSecretsStrict();

  const childEnv: Record<string, string> = {
    ...secrets,
    ...(process.env as Record<string, string>),
  };

  // Explicit URL & Supabase key mapping for client environment
  if (!childEnv.NEXT_PUBLIC_SUPABASE_URL && childEnv.SUPABASE_URL) {
    childEnv.NEXT_PUBLIC_SUPABASE_URL = childEnv.SUPABASE_URL;
  }
  if (!childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY && childEnv.SUPABASE_ANON_KEY) {
    childEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY = childEnv.SUPABASE_ANON_KEY;
  }
  if (!childEnv.NEXT_PUBLIC_API_URL) {
    childEnv.NEXT_PUBLIC_API_URL = childEnv.API_BASE_URL || childEnv.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  }
  if (!childEnv.NEXT_PUBLIC_APP_URL) {
    childEnv.NEXT_PUBLIC_APP_URL = childEnv.APP_BASE_URL || childEnv.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";
  }

  const [cmd, ...cmdArgs] = args;

  if (cmd === "next" && (cmdArgs.includes("build") || cmdArgs.includes("start"))) {
    childEnv.NODE_ENV = "production";
  } else if (!childEnv.NODE_ENV) {
    childEnv.NODE_ENV = "development";
  }

  console.log(
    `[@soustools/config] Spawning command "${cmd} ${cmdArgs.join(" ")}" with NODE_ENV="${childEnv.NODE_ENV}"`
  );

  const child = spawn(cmd, cmdArgs, {
    stdio: "inherit",
    env: childEnv,
    shell: process.platform === "win32",
  });

  child.on("close", (code, signal) => {
    if (signal) {
      console.error(`\n[FATAL CRASH] Child process killed by signal: ${signal}`);
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
