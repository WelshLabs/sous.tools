/* global process, console */
import { InfisicalSDK } from '@infisical/sdk';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
async function run() {
  const client = new InfisicalSDK();
  await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET,
  });
  const projectId = process.env.INFISICAL_PROJECT_ID;
  console.log('Fetching...');
  const res = await client.secrets().listSecrets({ environment: 'dev', projectId, path: '/' });
  const hostedUrl = res.secrets.find((s) => s.secretKey === 'SUPABASE_URL').secretValue;
  console.log('Updating to', hostedUrl);
  try {
    await client.secrets().updateSecret({
      secretName: 'NEXT_PUBLIC_SUPABASE_URL',
      secretValue: hostedUrl,
      environment: 'dev',
      projectId,
      path: '/'
    });
    console.log('Done!');
  } catch (err) {
    console.log(err);
  }
}
run();
