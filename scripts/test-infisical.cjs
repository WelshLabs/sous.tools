const { InfisicalSDK } = require("@infisical/sdk");
require("dotenv").config({ path: ".env" });

async function run() {
  const client = new InfisicalSDK();
  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
  });

  const res = await client.secrets().listSecrets({
    environment: "dev",
    projectId: process.env.INFISICAL_PROJECT_ID,
  });

  console.log(
    "Supabase Secrets:",
    res.secrets.filter((s) => s.secretKey.includes("SUPABASE"))
  );
}

run().catch(console.error);
