# Architecture Decision Record (ADR) &amp; Master Execution Plan

## ADR: Enterprise API Refactor, Code-First GraphQL, and Ingestion Resilience

\*\*Date:\*\* August 2026

\*\*Status:\*\* Accepted

### 1. Context &amp; Problem Statement

The NestJS API requires an enterprise-grade architectural overhaul to support a scalable, AI-native Culinary Operating System. Current issues include procedural "God Classes", fragile ingestion pipelines, isolated vector memories, and coupled transport layers (REST/WS). The ingestion workflow requires true asynchronous handling, robust deduplication, and a UI-driven learning loop for unmapped data.

### 2. Architectural Decisions

#### 2.1 Code-First GraphQL, URQL &amp; File Uploads

- \*\*Decision:\*\* Migrate data operations to Code-First GraphQL. Use URQL on the frontend with `@urql/exchange-auth` for seamless token refreshes and WebSocket reconnection.
- \*\*Uploads:\*\* GraphQL multipart uploads are banned. `api-client` abstracts uploads by requesting a Supabase Signed URL, PUTting the binary natively, and passing the URL to the GraphQL mutation.

#### 2.2 Asynchronous Omnibar &amp; LLM Cost Routing

- \*\*Decision:\*\* The Omnibar workflow is non-blocking ("Drop &amp; Go").
- \*\*Routing:\*\*
  - Tier 1 (Local Ollama): Document classification (Recipe vs. Invoice).
  - Tier 2 (Gemini 1.5 Flash via AI Studio): Fast, bulk extraction.
  - Tier 3 (Gemini 1.5 Pro): Deep culinary reasoning.
- \*\*Workflow:\*\* API returns `202 Accepted`, drops tasks into BullMQ, and streams updates via GraphQL Subscriptions (Redis PubSub). System notifications alert the user when processing completes.

#### 2.3 Single Source of Truth (SSOT) &amp; Culinary Brain

- \*\*Decision:\*\* Postgres is the absolute SSOT. Isolated JSON files and direct-to-Qdrant memory scripts are deprecated.
- \*\*Syncing:\*\* `system_memories` and `culinary_knowledge` live in Postgres. The API uses `@nestjs/event-emitter` to trigger BullMQ workers that sync data to Neo4j and Qdrant. A CLI command (`sous db:sync-all`) can rebuild vectors and graphs from scratch.
- \*\*Global vs Local:\*\* Tenants can override global culinary graph data locally via union queries.

#### 2.4 Ingestion Resilience, Baker's Math &amp; Idempotency

- \*\*Decision:\*\* Eliminate `Promise.all` failures and hardcoded calculation types.
- \*\*Idempotency:\*\* Invoices are deduplicated by hashing `vendor_id + invoice_id` prior to DB insertion.
- \*\*Unmapped Data:\*\* Unrecognized fields are saved to `raw_unmapped_data`. The UI exposes these for manual user mapping. A NestJS Cron task (`@nestjs/schedule`) aggregates these mappings weekly to alert developers of needed schema expansions.
- \*\*Baker's Math:\*\* `recipe_ingredients` schema updated to support `is_reference: boolean` and `bakers_percentage: numeric`, alongside `weight_g`.
- \*\*Recipe Versioning:\*\* Implement a snapshot approach (`recipe_versions`) triggered by user checkpoints.

#### 2.5 Infrastructure, Secrets &amp; Vercel Ephemeral Environments

- \*\*Decision:\*\* Deprecate custom config scripts. Enforce Infisical CLI at the infrastructure level (`infisical run -- pnpm start`).
- \*\*Environments:\*\* CI/CD will spin up ephemeral API containers on the Oracle server for PRs (`api-pr-X.sous.tools`) to map against Vercel preview URLs.
- \*\*CLI:\*\* Convert `apps/cli` to `nest-commander` to house operations like `sous report unmapped`, `sous db:push`, and `sous agent:tail`.

---

# [AGENTS.md](http://AGENTS.md) (System Rules - Append to existing)

## 1. Domain-Driven Design &amp; NestJS Standards

- \*\*Strict Boundaries:\*\* UI apps and domain packages are forbidden from importing database clients.
- \*\*No Global Database Clients:\*\* Never use `import { supabase }`. Use Request-Scoped providers to enforce RLS.
- \*\*Code-First GraphQL:\*\* The API is Code-First GQL. REST is deprecated except for third-party webhooks and `/v1/auth`.
- \*\*Event-Driven Boundaries:\*\* Domains must decouple via `@nestjs/event-emitter`. Do not cross-inject domain services to trigger downstream updates (e.g., Ingestion -&gt; Neo4j).

## 2. Secrets &amp; Configuration

- \*\*Infisical SSOT:\*\* Apps must boot using the official Infisical CLI. `packages/config` purely serves as a Zod validation schema.
- \*\*ESLint `process.env` Ban:\*\* Frontend apps are strictly banned from accessing `process.env` (including `NEXT_PUBLIC_`). All config flows through `@soustools/config`.

## 3. Data Fetching &amp; URQL

- \*\*React Server Components (RSC) vs. Containers:\*\* Initial data fetching happens in RSCs. Interactive/real-time views MUST use the Container/View pattern with URQL GraphQL hooks (`useQuery`, `useSubscription`).
- \*\*Global Tenant Scoping:\*\* Clients NEVER pass `orgId` as an argument. The API extracts the tenant ID directly from the JWT.
- \*\*Auth Resiliency:\*\* The URQL client utilizes `@urql/exchange-auth` to automatically intercept 401s, hit the REST refresh endpoint, and reconnect WebSockets.

## 4. Execution &amp; Resilience

- \*\*Async Execution:\*\* Heavy AI tasks MUST NOT block HTTP. Return `200/202`, queue in BullMQ, and stream via Redis PubSub.
- \*\*Resilient Processing:\*\* Queue workers MUST use `Promise.allSettled` for batch external requests.

---

# THE 5 MASTER EPICS

## EPIC 1: Infrastructure Hardening, Secrets &amp; CLI Toolkit

\*\*Context:\*\* The codebase has hallucinated paths and unstable secrets management. We need to lock down configuration and build the `sous` CLI.

\*\*Sub-Tasks:\*\*

- \[ \] Task 1.1: Delete hallucinated folders. Restructure `apps/api/src/` into `core/`, `shared/`, and `modules/`. Globally rename `unified-ingestion` to `ingestion`.
- \[ \] Task 1.2: Delete the custom Infisical loader script. Update all `package.json` scripts to explicitly use `infisical run --env=... -- pnpm ...`. Add ESLint rules banning `process.env` in `apps/web`.
- \[ \] Task 1.3: Convert `apps/cli` to use `nest-commander`. Migrate `.zsh_aliases` scripts into executable NestJS CLI commands (`pnpm sous agent:tail`, `sous db:sync-neo4j`, `sous report unmapped`).
- \[ \] Task 1.4: Implement `nestjs-pino` for structured logging. Enable `@nestjs/devtools-integration` in development. Setup GitHub Action for Vercel ephemeral environments.

## EPIC 2: Code-First GraphQL, URQL &amp; File Upload Abstraction

\*\*Context:\*\* We are migrating to Code-First GraphQL to enable typed SDK generation and resilient URQL subscriptions.

\*\*Sub-Tasks:\*\*

- \[ \] Task 2.1: Install `@nestjs/graphql` (Code-First). Configure `graphql-redis-subscriptions` for horizontal scaling.
- \[ \] Task 2.2: Build a Request-Scoped Supabase Provider that reads `orgId` from the JWT and enforces Postgres RLS via `set_config`. Ensure GQL contexts never require client `orgId` arguments.
- \[ \] Task 2.3: Setup `@graphql-codegen/cli` in `packages/api-client`. Configure URQL with `@urql/exchange-auth` to catch 401s, hit `/v1/auth/refresh`, and seamlessly reconnect.
- \[ \] Task 2.4: Export `uploadFile(file)` and `uploadAndIngest(file)` helpers from `api-client` that orchestrate generating a Supabase Signed URL, performing a native PUT, and firing the final GQL mutation.

## EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\*\*Context:\*\* The Omnibar relies on a procedural "God Class" (`CommandsService`). It must transition to an asynchronous, Inversion of Control (IoC) architecture.

\*\*Sub-Tasks:\*\*

- \[ \] Task 3.1: Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator. Refactor tool execution to dynamically resolve based on LLM function calls.
- \[ \] Task 3.2: Isolate `ingest_document`, `add_to_purchase_order`, etc., into standalone provider classes inside `src/modules/commands/tools/`.
- \[ \] Task 3.3: Refactor the Omnibar endpoint to return an immediate `202 Accepted` with a `conversationId`. Push the LLM task into BullMQ. Stream execution state updates to the frontend via GraphQL Subscriptions (Redis PubSub).

## EPIC 4: Ingestion Resilience, Idempotency &amp; The Learning Loop

\*\*Context:\*\* The ingestion pipeline fails on partial errors and forgets user corrections. It must support Baker's Math and deduplication.

\*\*Sub-Tasks:\*\*

- \[ \] Task 4.1: Replace `Promise.all` over ingredients with `Promise.allSettled`. Catch errors, mark `resolutionError: true`, and continue processing.
- \[ \] Task 4.2: Implement `normalizeCulinaryTerms()` before sending requests to the USDA API. Restrict FDC queries to Foundation/SR Legacy databases.
- \[ \] Task 4.3: Update `recipe_ingredients` schema for Baker's Math (`is_reference`, `bakers_percentage`). Implement `determineCalculationType()` to assign `fixed_weight`, `fixed_volume`, or `each`. Implement Recipe Snapshot Versioning.
- \[ \] Task 4.4: Implement Idempotency check: Hash `vendor_id + invoice_id` to prevent duplicate ingestions.
- \[ \] Task 4.5: Implement the Learning Loop: Upsert `vendor_item_aliases` when a user approves a mapped ingredient.
- \[ \] Task 4.6: Implement Unmapped Data UI and Cron. Save unknown fields to `raw_unmapped_data`. Create a `@nestjs/schedule` cron job to aggregate manual user mappings weekly.

## EPIC 5: SSOT Qdrant Sync, Event-Driven Graph &amp; LLM Routing

\*\*Context:\*\* Postgres is the absolute source of truth. Memories and culinary facts must sync asynchronously to Qdrant/Neo4j.

\*\*Sub-Tasks:\*\*

- \[ \] Task 5.1: Create a `system_memories` Postgres table. Delete isolated Qdrant memory scripts.
- \[ \] Task 5.2: Use `@nestjs/event-emitter` to broadcast `MemoryCreated` or `RecipeApproved` events. Build BullMQ workers that listen to these events to asynchronously embed and sync data to Qdrant and Neo4j.
- \[ \] Task 5.3: Implement the LLM Gateway Service. Route simple classification tasks to local Ollama. Route bulk extraction to Gemini 1.5 Flash. Route deep reasoning to Gemini 1.5 Pro.
- \[ \] Task 5.4: Write comprehensive Jest (Unit) and Supertest (E2E) tests ensuring the entire asynchronous graph sync and ingestion queues function properly via programmatic file buffer uploads.
