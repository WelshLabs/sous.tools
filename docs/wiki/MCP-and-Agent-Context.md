# MCP, Agent Context & Agentic Workflow Reference

> **This is the canonical reference for all agents (WSL, cptr, code-server/editor).**
> Before making architectural decisions or infrastructure changes, query Qdrant first.

---

## 1. Environment Parity

All three development environments are **identical in capabilities**:

| Feature     | WSL (antigravity-cli)                   | cptr container                     | editor (code-server)                    |
| ----------- | --------------------------------------- | ---------------------------------- | --------------------------------------- |
| Terminal    | zsh + oh-my-zsh + p10k                  | zsh + oh-my-zsh + p10k             | bash (zsh planned)                      |
| MCP Servers | `~/.config/antigravity/mcp_config.json` | `.cptr/config.toml` (tool_servers) | `~/.config/antigravity/mcp_config.json` |
| LLM Gateway | `https://ai.sous.tools/v1`              | `https://ai.sous.tools/v1`         | `https://ai.sous.tools/v1`              |
| Qdrant URL  | `http://qdrant.sous.tools`              | `http://qdrant.sous.tools`         | `http://qdrant.sous.tools`              |
| API Key     | `sk-1234`                               | `sk-1234`                          | `sk-1234`                               |

---

## 2. MCP Server Inventory (All 12 Servers)

| ID              | Name          | Type                                        | Notes                           |
| --------------- | ------------- | ------------------------------------------- | ------------------------------- |
| `open-terminal` | Open Terminal | stdio `smart-terminal-mcp`                  | Shell access                    |
| `redis`         | Redis         | stdio `@modelcontextprotocol/server-redis`  | `redis://redis:6379`            |
| `neo4j`         | Neo4J         | stdio `mcp-neo4j-cypher`                    | `bolt://neo4j:7687`             |
| `docker`        | Docker        | stdio `mcp-server-docker`                   | `unix:///var/run/docker.sock`   |
| `qdrant`        | Qdrant        | stdio `mcp-server-qdrant`                   | `http://qdrant.sous.tools`      |
| `n8n`           | N8N           | stdio `@leonardsellem/n8n-mcp-server`       | `http://n8n:5678`               |
| `github`        | GitHub        | stdio `@modelcontextprotocol/server-github` | `GITHUB_PERSONAL_ACCESS_TOKEN`  |
| `infisical`     | Infisical     | stdio `@infisical/mcp-server`               | `INFISICAL_TOKEN`               |
| `supabase_dev`  | Supabase Dev  | HTTP `mcp.supabase.com`                     | project: `kkcssjebliaasgjyqqbj` |
| `supabase_prod` | Supabase Prod | HTTP `mcp.supabase.com`                     | project: `rdzjkbfwhgnboqtuqhgv` |
| `new_relic`     | New Relic     | HTTP `mcp.newrelic.com`                     | Observability                   |
| `vercel`        | Vercel        | stdio `github:Quegenx/vercel-mcp-server`    | Deployments                     |

---

## 3. Qdrant Memory Protocol (MANDATORY)

### Connection

- **External URL**: `http://qdrant.sous.tools` (used by all dev environments)
- **Internal URL** (prod containers only): `http://qdrant:6333`

### Collections

| Collection          | Purpose                                              | ID Range |
| ------------------- | ---------------------------------------------------- | -------- |
| `sous_tools_memory` | Architecture, stack, constraints, bugfixes, memories | 1–99     |
| `sous_tools_adrs`   | Architectural Decision Records (ADRs)                | 101+     |

### Rules

1. **BEFORE** any infrastructure change, architecture decision, or Docker modification → **search Qdrant** for relevant context
2. **AFTER** resolving a bug, making a decision, or completing a feature → **write to Qdrant** via MCP
3. Tag all new memories: `[INFRASTRUCTURE]`, `[BUGFIX]`, `[STACK]`, `[SECRETS]`, `[AI_GATEWAY]`, `[DEVOPS_WORKFLOW]`, `[MCP]`, `[PLANNING_PROTOCOL]`, `[TECH_DEBT]`, `[SECURITY]`, `[GRAPH]`

### Syncing Initial Memory

```bash
# Run from any environment with Python + qdrant-client
python3 scripts/populate_qdrant.py
```

Or via Docker:

```bash
docker compose --profile prod run --rm qdrant-sync
```

---

## 4. AI Infrastructure (PROD-ONLY — Critical Rule)

> [!CAUTION]
> **AI infrastructure runs EXCLUSIVELY on Oracle Cloud (prod profile).**
> Dev environments connect via public URLs. Never add `litellm`, `ollama`, `qdrant`, or `qdrant-sync` to the `dev` Docker Compose profile.

| Service            | Internal (prod containers) | External (dev environments)      |
| ------------------ | -------------------------- | -------------------------------- |
| LiteLLM AI Gateway | `http://litellm:4000/v1`   | `https://ai.sous.tools/v1`       |
| Qdrant Vector DB   | `http://qdrant:6333`       | `http://qdrant.sous.tools`       |
| Ollama             | `http://ollama:11434`      | Not directly accessible from dev |

### LiteLLM Model Aliases

| Alias               | Backing Model                      | drop_params | Use Case                    |
| ------------------- | ---------------------------------- | ----------- | --------------------------- |
| `planner`           | `gemini/gemini-3.1-pro-preview`    | true        | Architecture planning, ADRs |
| `coder`             | `openai/qwen2.5-coder:7b` (Ollama) | **true**    | Code implementation         |
| `devops`            | `openai/qwen2.5-coder:7b` (Ollama) | **true**    | Infrastructure automation   |
| `triage`            | `openai/qwen2.5-coder:7b` (Ollama) | **true**    | Issue classification        |
| `gemini-3.1-pro`    | `gemini/gemini-3.1-pro-preview`    | true        | Direct planning calls       |
| `gemini-3.6-flash`  | `gemini/gemini-3.6-flash`          | true        | Fallback                    |
| `claude-3-7-sonnet` | `anthropic/claude-3-7-sonnet`      | true        | Complex reasoning           |

> **Why `drop_params: true` for Ollama?** `qwen2.5-coder:7b` does not support OpenAI function_call schemas. When `drop_params: false` is set, LiteLLM passes the schema through and Ollama responds with raw JSON instead of text, breaking the workflow.

---

## 5. cptr Container — Config Lifecycle (CRITICAL)

> [!WARNING]
> The `cptr` container has a **config.toml vs. SQLite (app.db) conflict**. If you modify `config.toml` while the container is running, the SQLite `config` table will **overwrite your changes** on next restart.

**Correct procedure for config changes:**

```bash
# 1. Stop cptr first
docker stop cptr

# 2. Edit the config file
nano .cptr/config.toml

# 3. Rebuild and start
docker compose --profile dev up -d --build cptr
```

**Config file location:** `.cptr/config.toml`

---

## 6. cptr Agent Personas

Configured via `chat.models` in `.cptr/config.toml`:

| Persona   | Description                                                                             |
| --------- | --------------------------------------------------------------------------------------- |
| `planner` | Lead Architect — queries Qdrant, creates GitHub Kanban tasks, makes ADRs                |
| `coder`   | Autonomous Software Engineer — implements GitHub issues, runs quality gate, creates PRs |
| `devops`  | Infrastructure manager — Infisical secrets, Docker stacks, Vercel deployments           |
| `triage`  | Fast triage agent — log analysis, issue classification, progress summaries              |

---

## 7. Autonomous Kanban DevOps Workflow

### Architecture

```
GitHub Webhook → n8n → Parse Payload → Route by Stage
                                         ├─ Ready/In Progress → Execute Coder Agent (cptr)
                                         │                          ↓
                                         │                   Check NEEDS_INPUT?
                                         │                   ├─ YES → Post GitHub comment + Discord notify
                                         │                   └─ NO → Discord review notify
                                         ├─ In Review → Discord review gate notify
                                         └─ Done → Auto-merge PR + Qdrant sync
```

### Coder Agent Execution

The n8n workflow runs `aider` inside the **cptr** container:

```bash
docker exec -i cptr bash -c '
  aider \
    --model openai/coder \
    --openai-api-base https://ai.sous.tools/v1 \
    --openai-api-key sk-1234 \
    --edit-format diff \
    --no-auto-commits \
    --yes \
    --message "[TASK]: <issue title>..."
'
```

### NEEDS_INPUT Protocol

If the agent lacks critical information, it outputs:

```
NEEDS_INPUT: <specific question>
```

n8n detects this, posts a `[NEEDS_INPUT]` comment on the GitHub issue, and notifies Discord. When a human replies, n8n resumes the agent with the response.

### n8n Workflow Sync (SSOT: `packages/workflows/`)

```bash
# After modifying any .json workflow file:
bash packages/workflows/sync.sh
```

---

## 8. Docker Compose Profile Reference

```yaml
profiles:
  dev: [traefik, redis, neo4j, cptr, editor, whisper-stt, openedai-tts]
  prod:
    [
      traefik,
      redis,
      neo4j,
      qdrant,
      qdrant-sync,
      litellm,
      ollama,
      ollama-pull,
      n8n,
      api,
    ]
```

**Dev environments never start AI infra locally.** They connect to prod via external URLs.
