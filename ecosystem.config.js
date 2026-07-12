const path = require('path');
const fs = require('fs');

// Load environment variables from .env file at the project root if it exists
const rootEnv = {};
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      } else if (val.startsWith("'") && val.endsWith("'")) {
        val = val.substring(1, val.length - 1);
      }
      rootEnv[key] = val;
      process.env[key] = val; // Set on current process so any spawned scripts can inherit it
    }
  });
}

module.exports = {
  apps: [
    {
      name: 'api',
      script: './packages/config/dist/cli.js',
      args: 'pnpm --filter api run dev', // Strictly executes our custom wrapper with pnpm command
      env: {
        PORT: 3001,
        NODE_ENV: 'staging',
        ...rootEnv, // Merge all .env variables including INFISICAL_* credentials
      },
    },
    {
      name: 'web',
      script: 'pnpm',
      args: '--filter web run dev', // Targets your main Next.js app
      env: {
        PORT: 3000,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
    {
      name: 'pos',
      script: 'pnpm',
      args: '--filter pos-simulator run dev', // Targets your dev-pos simulator app
      env: {
        PORT: 3003,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
    {
      name: 'setup',
      script: 'pnpm',
      args: '--filter setup-portal run dev', // Targets your dev-setup portal app
      env: {
        PORT: 3002,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
  ],
};