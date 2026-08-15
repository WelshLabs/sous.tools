import os
import sys
import json
import math
import hashlib
import random
import urllib.request
import urllib.error
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://ollama:11434")
QDRANT_HOST = os.environ.get("QDRANT_HOST", "http://qdrant:6333")
EMBED_MODEL = "nomic-embed-text"
EMBED_DIM_REAL = 768      # nomic-embed-text output dimension
EMBED_DIM_FAKE = 1536     # fallback deterministic vectors


def get_ollama_embedding(text: str) -> list[float] | None:
    """Try to get a real embedding from Ollama. Returns None if unavailable."""
    try:
        payload = json.dumps({"model": EMBED_MODEL, "prompt": text}).encode()
        req = urllib.request.Request(
            f"{OLLAMA_HOST}/api/embeddings",
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return data.get("embedding")
    except Exception:
        return None


def generate_deterministic_vector(text: str, dim: int = EMBED_DIM_FAKE) -> list[float]:
    seed = int(hashlib.sha256(text.encode('utf-8')).hexdigest(), 16) % (2**32)
    rng = random.Random(seed)
    raw = [rng.uniform(-1.0, 1.0) for _ in range(dim)]
    norm = math.sqrt(sum(x * x for x in raw))
    return [x / norm for x in raw]


def get_embedding(text: str, use_real: bool) -> list[float]:
    if use_real:
        vec = get_ollama_embedding(text)
        if vec:
            return vec
    return generate_deterministic_vector(text)


def main():
    # Probe Ollama availability once
    test_vec = get_ollama_embedding("test")
    use_real_embeddings = test_vec is not None
    vector_dim = EMBED_DIM_REAL if use_real_embeddings else EMBED_DIM_FAKE

    if use_real_embeddings:
        print(f"✅ Ollama reachable at {OLLAMA_HOST} — using real {EMBED_MODEL} embeddings ({vector_dim}-dim)")
    else:
        print(f"⚠️  Ollama not reachable — using deterministic fallback vectors ({vector_dim}-dim)")

    print(f"Connecting to Qdrant at {QDRANT_HOST}...")
    client = QdrantClient(url=QDRANT_HOST)


    # Ensure collections exist with correct vector dimension (real or fallback)
    collections_to_ensure = ["sous_tools_memory", "sous_tools_adrs"]
    existing_collections = [c.name for c in client.get_collections().collections]

    for c_name in collections_to_ensure:
        if c_name not in existing_collections:
            print(f"Creating collection '{c_name}'...")
            client.create_collection(
                collection_name=c_name,
                vectors_config=VectorParams(size=vector_dim, distance=Distance.COSINE)
            )

    # ----------------------------------------------------
    # MEMORIES & ARCHITECTURAL CONSTRAINTS
    # ----------------------------------------------------
    memories = [
        {
            "id": 1,
            "tag": "[INFRASTRUCTURE]",
            "title": "Production Server Infrastructure (Oracle Cloud ARM64)",
            "description": "Production deployment runs on Oracle Cloud 24GB RAM, 4 vCPU, ARM64 server under profile 'prod'. Edge router Traefik manages TLS via Let's Encrypt with Vercel DNS-01 challenge for *.sous.tools."
        },
        {
            "id": 2,
            "tag": "[INFRASTRUCTURE]",
            "title": "Development Terminals & Tailscale Connectivity",
            "description": "Dev workstations and terminal environments ('cptr' container, 'editor' code-server IDE) connect over Tailscale mesh network to home desktop. Dev containers run under Docker Compose profile 'dev'."
        },
        {
            "id": 3,
            "tag": "[INFRASTRUCTURE]",
            "title": "Docker Compose Profiles & Service Map (ENFORCED)",
            "description": "Docker Compose profile 'prod' (Oracle Cloud only): traefik, redis, neo4j, qdrant, qdrant-sync, litellm, ollama, ollama-pull, n8n, api. Profile 'dev' (local dev machines): traefik, redis, neo4j, cptr, editor, whisper-stt, openedai-tts. AI inference (litellm, ollama, qdrant) is STRICTLY prod-only. Dev environments connect via public URLs: ai.sous.tools (LiteLLM) and qdrant.sous.tools (Qdrant). Never add AI infra containers to the dev profile."
        },
        {
            "id": 4,
            "tag": "[INFRASTRUCTURE]",
            "title": "Local Development Server Hardware Specifications",
            "description": "The local development machine features an AMD Ryzen 9 5900x 12-core processor, 32GB RAM, and a 16GB AMD Radeon RX 6800XT GPU. It runs local models and media generation tools (Ollama, ComfyUI, Whisper STT, OpenedAI TTS) taking advantage of AMD ROCm and fast CPU inference."
        },
        {
            "id": 5,
            "tag": "[QDRANT_PROD_ONLY]",
            "title": "Qdrant Production-Only Vector Store Architecture",
            "description": "Qdrant container is strictly deployed in production (profiles: ['prod']). All dev environments, agent runners (cptr), and CLI instances (antigravity-cli) connect directly to production Qdrant at http://qdrant.sous.tools (or http://qdrant:6333 internally)."
        },
        {
            "id": 5,
            "tag": "[STACK]",
            "title": "Monorepo Technology Stack Overview",
            "description": "sous.tools is a pnpm monorepo managed with Turborepo. Frontend: Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion, Lucide icons. Backend: NestJS, Supabase (PostgreSQL), Redis (BullMQ queues & caching), Neo4j (Graph database)."
        },
        {
            "id": 6,
            "tag": "[STACK]",
            "title": "Applications Directory Map (apps/*)",
            "description": "apps/api (NestJS backend API & Supabase interface), apps/web (Next.js 16 primary kitchen OS dashboard), apps/pos-simulator (Point-of-Sale simulator), apps/setup-portal (Onboarding wizard), apps/storybook (Design System catalog), apps/wearos (Kitchen wearable app), apps/cli (CLI tools)."
        },
        {
            "id": 7,
            "tag": "[STACK]",
            "title": "Domain Packages Directory Map (packages/*)",
            "description": "packages/api-client (transport layer & token refresh mutex), packages/config (Infisical SSOT Zod validated config), packages/design-system (Tailwind v4 Midnight Slate UI primitives), domain packages (domain-inventory, domain-pos, domain-recipes, domain-settings, domain-signage), packages/logger, packages/api-types."
        },
        {
            "id": 8,
            "tag": "[SECRETS]",
            "title": "Infisical Secret SSOT & Strict Config Lockdown Protocol",
            "description": "Infisical is the Single Source of Truth for all secrets and environment variables. process.env is strictly banned outside of @soustools/config. Config package validates with Zod and triggers process.exit(1) immediately if credentials are missing or invalid. Zero default string fallbacks allowed."
        },
        {
            "id": 9,
            "tag": "[SECURITY]",
            "title": "Supabase Security Firewall & API Isolation",
            "description": "Strict Supabase Firewall: No client app or UI component (Next.js, WearOS, POS simulator) is permitted to import database clients or connect directly to Supabase. All data access must pass through apps/api via packages/api-client."
        },
        {
            "id": 10,
            "tag": "[GRAPH]",
            "title": "PostgreSQL & Neo4j Relational-Graph 1:1 Parity",
            "description": "PostgreSQL (relational DB) and Neo4j (graph DB) must stay in perfect 1:1 synchronization. Schema changes in PostgreSQL are automatically registered in schema-registry.ts and propagated via sync webhooks."
        },
        {
            "id": 11,
            "tag": "[AI_GATEWAY]",
            "title": "Centralized LLM Gateway (LiteLLM & Ollama)",
            "description": "LiteLLM running on Oracle Cloud (https://ai.sous.tools/v1) serves as universal AI proxy. High-intelligence models (Gemini 3.1 Pro) reserved for Planning Agent. Free local Ollama (qwen2.5-coder:7b) assigned to autonomous Coder/DevOps execution agents with drop_params: false for function calls."
        },
        {
            "id": 12,
            "tag": "[MCP]",
            "title": "12 Configured MCP Servers & Context Unification",
            "description": "12 configured MCP servers: Qdrant, Neo4j, GitHub, Docker, Infisical, n8n, Supabase Dev, Supabase Prod, New Relic, Vercel, Redis, Open Terminal. Synchronized between antigravity-cli and cptr via .cptr/mcp_config.json and .cptr/config.toml."
        },
        {
            "id": 13,
            "tag": "[TECH_DEBT]",
            "title": "Current Codebase Health & Quality Audit Metrics",
            "description": "Typecheck: 100% pass (18/18 packages). Linters: 100% pass with 4 typeless package.json warnings in web, cli, api, pos-simulator. Unit Tests: 100% pass across all 12 test suites. Knip Audit: 57 unused UI props/interfaces identified across domain packages requiring cleanup."
        },
        {
            "id": 14,
            "tag": "[TECH_DEBT]",
            "title": "Package.json Typeless Warning Remediation",
            "description": "apps/web, apps/cli, apps/api, and apps/pos-simulator trigger Node MODULE_TYPELESS_PACKAGE_JSON warnings during linting. Fix: Add 'type': 'module' to their respective package.json files."
        },
        {
            "id": 15,
            "tag": "[DEVOPS_WORKFLOW]",
            "title": "Autonomous Kanban DevOps Multi-Agent Workflow",
            "description": "Planning Agent (Gemini 3.1 Pro) creates atomic GitHub issues in 'Ready' column. n8n triggers Coder Agent using free local Ollama (qwen2.5-coder:7b) to implement code, run typecheck/lint/test gauntlet, and move issue to 'In Review'."
        },
        {
            "id": 16,
            "tag": "[UI_PHILOSOPHY]",
            "title": "Glacier Philosophy & Container/View Component Rules",
            "description": "97% complex AI backend, 3% simple zero-ambiguity UI. Pure presentational UI lives in *.tsx. Business logic and API state live in *.container.tsx. apps/* page router shells must remain hollow entrypoints."
        },
        {
            "id": 17,
            "tag": "[PLANNING_PROTOCOL]",
            "title": "Interactive Planning Sessions, Qdrant ADR Sync & Kanban Task Creation",
            "description": "In-depth planning sessions run with highest intelligence models (Gemini 3.1 Pro / Claude 3.7 Sonnet). Upon session completion, the Planning Agent automatically: (1) Updates Qdrant memory/ADRs, and (2) Creates atomic and/or epic GitHub issues assigned to the GitHub Kanban board ('Ready' column) for free local Ollama execution agents."
        },
        {
            "id": 18,
            "tag": "[INFRASTRUCTURE][BUGFIX]",
            "title": "cptr Container Config Lifecycle Rule (CRITICAL)",
            "description": "The cptr container uses config.toml as its primary config file, but SQLite (app.db, config table) acts as a persistent override layer. If the container is RUNNING when config.toml is modified, the SQLite layer will WIN and overwrite your changes on next restart. CORRECT PROCEDURE: (1) docker stop cptr, (2) edit .cptr/config.toml, (3) docker compose --profile dev up -d --build cptr. Never edit config.toml while cptr is running."
        },
        {
            "id": 19,
            "tag": "[AI_GATEWAY][INFRASTRUCTURE]",
            "title": "LiteLLM & Qdrant Connection URLs for Dev Environments",
            "description": "Dev environments (WSL, cptr container, code-server/editor) use local Docker service names for Qdrant ('http://qdrant:6333') since the container was moved to the dev environment. Qdrant is no longer exposed publicly. LiteLLM AI Gateway -> https://ai.sous.tools/v1 (api_key: sk-1234) which points to the Tailscale IP of the dev machine."
        },
        {
            "id": 20,
            "tag": "[DEVOPS_WORKFLOW][BUGFIX]",
            "title": "Aider + n8n Kanban Agent Execution Environment",
            "description": "The autonomous kanban coder agent runs aider inside the 'cptr' Docker container via: docker exec -i cptr bash -c '...'. It uses aider with --model openai/coder --openai-api-base https://ai.sous.tools/v1 --openai-api-key sk-1234. The 'coder' model alias is defined in litellm_config.yaml and maps to qwen2.5-coder:7b via Ollama with drop_params: true to prevent JSON-only failures from Ollama models that do not support function_call schemas. NEEDS_INPUT signal handling: if aider outputs 'NEEDS_INPUT: <question>', n8n posts a comment on the GitHub issue and notifies Discord."
        },
        {
            "id": 21,
            "tag": "[MCP][INFRASTRUCTURE]",
            "title": "Qdrant MCP Collection Schema",
            "description": "Two Qdrant collections: 'sous_tools_memory' (architecture, stack info, constraints, bugfixes, memories — IDs 1-99) and 'sous_tools_adrs' (Architectural Decision Records — IDs 101+). Vector embeddings via nomic-embed-text (768-dim) from Ollama when available, or deterministic fallback (1536-dim). Agents should search BOTH collections before making architectural decisions or infrastructure changes."
        },
        {
            "id": 22,
            "tag": "[INFRASTRUCTURE][SSH]",
            "title": "Production Server SSH Access",
            "description": "The production server (Oracle Cloud) can be accessed natively via the `prod-ssh` alias defined in `.config/terminal/.zsh_aliases`. The connection uses the `ubuntu` user, the workspace `ssh-key.key`, and connects to `129.158.244.62`. The workspace directory on prod is `~/prod.sous.tools`."
        }
    ]
    print(f"Upserting {len(memories)} memories into 'sous_tools_memory'...")
    memory_points = []
    for item in memories:
        text_to_embed = f"{item['tag']} {item['title']}: {item['description']}"
        vec = get_embedding(text_to_embed, use_real_embeddings)
        memory_points.append(
            PointStruct(
                id=item["id"],
                vector=vec,
                payload={
                    "tag": item["tag"],
                    "title": item["title"],
                    "description": item["description"]
                }
            )
        )
    client.upsert(collection_name="sous_tools_memory", points=memory_points)
    print("Memory points upserted successfully.")

    # ----------------------------------------------------
    # ARCHITECTURAL DECISION RECORDS (ADRs)
    # ----------------------------------------------------
    adrs = [
        {
            "id": 101,
            "adr_id": "ADR-001",
            "title": "Supabase Security Firewall & API-First Architecture",
            "status": "Accepted",
            "context": "Direct database connections from frontends create security risks and break encapsulation.",
            "decision": "All network requests must route strictly through NestJS apps/api via packages/api-client. UI packages and Next.js apps are strictly forbidden from importing database clients or accessing Supabase."
        },
        {
            "id": 102,
            "adr_id": "ADR-002",
            "title": "Infisical Secret SSOT & Strict Config Lockdown",
            "status": "Accepted",
            "context": "Environment variable drift and unsafe string fallbacks across environments lead to silent failures.",
            "decision": "Centralize all environment variables in Infisical. Use @soustools/config with Zod validation and fail-fast process.exit(1). Ban process.env usage outside @soustools/config."
        },
        {
            "id": 103,
            "adr_id": "ADR-003",
            "title": "Domain-Driven Design (DDD) & Container/View Component Pattern",
            "status": "Accepted",
            "context": "Mixing state management, API hooks, and UI presentation inside Next.js pages creates tightly coupled spaghetti code.",
            "decision": "Next.js page.tsx files act strictly as hollow entrypoints importing domain containers/views from packages/domain-*. UI components (*.tsx) must be pure presentational; logic and state live in *.container.tsx."
        },
        {
            "id": 104,
            "adr_id": "ADR-004",
            "title": "Centralized LiteLLM AI Gateway & Free Ollama Coder Agents",
            "status": "Accepted",
            "context": "High cost of cloud LLMs for routine developer coding tasks and fragmented local setups.",
            "decision": "Reserve paid high-intelligence Gemini models for the Planning Agent phase. Route routine Coder/DevOps execution tasks to free local Ollama (qwen2.5-coder:7b) via LiteLLM proxy at https://ai.sous.tools/v1 with drop_params: false."
        },
        {
            "id": 105,
            "adr_id": "ADR-005",
            "title": "PostgreSQL and Neo4j 1:1 Relational-Graph Data Model Parity",
            "status": "Accepted",
            "context": "Operating a relational database alongside a graph database can lead to data divergence.",
            "decision": "Synchronize PostgreSQL entity mutations 1:1 to Neo4j via transactional outbox webhooks and schema-registry.ts."
        },
        {
            "id": 106,
            "adr_id": "ADR-006",
            "title": "Tailwind CSS v4 Midnight Slate Design System",
            "status": "Accepted",
            "context": "Inconsistent UI styling across domain apps and sub-projects.",
            "decision": "Standardize on Tailwind CSS v4 using @theme directives, Midnight Slate (zinc-*) palette, and semantic CSS variables (var(--z-overlay)). UI primitives live in packages/design-system."
        },
        {
            "id": 107,
            "adr_id": "ADR-007",
            "title": "Tailscale Remote Development & Oracle Cloud ARM64 Production Infrastructure",
            "status": "Accepted",
            "context": "Need secure remote development terminal connectivity and lightweight production hosting.",
            "decision": "Development terminals connect over Tailscale mesh network to home desktop. Production stack runs on Oracle Cloud 24GB RAM, 4 vCPU ARM64 server using Docker Compose profile 'prod'."
        }
    ]

    print(f"Upserting {len(adrs)} ADRs into 'sous_tools_adrs'...")
    adr_points = []
    for item in adrs:
        text_to_embed = f"{item['adr_id']} {item['title']}: {item['context']} {item['decision']}"
        vec = get_embedding(text_to_embed, use_real_embeddings)
        adr_points.append(
            PointStruct(
                id=item["id"],
                vector=vec,
                payload={
                    "adr_id": item["adr_id"],
                    "title": item["title"],
                    "status": item["status"],
                    "context": item["context"],
                    "decision": item["decision"]
                }
            )
        )
    client.upsert(collection_name="sous_tools_adrs", points=adr_points)
    print("ADR points upserted successfully.")

    # Verify Counts
    mem_info = client.get_collection("sous_tools_memory")
    adr_info = client.get_collection("sous_tools_adrs")
    print(f"Verification - sous_tools_memory count: {mem_info.points_count}")
    print(f"Verification - sous_tools_adrs count: {adr_info.points_count}")
    print("Qdrant Vector Database successfully updated and synchronized!")

if __name__ == "__main__":
    main()
