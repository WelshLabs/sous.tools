import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function run() {
  const clientId = process.env.INFISICAL_CLIENT_ID;
  const clientSecret = process.env.INFISICAL_CLIENT_SECRET;
  const workspaceId = process.env.INFISICAL_PROJECT_ID;

  // 1. Login
  console.log("Logging in via Universal Auth...");
  const loginRes = await fetch("https://app.infisical.com/api/v1/auth/universal-auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      clientId,
      clientSecret,
    }),
  });
  
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  
  const { accessToken } = await loginRes.json();

  // 2. Fetch current secrets to get the correct SUPABASE_URL
  console.log("Fetching secrets...");
  const getRes = await fetch(`https://app.infisical.com/api/v3/secrets/raw?environment=dev&workspaceId=${workspaceId}&secretPath=/`, {
    headers: { "Authorization": `Bearer ${accessToken}` },
  });
  
  if (!getRes.ok) {
    throw new Error(`Get secrets failed: ${await getRes.text()}`);
  }
  
  const { secrets } = await getRes.json();
  const hostedUrlSecret = secrets.find(s => s.secretKey === "SUPABASE_URL");
  if (!hostedUrlSecret) {
    throw new Error("SUPABASE_URL secret not found");
  }
  
  const targetUrl = hostedUrlSecret.secretValue;
  console.log(`Will set NEXT_PUBLIC_SUPABASE_URL to ${targetUrl}`);

  // 3. Update secret
  const updateRes = await fetch(`https://app.infisical.com/api/v3/secrets/raw/NEXT_PUBLIC_SUPABASE_URL`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      secretValue: targetUrl,
      environment: "dev",
      workspaceId,
      secretPath: "/"
    })
  });

  if (!updateRes.ok) {
    console.error(`Update failed: ${await updateRes.text()}`);
    // Might need to create if it doesn't exist, but it DOES exist because we saw it earlier
  } else {
    console.log("Successfully updated secret!");
  }
}

run().catch(console.error);
