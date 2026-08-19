# SOFTWARE ARCHITECTURE DOCUMENT (SAD) &amp; EPIC ROADMAP

\*\*Project:\*\* [sous.tools](http://sous.tools) Modular Monolith &amp; Autonomous Culinary OS

\*\*Date:\*\* August 2026

\*\*Target Architecture:\*\* NestJS v11+, Next.js (App Router), Code-First GraphQL, URQL, PostgreSQL, Neo4j, Qdrant.

---

## PART 1: CORE ARCHITECTURAL TENETS &amp; AGENT RULES

All AI Agents executing tasks on this repository MUST adhere to the following non-negotiable constraints:

### 1.1 Transport &amp; API Surface

- \*\*Code-First GraphQL:\*\* The API is strictly Code-First GraphQL (`@nestjs/graphql`). The schema is generated in-memory (`autoSchemaFile: true`) to avoid Docker filesystem lockups.

- \*\*REST Quarantined:\*\* REST endpoints are banned except for `/health` (Terminus), `/v1/auth` (cookie management), and `/v1/webhooks` (Stripe, Neo4j external triggers).

- \*\*The `api-client` Abstraction:\*\* Frontend applications (Next.js) NEVER write raw `fetch` calls. They import auto-generated React Hooks from `packages/api-client`.

- \*\*Offline-First URQL:\*\* The `api-client` exports a URQL client configured with `@urql/exchange-graphcache`. This provides Optimistic UI updates. If the kitchen loses WiFi, mutations are queued locally and replayed upon reconnection.

- \*\*Auth Resiliency:\*\* URQL uses `@urql/exchange-auth` to automatically intercept 401 Unauthorized responses, pause the GraphQL queues, hit the `/v1/auth/refresh` endpoint, and transparently reconnect WebSockets.

### 1.2 Security, Multi-Tenancy &amp; Data Integrity

- \*\*Request-Scoped RLS via CLS:\*\* DO NOT use NestJS Request-Scoped providers (they destroy performance). Use `nestjs-cls` (Async Local Storage). A middleware extracts the `orgId` from the JWT, attaches it to the CLS context, and Singleton database providers read it to execute Postgres `set_config` Row-Level Security (RLS). Clients NEVER pass `orgId` in GQL variables.

- \*\*Optimistic Concurrency Control (OCC):\*\* Prevent double-edits. Tables like `recipes` and `master_items` have a `version` integer. All GQL mutations must check this version and increment it. Mismatches throw a `ConflictException`.

- \*\*Financial Auditability (Soft Deletes &amp; Business Days):\*\* Hard deletes (`DELETE FROM...`) are globally banned. Use `deleted_at`. Reporting analytics must group data by a tenant-configured "Business Day" (e.g., rollover at 4:00 AM), not by UTC calendar days.

- \*\*Role-Based Access Control (RBAC):\*\* Implement a `RolesGuard` and `@Roles()` decorator. Only specific claims (e.g., `exec_chef`) can mutate `LOCKED` recipes or financial data.

### 1.3 Infrastructure, Secrets, &amp; CI/CD

- \*\*Infisical SSOT:\*\* `process.env` is BANNED in frontend apps via ESLint. Apps must boot using `infisical run --env=... -- pnpm start`. Local dev uses `infisical login`; CI/CD and Docker use Infisical Machine Identities (Client ID/Secret).

- \*\*Vercel Ephemeral Environments:\*\* GitHub Actions must spin up temporary API containers (e.g., `api-pr-42.sous.tools`) on the Oracle ARM64 server when a PR opens, allowing Vercel preview URLs to test schema migrations safely before merge.

- \*\*The `sous` CLI:\*\* `apps/cli` uses `nest-commander`. Commands (e.g., `sous stack logs api`, `sous db:sync-neo4j`) detect execution context (`process.cwd()`, `IS_DOCKER`) to run seamlessly on WSL or inside containers.

---

## PART 2: THE 7-STEP ZERO-TOUCH INGESTION WATERFALL

The ingestion pipeline is an autonomous Knowledge Extraction Engine designed to eliminate Human-In-The-Loop (HITL) review through rigorous cross-checking and machine learning.

### Step 1: Idempotency &amp; Triage

- Compute a SHA-256 hash of the uploaded file buffer.

- Query `ingestion_reviews.document_hash`. If a match exists, return the existing ID and abort (prevents double-billing).

- Route to Ollama (Llama 3 / Phi-3) to classify: `INVOICE`, `RECIPE`, or `TEXTBOOK`.

### Step 2: Semantic Decomposition (Gemini Flash)

- Prompt Gemini 1.5 Flash with strict TypeScript schemas.

- \*\*Requirement:\*\* Decompose strings. E.g., "Sysco Full Fat Milk 1 Gal" becomes `{ brand: "Sysco", canonicalName: "Milk, whole", modifier: "Full Fat", packSize: 1, unit: "gallon" }`.

- Any valuable data not matching the schema (e.g., "Delivery: 8AM-10AM") is stored in the `raw_unmapped_data` JSONB object.

### Step 3: Multi-Agent Verification (The Debate Pattern)

- Pass Gemini's output and the raw text to a local Ollama "Critic" agent.

- \*\*Critic Prompt:\*\* _"Verify the math (qty_ price == total). Identify hallucinations."\*

- If the Critic disagrees or finds bad math, the block's `extraction_confidence` drops, flagging it for human review.

### Step 4: Vector-Accelerated Tenant Memory

- Generate an embedding for the extracted `rawName`.

- Perform a pgvector Cosine Similarity search against `vendor_item_aliases`.

- \*\*Auto-Commit Rule:\*\* If similarity is $\\ge 0.95$, set status to `PRE_ACCEPTED`. The UI hides this in a "Verified" accordion, saving the user from reviewing known items.

### Step 5: Global Culinary &amp; USDA Resolution

- Pass unknown items through an Ollama `normalizeCulinaryTerms` prompt (e.g., "EVOO" $\\rightarrow$ "Oil, olive, extra virgin").

- Query the USDA FDC API strictly filtering `&dataType=Foundation,SR%20Legacy`.

### Step 6: Mathematical Normalization (Baker's Percentages &amp; Yields)

- \*\*Calculation Type Resolver:\*\* Map string units to `fixed_weight`, `fixed_volume`, or `each`.

- \*\*Volumetric Math:\*\* If volume is used, calculate weight via: $W\_i = V\_i \\times \\text{density\\\_g\\\_ml}$.

- \*\*Baker's Math:\*\* Identify the reference ingredient (e.g., flour). For all other ingredients, calculate and store:

  $$P\_i = \\left( \\frac{W\_i}{W\_{\\text{ref}}} \\right) \\times 100$$

- Store `original_input_string`, `is_reference`, and `bakers_percentage` on the `recipe_ingredients` row.

### Step 7: Event-Driven Knowledge Sync (GraphRAG)

- Upon commit, emit `@nestjs/event-emitter` events (e.g., `RecipeApproved`).

- BullMQ background workers listen to these events and asynchronously sync data to Qdrant (vectors) and Neo4j (graph relations).

- \*\*Textbook Handling:\*\* 1000-page PDFs bypass manual review entirely. The pipeline extracts "Triples" (Subject $\\rightarrow$ Predicate $\\rightarrow$ Object) and writes them directly to Postgres `system_memories` and Neo4j to build the Culinary Brain.

---

## PART 3: MASTER EPIC TICKETS

_(Agents: Execute these Epics sequentially. Create sub-branches per Task. Ensure all validation criteria are met before merging.)_

### EPIC 1: Infrastructure, Secrets &amp; NestJS Enterprise Features

\*\*Objective:\*\* Purge technical debt, secure config via Infisical, and implement enterprise stability packages.

\* \*\*Task 1.1: Codebase Purge &amp; Domain Restructure\*\*

    \*   Delete duplicate/hallucinated folders (`apps/api/apps/api`).

    \*   Restructure `apps/api/src/` strictly into `core/`, `shared/`, and `modules/`.

    \*   Globally rename all instances of `unified-ingestion` to `ingestion`.

\* \*\*Task 1.2: Infisical Machine Identity &amp; ESLint Lockdown\*\*

    \*   Delete custom `packages/config/cli.ts`.

    \*   Update all `package.json` scripts to wrap commands in `infisical run --env=... --`.

    \*   Add an ESLint rule in `packages/eslint-config` explicitly banning `process.env` in `apps/web` and `apps/pos-simulator`.

\* \*\*Task 1.3: `nest-commander` CLI Overhaul\*\*

    \*   Convert `apps/cli` to use `nest-commander`.

    \*   Migrate shell scripts from `.zsh_aliases` into executable NestJS commands (e.g., `sous agent:tail`, `sous db:sync-neo4j`). Implement logic to read `process.cwd()` and `IS_DOCKER` for environment-aware execution.

\* \*\*Task 1.4: Enterprise Plugins (CLS, Throttler, Terminus, Pino)\*\*

    \*   Implement `nestjs-cls` (Async Local Storage). Refactor the Supabase Provider to act as a Singleton that reads `orgId` from the CLS context and executes `SET LOCAL app.current_tenant = :orgId`.

    \*   Implement `@nestjs/throttler` (Redis-backed) to rate-limit LLM endpoints.

    \*   Implement `@nestjs/terminus` for `/health` checks (Postgres, Redis, Neo4j).

    \*   Implement `nestjs-pino` for async structured JSON logging, redacting auth headers.

### EPIC 2: Code-First GraphQL, Offline URQL &amp; Upload Abstraction

\*\*Objective:\*\* Migrate transport layer to GQL, enable offline KDS/POS functionality, and handle file uploads seamlessly.

\* \*\*Task 2.1: NestJS Code-First GraphQL &amp; Redis PubSub\*\*

    \*   Install `@nestjs/graphql` configured for `autoSchemaFile: true`.

    \*   Configure `graphql-redis-subscriptions` connected to the existing Redis instance for horizontally scalable real-time events.

\* \*\*Task 2.2: The `api-client` URQL SDK\*\*

    \*   Set up `@graphql-codegen/cli` in `packages/api-client` to generate typed React hooks.

    \*   Configure the URQL client using `@urql/exchange-graphcache` for offline optimistic UI support.

    \*   Configure `@urql/exchange-auth` to automatically intercept 401 Unauthorized errors, hit the `/v1/auth/refresh` REST endpoint, and transparently reconnect WebSockets.

\* \*\*Task 2.3: Signed URL File Upload Abstraction\*\*

    \*   Create a GQL Mutation `generateUploadUrl(fileName)`.

    \*   Export high-level helpers from `api-client`: `uploadFile(file)` (requests URL and PUTs binary to Supabase) and `uploadAndIngest(file)` (uploads file and fires ingestion GQL mutation).

### EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\*\*Objective:\*\* Decouple AI tool execution from the HTTP lifecycle and implement an infinite-scaling Tool Registry.

\* \*\*Task 3.1: Command Tool Registry (IoC)\*\*

    \*   Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator.

    \*   Refactor `CommandsService` to dynamically resolve tools based on the LLM's requested `functionName`, eliminating the legacy `if/else` block.

\* \*\*Task 3.2: Isolate Existing Tools\*\*

    \*   Move `ingest_document`, `add_to_purchase_order`, etc., into standalone provider classes in `src/modules/commands/tools/`.

\* \*\*Task 3.3: Async Execution &amp; Subscription Streaming\*\*

    \*   Refactor the Omnibar GQL mutation to immediately return `202 Accepted` and a `conversationId`.

    \*   Push the LLM execution task to a BullMQ worker.

    \*   The worker publishes Redis events for every agent step. The frontend subscribes via `onOmnibarEvent` to stream updates live.

### EPIC 4: The Autonomous Ingestion Engine &amp; Baker's Math

\*\*Objective:\*\* Implement the 7-Step Waterfall, Idempotency, and the Self-Learning Memory Loop.

\* \*\*Task 4.1: Idempotency &amp; Promise.allSettled Resilience\*\*

    \*   Hash `vendor_id + invoice_id + date` before DB insertion to prevent duplicate ingestion.

    \*   Replace all `Promise.all` loops in ingestion processors with `Promise.allSettled`. Catch errors, mark the specific item with `resolutionError: true`, and continue processing.

\* \*\*Task 4.2: Triage, Debate &amp; USDA Normalization\*\*

    \*   Implement Ollama routing (Invoice vs Recipe vs Textbook).

    \*   Implement the "Critic" Ollama agent to verify Gemini Flash extractions.

    \*   Implement `normalizeCulinaryTerms()` to map colloquial terms before querying the USDA FDC Foundation database.

\* \*\*Task 4.3: Baker's Math &amp; Recipe Checkpoints\*\*

    \*   Implement `RecipeMathService.determineCalculationType()`.

    \*   Update `recipe_ingredients` to store `is_reference`, `bakers_percentage`, and `original_input_string`.

    \*   Implement a snapshot-based versioning system in the `recipe_versions` table.

\* \*\*Task 4.4: The Learning Loop &amp; Auto-Commit\*\*

    \*   Upsert `vendor_item_aliases` (with a pgvector embedding) whenever a user approves a mapping.

    \*   Auto-commit newly extracted items if their pgvector similarity against aliases is $\\ge 0.95$.

    \*   Create a weekly `@Cron` job to aggregate and report on `raw_unmapped_data` to guide future schema expansion.

### EPIC 5: SSOT Event-Driven Graph &amp; Enterprise Integrity

\*\*Objective:\*\* Establish Postgres as the ultimate Source of Truth, sync Neo4j/Qdrant asynchronously, and enforce RBAC and Concurrency controls.

\* \*\*Task 5.1: Canonical Memories &amp; Event Emitters\*\*

    \*   Create `system_memories` Postgres table. Delete standalone Qdrant scripts.

    \*   Use `@nestjs/event-emitter` to broadcast events (`MemoryCreated`, `RecipeApproved`).

    \*   Build BullMQ workers that listen to these events to asynchronously embed data and execute Cypher queries to sync Qdrant and Neo4j.

\* \*\*Task 5.2: LLM Gateway Router\*\*

    \*   Build `LlmRouterService` to optimize quotas: Route triage/debate to Local Ollama, bulk extraction to Gemini Flash, and deep reasoning to Gemini Pro/Claude Sonnet.

\* \*\*Task 5.3: Enterprise Data Integrity\*\*

    \*   \*\*Soft Deletes:\*\* Globally ban `DELETE`. Add `deleted_at` to schemas and GQL resolvers.

    \*   \*\*OCC:\*\* Implement `version` checks on `recipes` and `master_items` mutations to prevent double-edit race conditions.

    \*   \*\*RBAC:\*\* Implement a `RolesGuard` and `@Roles()` decorators checking JWT claims.

    \*   \*\*Business Days:\*\* Update analytic queries to support a tenant-defined rollover hour (e.g., 4:00 AM) instead of UTC date groupings.

\* \*\*Task 5.4: Test Automation Standard\*\*

    \*   Write Jest Unit Tests mocking all external LLM and USDA APIs.

    \*   Write Supertest E2E Tests that programmatically upload mock PDF buffers to verify the entire asynchronous ingestion queue without requiring UI interaction.

### EPIC 6: IoT Edge Node &amp; Mesh Networking

\*\*Objective:\*\* Unblock the local Raspberry Pi deployment to support private subnet printers and offline resilience.

\* \*\*Task 6.1: Dumb Relay Daemon\*\*

    \*   Strip heavy business logic from the Raspberry Pi codebase.

    \*   Implement a lightweight Node/Bun daemon that maintains a secure WebSocket connection to the cloud API.

\* \*\*Task 6.2: mDNS &amp; ESC/POS Translation\*\*

    \*   Enable the Edge Node to perform mDNS/Bonjour discovery for local thermal printers.

    \*   Configure the daemon to accept JSON payloads from the cloud, translate them to raw ESC/POS network bytes, and push them to local printers on the private kitchen subnet.
