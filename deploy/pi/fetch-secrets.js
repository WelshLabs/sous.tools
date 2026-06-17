#!/usr/bin/env node
const fs = require('fs');
const http = require('https');

const ENV_FILE = '/etc/sous-infisical.env';
let clientId = process.env.INFISICAL_CLIENT_ID;
let clientSecret = process.env.INFISICAL_CLIENT_SECRET;
let projectId = process.env.INFISICAL_PROJECT_ID;
let envSlug = process.env.INFISICAL_ENV || 'prod';

if (fs.existsSync(ENV_FILE)) {
  const envContent = fs.readFileSync(ENV_FILE, 'utf8');
  envContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      if (key === 'INFISICAL_CLIENT_ID') clientId = val;
      if (key === 'INFISICAL_CLIENT_SECRET') clientSecret = val;
      if (key === 'INFISICAL_PROJECT_ID') projectId = val;
      if (key === 'INFISICAL_ENV') envSlug = val;
    }
  });
}

if (!clientId || !clientSecret || !projectId) {
  console.error('[Fetch-Secrets] Error: Infisical client credentials not found in env or /etc/sous-infisical.env');
  process.exit(1);
}

function request(url, options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Status ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  try {
    console.log('[Fetch-Secrets] Logging into Infisical Universal Auth...');
    const loginData = await request('https://app.infisical.com/api/v1/auth/universal-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { clientId, clientSecret });

    const token = loginData.token;

    console.log(`[Fetch-Secrets] Fetching secrets for environment: ${envSlug}...`);
    const secretsData = await request(`https://app.infisical.com/api/v3/secrets/raw?environment=${envSlug}&projectId=${projectId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const secrets = secretsData.secrets || [];
    const supabaseUrl = secrets.find(s => s.secretKey === 'SUPABASE_URL')?.secretValue;
    const supabaseAnonKey = secrets.find(s => s.secretKey === 'SUPABASE_ANON_KEY')?.secretValue;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('SUPABASE_URL or SUPABASE_ANON_KEY not found in Infisical.');
    }

    const envContent = `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${supabaseAnonKey}\n`;
    fs.writeFileSync('/etc/sous-secrets.env', envContent);
    console.log('[Fetch-Secrets] Successfully wrote /etc/sous-secrets.env');
  } catch (err) {
    console.error('[Fetch-Secrets] Failed to fetch secrets:', err);
    process.exit(1);
  }
}

run();
