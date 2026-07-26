const path = require('path');
const fs = require('fs');

// Load environment variables from .env file at the project root if present
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
      process.env[key] = val;
    }
  });
}

module.exports = {
  apps: [
    {
      name: 'api',
      script: 'pnpm',
      args: '--filter api dev',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        PORT: 3001,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
    {
      name: 'web',
      script: 'pnpm',
      args: '--filter web dev',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        PORT: 3000,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
    {
      name: 'pos',
      script: 'pnpm',
      args: '--filter pos-simulator dev',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        PORT: 3003,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
    {
      name: 'setup',
      script: 'pnpm',
      args: '--filter setup-portal dev',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        PORT: 3002,
        NODE_ENV: 'staging',
        ...rootEnv,
      },
    },
  ],
};
