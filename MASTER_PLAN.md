# Architecture Decision Record (ADR) &amp; Master Execution Plan

## ADR 001: Enterprise API Refactor, Code-First GraphQL, and Zero-Touch Ingestion

\*\*Date:\*\* August 2026

\*\*Status:\*\* Accepted

### 1. Context &amp; Problem Statement

The NestJS API has become a procedural bottleneck characterized by "God Classes" (specifically the Omnibar tool router in `CommandsService`), fragile asynchronous tasks (`Promise.all` explosions in ingestion), and isolated, unsynchronized data stores. The ingestion workflow requires tedious Human-In-The-Loop (HITL) review for every data point. The transport layer is fragmented across REST and unstable native WebSockets, leading to frequent auth drops. Multi-tenancy is loosely enforced via manual query parameters rather than strict Row-Level Security (RLS) scoping. Secrets management bypasses the Infisical standard, causing missing variables in CI/CD and frontend builds.

### 2. Architectural Decisions

#### 2.1 Transport Layer: Code-First GraphQL &amp; URQL

- \*\*Code-First Schema:\*\* Migrate data operations to a Code-First GraphQL architecture using `@nestjs/graphql`. The schema will be generated in-memory (`autoSchemaFile: true`) to prevent Docker filesystem permission conflicts.

- \*\*REST Deprecation:\*\* All REST endpoints are deprecated EXCEPT `/v1/auth/*` (for cookie/token management) and `/v1/webhooks/*` (for external services like Stripe/Neo4j).

- \*\*Real-Time Subscriptions:\*\* Implement `graphql-redis-subscriptions` utilizing the existing Redis cluster. Next.js applications will connect via Subscriptions to receive KDS, POS, and Omnibar execution events.

- \*\*Client SDK (`api-client`):\*\* Use `@graphql-codegen/cli` to generate typed React hooks from the API. Expose a \*\*URQL client\*\* wrapped with `@urql/exchange-auth` to automatically intercept 401 Unauthorized errors, pause queries, call the REST refresh endpoint, and seamlessly reconnect WebSockets.

- \*\*File Upload Abstraction:\*\* GraphQL multipart uploads are banned. `api-client` will expose `uploadFileAndIngest(file)` which orchestrates: 1) GQL Mutation to request a Supabase Signed URL, 2) Native HTTP PUT of the binary to Supabase, 3) GQL Mutation to trigger the background ingestion job with the resulting URL.

#### 2.2 Security, Multi-Tenancy &amp; Ephemeral Environments

- \*\*Request-Scoped RLS:\*\* Clients NEVER pass `orgId` as an argument. Create a Request-Scoped NestJS Supabase Provider that extracts the tenant ID from the validated JWT and executes Postgres `set_config` to establish a secure RLS context for every transaction.

- \*\*Secrets (Infisical):\*\* Deprecate the custom `packages/config` Infisical scripts. Enforce the Infisical CLI wrapper (`infisical run --env=... -- pnpm start`) at the infrastructure layer using Machine Identities for CI/CD. Frontend apps are banned via ESLint from using `process.env` directly; they must import the Zod-validated `@soustools/config` object.

- \*\*Vercel Ephemeral Environments:\*\* CI/CD will spin up ephemeral API containers on the Oracle ARM64 server for PRs (e.g., `api-pr-42.sous.tools`) and dynamically link them to Vercel preview URLs to test schema migrations safely.

#### 2.3 The Omnibar Tool Registry (IoC)

- \*\*Inversion of Control (IoC):\*\* Remove the procedural `if/else` block in `CommandsService`. Build a `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator.

- \*\*Asynchronous Execution:\*\* Omnibar HTTP/GQL requests return `202 Accepted` instantly with a `conversationId`. The LLM agent task is dispatched to a BullMQ worker. As the worker resolves tools, it streams execution states (e.g., "Executing Cypher Query...") back to the client via GraphQL Subscriptions (Redis PubSub).

#### 2.4 Zero-Touch Ingestion Pipeline &amp; Culinary Brain

- \*\*Confidence-Threshold Auto-Commit:\*\* Items with a &gt;0.95 confidence score (via exact vector match in `vendor_item_aliases`) are auto-committed to Postgres. The UI only surfaces exceptions (Red/Yellow items) to the user, eliminating full-document manual review.

- \*\*Multi-Agent Verification:\*\* Deploy a "Debate Pattern" for extractions. Agent A (Gemini Flash) extracts data; Agent B (Local Ollama) verifies the extraction against the raw text. Disagreements flag the item for human review.

- \*\*GraphRAG for Textbooks:\*\* Large PDFs are split via `massive-document-ingestion` BullMQ queues. An Ollama router classifies pages. Culinary theory pages extract "Triples" (Subject -&gt; Predicate -&gt; Object) and write directly to Neo4j to build the Culinary Knowledge Graph. These run completely headless (no HITL review).

- \*\*Idempotency:\*\* Invoices are deduplicated by hashing `vendor_id + invoice_id + date` prior to DB insertion to prevent double-billing inventory on bulk uploads.

- \*\*Resilience &amp; Calculation:\*\* Replace `Promise.all` with `Promise.allSettled`. Implement `determineCalculationType()` to infer `fixed_weight`, `fixed_volume`, or `each` dynamically.

- \*\*Baker's Math Support:\*\* Update `recipe_ingredients` schema to include `is_reference: boolean`, `bakers_percentage: numeric`, and `original_input_string` alongside fixed weights.

- \*\*The Learning Loop:\*\* Execute an upsert to `vendor_item_aliases` when a user approves a mapped ingredient/item. A `@Cron` job aggregates `raw_unmapped_data` weekly to recommend schema expansions.

#### 2.5 LLM Cost Routing

- \*\*Tier 1 (Local Ollama on Oracle ARM64):\*\* Page routing, multi-agent criticism, and USDA culinary normalization (e.g., mapping "Full fat milk" to "Milk, whole").

- \*\*Tier 2 (Gemini 1.5 Flash via AI Studio):\*\* Bulk extraction of structured invoice/recipe data.

- \*\*Tier 3 (Gemini 1.5 Pro / Claude 3.5 Sonnet):\*\* Deep culinary reasoning, complex Omnibar commands, and menu planning via graph traversal.

#### 2.6 NestJS Production Tooling &amp; CLI

- \*\*Logging &amp; DevTools:\*\* Implement `nestjs-pino` for async structured JSON logging. Enable `@nestjs/devtools-integration` in development. Enable URI Versioning for REST webhooks.

- \*\*`nest-commander` CLI:\*\* Rebuild `apps/cli` to replace bash scripts. Commands include `sous stack logs`, `sous db:sync-neo4j`, `sous agent:tail`, `sous ssh:prod`, and `sous auth:generate-token`.

- \*\*Testing Standard:\*\* Mandate Jest for Unit Tests (mocking all external APIs like USDA and LiteLLM) and Supertest for E2E Tests. E2E tests MUST programmatically simulate the entire pipeline (including passing mock file buffers to the queue) to verify completion without UI interaction.

---

# [AGENTS.md](http://AGENTS.md) (System Rules - Append to existing)

## 1. Domain-Driven Design &amp; NestJS Standards

- \*\*Strict Boundaries:\*\* UI apps and domain packages are forbidden from importing database clients.

- \*\*No Global Database Clients:\*\* Never use `import { supabase }`. Use Request-Scoped providers to enforce RLS.

- \*\*Code-First GraphQL:\*\* The API is Code-First GQL. REST is deprecated except for third-party webhooks and `/v1/auth`.

- \*\*Event-Driven Boundaries:\*\* Domains must decouple via `@nestjs/event-emitter`. Do not cross-inject domain services to trigger downstream updates (e.g., Ingestion -&gt; Neo4j).

- \*\*Codebase Structure:\*\* Structure `apps/api/src/` strictly into `core/` (config, filters, guards, db providers), `shared/` (utilities), and `modules/` (health, ingestion, commands, pos).

## 2. Secrets &amp; Configuration

- \*\*Infisical SSOT:\*\* Apps must boot using the official Infisical CLI. `packages/config` purely serves as a Zod validation schema.

- \*\*ESLint `process.env` Ban:\*\* Frontend apps are strictly banned from accessing `process.env` (including `NEXT_PUBLIC_`). All config flows through `@soustools/config`.

## 3. Data Fetching &amp; URQL

- \*\*React Server Components (RSC) vs. Containers:\*\* Initial data fetching happens in RSCs. Interactive/real-time views MUST use the Container/View pattern with URQL GraphQL hooks (`useQuery`, `useSubscription`).

- \*\*Global Tenant Scoping:\*\* Clients NEVER pass `orgId` as an argument. The API extracts the tenant ID directly from the JWT.

- \*\*Auth Resiliency:\*\* The URQL client utilizes `@urql/exchange-auth` to automatically intercept 401s, hit the REST refresh endpoint, and reconnect WebSockets seamlessly.

## 4. Execution &amp; Resilience

- \*\*Async Execution:\*\* Heavy AI tasks MUST NOT block HTTP. Return `202 Accepted`, queue in BullMQ, and stream status updates via Redis PubSub.

- \*\*Resilient Processing:\*\* Queue workers MUST use `Promise.allSettled` for batch external requests.

---

# THE 5 MASTER EPICS

## EPIC 1: Infrastructure Hardening, Secrets &amp; CLI Toolkit

\*\*Context:\*\* The codebase contains hallucinated paths (`apps/api/apps/api`), unstable secrets management, and lacks centralized admin tooling.

\*\*Sub-Tasks:\*\*

- \[ \] Task 1.1: Delete hallucinated folders and rogue `schema.gql` files. Restructure `apps/api/src/` into `core/`, `shared/`, and `modules/`. Globally rename `unified-ingestion` to `ingestion`.

- \[ \] Task 1.2: Delete custom Infisical loader scripts. Update `package.json` scripts to explicitly use `infisical run --env=... -- pnpm ...`. Add ESLint rules banning `process.env` in `apps/web`.

- \[ \] Task 1.3: Convert `apps/cli` to use `nest-commander`. Migrate `.zsh_aliases` scripts into executable NestJS CLI commands (e.g., `sous agent:tail`, `sous db:sync-neo4j`, `sous ssh:prod`). Ensure CLI commands utilize `process.cwd()` and `--env` flags to work seamlessly across environments (WSL, Docker, Prod).

- \[ \] Task 1.4: Implement `nestjs-pino` for structured logging. Enable `@nestjs/devtools-integration` in development. Set up API URI versioning for REST webhooks. Implement GitHub Action for Vercel ephemeral environments (dynamic API instantiation).

## EPIC 2: Code-First GraphQL, URQL &amp; File Upload Abstraction

\*\*Context:\*\* We are migrating to Code-First GraphQL for typed SDK generation, real-time POS/KDS updates via Subscriptions, and resilient auth retries.

\*\*Sub-Tasks:\*\*

- \[ \] Task 2.1: Install `@nestjs/graphql` (Code-First) configured with `autoSchemaFile: true`. Configure `graphql-redis-subscriptions` using the existing Redis cluster for horizontal scaling.

- \[ \] Task 2.2: Build a Request-Scoped NestJS Supabase Provider. It must read `orgId` from the validated JWT and enforce Postgres RLS via `set_config` for all queries. Ensure GQL contexts never require `orgId` arguments from the client.

- \[ \] Task 2.3: Setup `@graphql-codegen/cli` in `packages/api-client`. Configure the exported URQL client with `@urql/exchange-auth` to catch 401s, hit `/v1/auth/refresh`, and seamlessly reconnect websockets without user intervention.

- \[ \] Task 2.4: Export `uploadFile(file)` and `uploadAndIngest(file)` helpers from `api-client`. These functions orchestrate a GQL mutation to request a Supabase Signed URL, execute a native HTTP PUT, and pass the URL to the ingestion queue.

## EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\*\*Context:\*\* The Omnibar relies on a procedural "God Class" (`CommandsService`). It must transition to an asynchronous, Inversion of Control (IoC) architecture to support infinite tools.

\*\*Sub-Tasks:\*\*

- \[ \] Task 3.1: Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator. Refactor tool execution to dynamically resolve based on LLM function calls.

- \[ \] Task 3.2: Strip all `if/else` logic out of `CommandsService`. Create standalone classes inside `src/modules/commands/tools/` for `ingest_document`, `add_to_purchase_order`, `search_the_web`, etc. Register them as providers.

- \[ \] Task 3.3: Refactor the Omnibar endpoint to return an immediate `202 Accepted` with a `conversationId`. Push the LLM task into BullMQ. Implement logic to stream execution state updates to the frontend via GraphQL Subscriptions (Redis PubSub).

## EPIC 4: Zero-Touch Ingestion, Idempotency &amp; The Culinary Brain

\*\*Context:\*\* Ingestion requires a multi-agent workflow, idempotent hashing, GraphRAG for textbooks, and a learning loop for auto-commits to minimize HITL review.

\*\*Sub-Tasks:\*\*

- \[ \] Task 4.1: Implement the "Debate Pattern" in BullMQ workers: Agent A (Gemini Flash) extracts data; Agent B (Local Ollama) verifies it. Disagreements flag the block with `resolutionError: true`. Use `Promise.allSettled` for all loops.

- \[ \] Task 4.2: Implement `normalizeCulinaryTerms()` via Local Ollama before sending requests to the USDA API. Restrict FDC queries to Foundation/SR Legacy databases.

- \[ \] Task 4.3: Update `recipe_ingredients` schema for Baker's Math (`is_reference`, `bakers_percentage`, `original_input_string`). Implement `determineCalculationType()` to assign `fixed_weight`, `fixed_volume`, or `each`. Implement Recipe Snapshot Versioning.

- \[ \] Task 4.4: Implement Idempotency check: Hash `vendor_id + invoice_id + date` prior to DB insertion to prevent duplicate bulk ingestions.

- \[ \] Task 4.5: Implement Confidence-Threshold Auto-Commit and the Learning Loop: Upsert `vendor_item_aliases` when a user approves a mapped ingredient. Auto-commit items that match aliases &gt;0.95 confidence.

- \[ \] Task 4.6: GraphRAG for Textbooks. Route massive PDFs to a chunking queue. Extract Triples (Subject-&gt;Predicate-&gt;Object) and sync directly to Neo4j. Bypass HITL review for textbooks. Create `@nestjs/schedule` cron job to aggregate `raw_unmapped_data` weekly.

## EPIC 5: SSOT Event-Driven Graph, LLM Routing &amp; Testing

\*\*Context:\*\* Postgres is the absolute source of truth. Memories must sync asynchronously. Testing must guarantee pipeline stability.

\*\*Sub-Tasks:\*\*

- \[ \] Task 5.1: Create a `system_memories` Postgres table. Deprecate isolated Qdrant memory scripts.

- \[ \] Task 5.2: Use `@nestjs/event-emitter` to broadcast `MemoryCreated`, `InvoiceApproved`, or `RecipeApproved` events. Build BullMQ workers that listen to these events to asynchronously embed and sync data to Qdrant and Neo4j.

- \[ \] Task 5.3: Implement the LLM Gateway Service. Route simple routing/normalization tasks to local Ollama. Route bulk extraction to Gemini 1.5 Flash via AI Studio. Route deep reasoning/chat to Gemini 1.5 Pro.

- \[ \] Task 5.4: Write comprehensive Jest (Unit) and Supertest (E2E) tests. E2E tests MUST programmatically pass mock file buffers to the API, mocking external LLM/USDA APIs, to verify the entire asynchronous queue and Postgres commit process functions seamlessly.
