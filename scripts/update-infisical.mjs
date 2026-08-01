import { InfisicalSDK } from "@infisical/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

async function run() {
  const client = new InfisicalSDK();
  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
  });

  const projectId = process.env.INFISICAL_PROJECT_ID;
  const environment = "dev";

  console.log("Fetching current secrets...");
  const res = await client.secrets().listSecrets({ environment, projectId });
  
  const hostedUrlSecret = res.secrets.find((s) => s.secretKey === "SUPABASE_URL");
  if (!hostedUrlSecret) {
    throw new Error("Could not find SUPABASE_URL to copy from.");
  }
  const hostedUrl = hostedUrlSecret.secretValue;

  console.log(`Updating NEXT_PUBLIC_SUPABASE_URL to ${hostedUrl}`);
  
  try {
    await client.secrets().updateSecret({
      environment,
      projectId,
      secretName: "NEXT_PUBLIC_SUPABASE_URL",
      secretValue: hostedUrl,
    });
    console.log("Successfully updated NEXT_PUBLIC_SUPABASE_URL");
  } catch (err) {
    console.log("Update failed, trying to create instead...", err.message);
    await client.secrets().createSecret({
      environment,
      projectId,
      secretName: "NEXT_PUBLIC_SUPABASE_URL",
      secretValue: hostedUrl,
    });
    console.log("Successfully created NEXT_PUBLIC_SUPABASE_URL");
  }
}

run().catch(console.error);
