# Architecture Decision Record (ADR) &amp; Master Execution Plan

## ADR 001: Enterprise API Refactor, Code-First GraphQL, and Zero-Touch Ingestion

\*\*Date:\*\* August 2026

\*\*Status:\*\* Accepted

### 1. Context &amp; Problem Statement

The NestJS API requires an enterprise-grade overhaul to support a scalable, AI-native Culinary Operating System. Current issues include procedural "God Classes" (`CommandsService`), fragile asynchronous tasks, isolated vector memories, and fragmented transport layers. We must implement advanced NestJS features (CLS, Throttler, Terminus), deprecate isolated Qdrant scripts, clean up GitHub Actions, and build an exhaustive 7-Step Ingestion Waterfall to minimize Human-In-The-Loop review.

### 2. Architectural Decisions

#### 2.1 Transport &amp; GraphQL

- \*\*Decision:\*\* Migrate to Code-First GraphQL (`@nestjs/graphql`) with in-memory schema generation. Implement `graphql-redis-subscriptions` for real-time KDS/POS updates.

- \*\*URQL Client:\*\* `packages/api-client` will export a URQL client utilizing `@urql/exchange-auth` for seamless JWT refreshes and WebSocket reconnections.

- \*\*Uploads:\*\* GraphQL multipart uploads are banned. `api-client` handles uploads via Supabase Signed URLs.

#### 2.2 Security, Multi-Tenancy &amp; NestJS Enterprise Features

- \*\*Async Local Storage (ALS):\*\* Implement `nestjs-cls` to pass the `orgId` through the execution context. This allows Singleton database providers to enforce Postgres RLS without the severe performance penalty of Request-Scoped providers.

- \*\*Rate Limiting:\*\* Implement `@nestjs/throttler` bound to Redis to protect LLM endpoints from abuse.

- \*\*Health Checks:\*\* Implement `@nestjs/terminus` for Docker/Traefik liveness probes.

- \*\*Secrets:\*\* Enforce the Infisical CLI wrapper. Ban `process.env` in frontend apps via ESLint, enforcing `@soustools/config` usage.

#### 2.3 The 7-Step Ingestion Waterfall

- \*\*Decision:\*\* Ingestion must autonomously extract, debate, and map data.

  1. \*\*Triage:\*\* Local Ollama routes document types.

  2. \*\*Extraction:\*\* Gemini Flash decomposes text into schemas and `raw_unmapped_data`.

  3. \*\*Debate:\*\* Local Ollama critic verifies math and flags hallucinations.

  4. \*\*Tenant Memory:\*\* pgvector lookup in `vendor_item_aliases` (auto-commit if &gt;= 0.95).

  5. \*\*Global Resolution:\*\* USDA FDC querying with culinary normalization.

  6. \*\*Math Engine:\*\* `RecipeMathService` calculates Baker's Percentages and volumetric densities.

  7. \*\*Graph Sync:\*\* `@nestjs/event-emitter` triggers background BullMQ sync to Neo4j/Qdrant.

#### 2.4 Infrastructure &amp; CI/CD

- \*\*CLI Commands:\*\* `apps/cli` (using `nest-commander`) replaces `.zsh_aliases` and rogue Qdrant scripts.

- \*\*GitHub Actions:\*\* Deprecate old deploy scripts. CI/CD will utilize `sous cli` commands and support Vercel ephemeral environments for PR testing.

---

# [AGENTS.md](http://AGENTS.md) (System Rules - Append to existing)

## 1. Domain-Driven Design &amp; NestJS Standards

- \*\*Strict Boundaries:\*\* UI apps and domain packages are forbidden from importing database clients.

- \*\*No Global Database Clients:\*\* Never use `import { supabase }`. Use CLS-injected Singleton providers to enforce RLS.

- \*\*Code-First GraphQL:\*\* The API is Code-First GQL. REST is deprecated except for webhooks, `/health`, and `/v1/auth`.

- \*\*Event-Driven Boundaries:\*\* Domains must decouple via `@nestjs/event-emitter`. Do not cross-inject domain services to trigger downstream updates.

- \*\*Codebase Structure:\*\* Structure `apps/api/src/` strictly into `core/`, `shared/`, and `modules/`.

## 2. Secrets &amp; Configuration

- \*\*Infisical SSOT:\*\* Apps must boot using the official Infisical CLI. `packages/config` purely serves as a Zod validation schema.

- \*\*ESLint `process.env` Ban:\*\* Frontend apps are strictly banned from accessing `process.env`. All config flows through `@soustools/config`.

## 3. Data Fetching &amp; URQL

- \*\*Containers vs Views:\*\* Interactive/real-time views MUST use the Container/View pattern with URQL GraphQL hooks (`useQuery`, `useSubscription`).

- \*\*Auth Resiliency:\*\* The URQL client utilizes `@urql/exchange-auth` to automatically intercept 401s and reconnect WebSockets seamlessly.

## 4. Execution, Resilience &amp; Testing

- \*\*Async Execution:\*\* Heavy AI tasks MUST NOT block HTTP. Return `202 Accepted`, queue in BullMQ, and stream via Redis PubSub.

- \*\*Testing Standard:\*\* Mandate Jest (Unit) and Supertest (E2E). E2E tests MUST programmatically simulate the entire pipeline.

---

# THE 6 MASTER EPICS

## EPIC 1: Infrastructure, Secrets &amp; NestJS Enterprise Features

\*\*Context:\*\* The codebase requires structural cleanup, secrets stabilization, and implementation of core NestJS enterprise tooling.

\*\*Sub-Tasks:\*\*

- \[ \] Task 1.1: Restructure `apps/api/src/` into `core/`, `shared/`, and `modules/`. Globally rename `unified-ingestion` to `ingestion`.

- \[ \] Task 1.2: Enforce Infisical CLI wrapper across all `package.json` scripts. Add ESLint rules banning `process.env` in frontend apps.

- \[ \] Task 1.3: Implement `nestjs-cls` (Async Local Storage). Build a Singleton Supabase Provider that reads `orgId` from CLS to execute Postgres `set_config` RLS dynamically without Request-Scoping performance hits.

- \[ \] Task 1.4: Implement `@nestjs/throttler` (Redis-backed), `@nestjs/terminus` (`/health`), and `nestjs-pino` (structured logging). Enable `@nestjs/devtools-integration`.

## EPIC 2: Code-First GraphQL, URQL &amp; File Upload Abstraction

\*\*Context:\*\* Migrating to Code-First GraphQL for typed SDKs and resilient real-time subscriptions.

\*\*Sub-Tasks:\*\*

- \[ \] Task 2.1: Configure `@nestjs/graphql` (Code-First, in-memory) and `graphql-redis-subscriptions`.

- \[ \] Task 2.2: Setup `@graphql-codegen/cli` in `packages/api-client`.

- \[ \] Task 2.3: Configure the URQL client with `@urql/exchange-auth` to catch 401s, hit `/v1/auth/refresh`, and seamlessly reconnect WebSockets.

- \[ \] Task 2.4: Export `uploadFile(file)` and `uploadAndIngest(file)` helpers from `api-client` to orchestrate Supabase Signed URL PUT requests.

## EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\*\*Context:\*\* The Omnibar must transition to an asynchronous, Inversion of Control (IoC) architecture.

\*\*Sub-Tasks:\*\*

- \[ \] Task 3.1: Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator.

- \[ \] Task 3.2: Isolate `ingest_document`, `add_to_purchase_order`, etc., into standalone provider classes inside `src/modules/commands/tools/`.

- \[ \] Task 3.3: Refactor the Omnibar endpoint to return an immediate `202 Accepted`. Push the task into BullMQ and stream execution state updates to the frontend via GraphQL Subscriptions.

## EPIC 4: The 7-Step Ingestion Waterfall &amp; Baker's Math

\*\*Context:\*\* Ingestion requires a multi-agent workflow, idempotent hashing, GraphRAG for textbooks, and a learning loop.

\*\*Sub-Tasks:\*\*

- \[ \] Task 4.1: Implement Idempotency check: Hash `vendor_id + invoice_id + date` prior to DB insertion.

- \[ \] Task 4.2: Implement the Triage &amp; Debate Pattern: Local Ollama routes documents and acts as the Critic to verify Gemini Flash extractions. Use `Promise.allSettled`.

- \[ \] Task 4.3: Implement `normalizeCulinaryTerms()` before USDA API requests.

- \[ \] Task 4.4: Update `recipe_ingredients` for Baker's Math (`is_reference`, `bakers_percentage`). Implement `RecipeMathService` to resolve volumetric densities.

- \[ \] Task 4.5: Implement the Learning Loop: Upsert `vendor_item_aliases` (with pgvector embedding) on user approval. Auto-commit items matching aliases $\\ge 0.95$. Create `@nestjs/schedule` cron job to aggregate `raw_unmapped_data`.

## EPIC 5: SSOT Event-Driven Graph &amp; LLM Routing

\*\*Context:\*\* Postgres is the SSOT. Memories must sync asynchronously. Qdrant scripts must be migrated.

\*\*Sub-Tasks:\*\*

- \[ \] Task 5.1: Create `system_memories` Postgres table. Delete isolated Qdrant memory sync scripts and containers.

- \[ \] Task 5.2: Use `@nestjs/event-emitter` to broadcast events. Build BullMQ workers to asynchronously embed and sync data to Qdrant and Neo4j.

- \[ \] Task 5.3: Implement `LlmRouterService`. Route classification to Local Ollama, bulk extraction to Gemini Flash, and deep reasoning to Gemini Pro.

- \[ \] Task 5.4: Write comprehensive Jest (Unit) and Supertest (E2E) tests ensuring pipeline stability.

## EPIC 6: CLI Overhaul &amp; CI/CD Migration

\*\*Context:\*\* Consolidate external scripts into the NestJS CLI and upgrade GitHub Actions.

\*\*Sub-Tasks:\*\*

- \[ \] Task 6.1: Convert `apps/cli` to use `nest-commander`. Ensure it respects `process.cwd()` and Infisical environments.

- \[ \] Task 6.2: Migrate `.zsh_aliases` and Qdrant sync logic into `sous cli` commands (e.g., `sous agent:tail`, `sous db:sync-neo4j`, `sous db:sync-vectors`).

- \[ \] Task 6.3: Audit `.github/workflows`. Replace legacy deployment scripts with `sous cli` invocations. Setup Vercel ephemeral environment routing for PRs.
