# Architecture Decision Record (ADR) &amp; Master Execution Plan

## ADR 001: Enterprise API Refactor, Code-First GraphQL, and Zero-Touch Ingestion

\*\*Date:\*\* August 2026

\*\*Status:\*\* Accepted

### 1. Context &amp; Problem Statement

The NestJS API requires an enterprise-grade overhaul to support a scalable, AI-native Culinary Operating System. Current issues include procedural "God Classes", fragile asynchronous tasks, isolated vector memories, and fragmented transport layers. Furthermore, the system must support operational realities: offline-first kitchen environments (mesh networks/IoT relays), concurrent multi-user editing, strict role-based access, and financial auditability (soft deletes, business days).

### 2. Architectural Decisions

#### 2.1 Transport, GraphQL, &amp; Offline-First URQL

- \*\*Code-First GraphQL:\*\* Migrate data operations to `@nestjs/graphql` with in-memory schema generation.

- \*\*Offline Resilience:\*\* `api-client` will export a URQL client utilizing `@urql/exchange-graphcache` for optimistic UI updates and offline mutation queuing. If the kitchen mesh loses internet, the UI remains functional and syncs when connectivity restores. `@urql/exchange-auth` will seamlessly handle JWT refreshes.

#### 2.2 Security, Multi-Tenancy, &amp; Enterprise Data Integrity

- \*\*Request-Scoped RLS:\*\* Implement `nestjs-cls` to pass `orgId` through the execution context, allowing Singleton database providers to enforce Postgres `set_config` RLS without performance penalties.

- \*\*Optimistic Concurrency Control (OCC):\*\* Critical tables (`recipes`, `master_items`) will use a `version` integer. GraphQL mutations must check the version to prevent double-edit race conditions.

- \*\*Financial Auditability:\*\* Hard deletes are globally banned. All entities use `deleted_at`. Reporting queries must respect a tenant-configured "Business Day" rollover time (e.g., 4:00 AM) rather than UTC calendar days.

- \*\*Role-Based Access Control (RBAC):\*\* Implement `@Roles()` decorators and a `RolesGuard` to restrict GraphQL mutations (e.g., only `exec_chef` can edit a `LOCKED` recipe).

#### 2.3 The 7-Step Ingestion Waterfall

- \*\*Pipeline:\*\* 1) Ollama Triage, 2) Gemini Flash Schema Extraction, 3) Ollama Critic Debate, 4) pgvector Tenant Alias Memory (auto-commit if &gt;= 0.95), 5) USDA Culinary Normalization, 6) `RecipeMathService` (Baker's Percentages &amp; Densities), 7) Event-Driven Neo4j/Qdrant Sync.

- \*\*Idempotency:\*\* Hash `vendor_id + invoice_id + date` prior to database insertion.

#### 2.4 IoT Edge Node (Raspberry Pi)

- \*\*Local Relay Architecture:\*\* The cloud API communicates with a lightweight Node.js/Go daemon running on the local RPi via WebSockets. The Pi handles mDNS discovery for local subnet devices and translates cloud commands into raw ESC/POS bytes for thermal printers, keeping complex logic out of the local network.

#### 2.5 Infrastructure &amp; CLI

- \*\*CLI Commands:\*\* `apps/cli` (using `nest-commander`) replaces rogue bash scripts.

- \*\*CI/CD:\*\* Enforce Infisical CLI globally. Support Vercel ephemeral environments for PR testing against temporary API containers on the ARM64 server.

---

# [AGENTS.md](http://AGENTS.md) (System Rules - Append to existing)

## 1. Domain-Driven Design &amp; Enterprise Standards

- \*\*Strict Boundaries:\*\* UI apps and domain packages are forbidden from importing database clients.

- \*\*No Global Database Clients:\*\* Never use `import { supabase }`. Use CLS-injected Singleton providers to enforce RLS.

- \*\*Code-First GraphQL:\*\* The API is Code-First GQL. REST is deprecated except for webhooks, `/health`, and `/v1/auth`.

- \*\*Concurrency &amp; Soft Deletes:\*\* Never execute `DELETE` queries. Update `deleted_at = NOW()`. All update mutations must include and increment a `version` field.

- \*\*Event-Driven Boundaries:\*\* Domains must decouple via `@nestjs/event-emitter`. Do not cross-inject domain services to trigger downstream updates.

## 2. Secrets &amp; Configuration

- \*\*Infisical SSOT:\*\* Apps must boot using the official Infisical CLI. `packages/config` purely serves as a Zod validation schema.

- \*\*ESLint `process.env` Ban:\*\* Frontend apps are strictly banned from accessing `process.env`. All config flows through `@soustools/config`.

## 3. Data Fetching &amp; Offline-First URQL

- \*\*Containers vs Views:\*\* Real-time views MUST use the Container/View pattern with URQL hooks.

- \*\*Graphcache:\*\* Ensure all URQL queries are properly configured for `@urql/exchange-graphcache` to support offline operation.

## 4. Execution &amp; Resilience

- \*\*Async Execution:\*\* Heavy AI tasks MUST NOT block HTTP. Return `202 Accepted`, queue in BullMQ, and stream via Redis PubSub.

- \*\*Testing Standard:\*\* Mandate Jest (Unit) and Supertest (E2E). E2E tests MUST programmatically simulate pipelines (e.g., passing mock file buffers).

---

# THE 7 MASTER EPICS

## EPIC 1: Infrastructure, Secrets &amp; NestJS Enterprise Features

\*\*Sub-Tasks:\*\*

- \[ \] Task 1.1: Restructure `apps/api/src/` into `core/`, `shared/`, and `modules/`. Globally rename `unified-ingestion` to `ingestion`.

- \[ \] Task 1.2: Enforce Infisical CLI wrapper across all `package.json` scripts. Add ESLint rules banning `process.env` in frontend apps.

- \[ \] Task 1.3: Implement `nestjs-cls` (Async Local Storage). Build a Singleton Supabase Provider that reads `orgId` from CLS to execute Postgres `set_config` RLS.

- \[ \] Task 1.4: Implement `@nestjs/throttler` (Redis-backed), `@nestjs/terminus` (`/health`), and `nestjs-pino`. Enable `@nestjs/devtools-integration`. Update GitHub Actions to support Vercel ephemeral environments.

## EPIC 2: Code-First GraphQL, Offline URQL &amp; File Upload Abstraction

\*\*Sub-Tasks:\*\*

- \[ \] Task 2.1: Configure `@nestjs/graphql` (Code-First, in-memory) and `graphql-redis-subscriptions`.

- \[ \] Task 2.2: Setup `@graphql-codegen/cli` in `packages/api-client`.

- \[ \] Task 2.3: Configure URQL client with `@urql/exchange-auth` (401 intercept/refresh) AND `@urql/exchange-graphcache` for offline-first optimistic UI mutations.

- \[ \] Task 2.4: Export `uploadFile(file)` and `uploadAndIngest(file)` helpers from `api-client` to orchestrate Supabase Signed URL PUT requests.

## EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\*\*Sub-Tasks:\*\*

- \[ \] Task 3.1: Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator.

- \[ \] Task 3.2: Isolate `ingest_document`, `add_to_purchase_order`, etc., into standalone provider classes inside `src/modules/commands/tools/`.

- \[ \] Task 3.3: Refactor the Omnibar endpoint to return `202 Accepted`. Push task to BullMQ and stream execution states via GraphQL Subscriptions.

## EPIC 4: The 7-Step Ingestion Waterfall &amp; Baker's Math

\*\*Sub-Tasks:\*\*

- \[ \] Task 4.1: Implement Idempotency check: Hash `vendor_id + invoice_id + date` prior to DB insertion.

- \[ \] Task 4.2: Implement the Triage &amp; Debate Pattern: Local Ollama routes documents and acts as Critic to verify Gemini Flash extractions. Use `Promise.allSettled`.

- \[ \] Task 4.3: Implement `normalizeCulinaryTerms()` before USDA API requests.

- \[ \] Task 4.4: Update `recipe_ingredients` for Baker's Math (`is_reference`, `bakers_percentage`). Implement `RecipeMathService` to resolve volumetric densities.

- \[ \] Task 4.5: Implement Learning Loop: Upsert `vendor_item_aliases` (with pgvector embedding) on user approval. Auto-commit items matching aliases &gt;= 0.95.

- \[ \] Task 4.6: Create `@nestjs/schedule` cron job to aggregate `raw_unmapped_data`.

## EPIC 5: SSOT Event-Driven Graph &amp; LLM Routing

\*\*Sub-Tasks:\*\*

- \[ \] Task 5.1: Create `system_memories` Postgres table. Delete isolated Qdrant memory sync scripts.

- \[ \] Task 5.2: Use `@nestjs/event-emitter` to broadcast events. Build BullMQ workers to asynchronously embed and sync data to Qdrant and Neo4j.

- \[ \] Task 5.3: Implement `LlmRouterService`. Route classification to Local Ollama, bulk extraction to Gemini Flash, and deep reasoning to Gemini Pro.

- \[ \] Task 5.4: Write comprehensive Jest (Unit) and Supertest (E2E) tests ensuring pipeline stability.

## EPIC 6: Enterprise Data Integrity (RBAC, OCC &amp; Soft Deletes)

\*\*Context:\*\* Protect the application from concurrency race conditions, unauthorized edits, and broken historical reporting.

\*\*Sub-Tasks:\*\*

- \[ \] Task 6.1: Enforce Soft Deletes. Add `deleted_at` globally. Update all GraphQL resolvers and services to filter out soft-deleted records natively.

- \[ \] Task 6.2: Implement Optimistic Concurrency Control (OCC). Add `version` (INT) to `recipes` and `master_items`. Reject mutations if client version mismatch occurs.

- \[ \] Task 6.3: Implement Role-Based Access Control. Create `@Roles()` decorator and `RolesGuard` to check JWT claims. Enforce `LOCKED` recipe status permissions.

- \[ \] Task 6.4: Implement Tenant "Business Day" configuration. Update analytics queries (revenue, labor) to group by the configurable rollover hour (e.g., 4:00 AM) rather than UTC date.

## EPIC 7: CLI Overhaul &amp; Edge Node (Raspberry Pi)

\*\*Context:\*\* Centralize external scripts and unblock the local IoT deployment.

\*\*Sub-Tasks:\*\*

- \[ \] Task 7.1: Convert `apps/cli` to use `nest-commander`. Migrate `.zsh_aliases` logic into `sous cli` commands (e.g., `sous agent:tail`, `sous db:sync-neo4j`, `sous ssh:prod`).

- \[ \] Task 7.2: Refactor the Raspberry Pi Edge Node. Strip out complex business logic. Convert to a lightweight Daemon (Node/Bun) that maintains a secure WebSocket to the cloud API.

- \[ \] Task 7.3: Implement mDNS/Bonjour discovery on the Edge Node for local network printer mapping. Enable the Edge Node to accept JSON payloads from the cloud and translate them to raw ESC/POS network bytes for local thermal printers.
