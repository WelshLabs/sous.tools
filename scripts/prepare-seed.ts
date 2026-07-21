import * as fs from "fs";
import * as path from "path";

// Pulls from your active .env (Infisical, WSL2, or Code-Server)
const webhookUrl =
  process.env.NEO4J_SYNC_URL ||
  "http://host.docker.internal:3001/webhooks/neo4j-sync";

const templatePath = path.join(process.cwd(), "supabase/seed.template.sql");
const outputPath = path.join(process.cwd(), "supabase/seed.sql");

const template = fs.readFileSync(templatePath, "utf8");
const finalSeed = template.replace("{{NEO4J_SYNC_URL}}", webhookUrl);

fs.writeFileSync(outputPath, finalSeed);
console.log(`✅ Seed generated with Webhook URL: ${webhookUrl}`);
