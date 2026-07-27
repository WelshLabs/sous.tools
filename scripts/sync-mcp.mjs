import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const environment = process.env.INFISICAL_ENV || 'staging';
  const projectId = process.env.INFISICAL_PROJECT_ID;
  const token = process.env.INFISICAL_TOKEN;

  async function getSecret(name) {
    if (!token || !projectId) return '';
    try {
      const res = await fetch(`https://app.infisical.com/api/v3/secrets/raw/${name}?workspaceId=${projectId}&environment=${environment}&secretPath=/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) {
        return '';
      }
      const data = await res.json();
      return data.secret.secretValue;
    } catch (e) {
      return '';
    }
  }

  const SIGNAGE_GITHUB_PAT = await getSecret('SIGNAGE_GITHUB_PAT') || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || process.env.GITHUB_TOKEN || '';
  const INFISICAL_TOKEN = process.env.INFISICAL_TOKEN || await getSecret('INFISICAL_TOKEN');
  const NEW_RELIC_API_KEY = await getSecret('NEW_RELIC_API_KEY') || '';
  const NEW_RELIC_ACCOUNT_ID = await getSecret('NEW_RELIC_ACCOUNT_ID') || '';
  const VERCEL_TOKEN = await getSecret('VERCEL_TOKEN') || '';
  const NEO4J_PASSWORD = await getSecret('NEO4J_PASSWORD') || 'password';

  const mcpServers = {
    "github": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": SIGNAGE_GITHUB_PAT
      }
    },
    "code-indexer": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "chunkhound-mcp-server"],
      "env": {
        "PROJECT_PATH": "/workspace"
      }
    },
    "qdrant-memory": {
      "type": "http",
      "url": "http://qdrant:6333"
    },
    "infisical": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "@infisical/mcp-server"],
      "env": {
        "INFISICAL_TOKEN": INFISICAL_TOKEN
      }
    },
    "new-relic": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "mcp-server-newrelic"],
      "env": {
        "NEW_RELIC_API_KEY": NEW_RELIC_API_KEY,
        "NEW_RELIC_ACCOUNT_ID": NEW_RELIC_ACCOUNT_ID
      }
    },
    "supabase": {
      "type": "http",
      "url": "http://supabase:8000"
    },
    "redis": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-redis"],
      "env": {
        "REDIS_URL": "redis://redis:6379"
      }
    },
    "neo4j": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-neo4j"],
      "env": {
        "NEO4J_URL": "bolt://neo4j:7687",
        "NEO4J_USER": "neo4j",
        "NEO4J_PASSWORD": NEO4J_PASSWORD
      }
    },
    "vercel": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "mcp-server-vercel"],
      "env": {
        "VERCEL_TOKEN": VERCEL_TOKEN
      }
    },
    "docker": {
      "type": "command",
      "command": "npx",
      "args": ["-y", "mcp-server-docker"],
      "env": {
        "DOCKER_HOST": "unix:///var/run/docker.sock",
        "DOCKER_READ_ONLY": "true"
      }
    }
  };

  const envFileContent = `MCP_SERVERS=${JSON.stringify(mcpServers)}\n`;
  fs.writeFileSync(path.join(__dirname, '../mcp_servers.local.env'), envFileContent);
  console.log('Successfully generated mcp_servers.local.env');
}

main().catch(console.error);
