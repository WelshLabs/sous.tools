# Architecture Decision Record (ADR) &amp; Master Execution Plan

## ADR: Enterprise API Refactor, Code-First GraphQL, and Ingestion Resilience

\*\*Date:\*\* August 19, 2026

\*\*Status:\*\* Accepted

### 1. Context &amp; Problem Statement

The NestJS API prototype has reached its scaling limits. The codebase suffers from procedural "God Classes" (specifically the Omnibar tool router), fragile asynchronous tasks (`Promise.all` explosions in ingestion), disconnected naming conventions, and hallucinatory folder structures. Furthermore, the transport layer is fragmented across REST and unstable native WebSockets causing frequent auth drops. Multi-tenancy is loosely enforced via manual query parameters rather than strict Row-Level Security (RLS) scoping. Secrets management is inconsistent, leading to missing build-time variables in Next.js.

We need an enterprise-grade architecture that ensures:

1. \*\*Bulletproof Ingestion:\*\* The AI must handle partial failures, map culinary terms properly, dynamically assign calculation types, and learn from user corrections.
2. \*\*Infinite AI Tool Scaling:\*\* The Omnibar needs an Inversion of Control (IoC) registry to support hundreds of tools without modifying core services.
3. \*\*Real-Time Data Parity:\*\* The frontend must seamlessly receive KDS/POS updates without managing complex WebSocket auth handshakes.
4. \*\*Developer Experience &amp; Security:\*\* Secrets must be injected at the infrastructure level, folders must follow strict Domain-Driven Design (DDD), and tests must guarantee pipeline stability.

### 2. Architectural Decisions

#### 2.1 Transport Layer: Code-First GraphQL &amp; URQL

- \*\*Decision:\*\* Migrate data operations to a Code-First GraphQL architecture. Deprecate native WebSockets and most REST endpoints (except `/v1/auth/*` and third-party `/v1/webhooks/*`).
- \*\*Real-Time Subscriptions:\*\* Implement `graphql-redis-subscriptions` to allow horizontal scaling. Next.js applications will connect via Subscriptions to listen to POS, KDS, and Omnibar execution events.
- \*\*Client SDK (`api-client`):\*\* Use `@graphql-codegen/cli` to generate typed React hooks. Expose a \*\*URQL client\*\* wrapped with `@urql/exchange-auth` to automatically intercept 401s, call the REST refresh endpoint, and reconnect.
- \*\*File Upload Abstraction:\*\* GraphQL multipart uploads are banned. `api-client` will expose `uploadAndIngest(file)` which orchestrates: 1) GQL Mutation to get a Supabase Signed URL, 2) Native HTTP PUT of the binary to Supabase, 3) GQL Mutation to trigger the background ingestion job with the URL.

#### 2.2 Security &amp; Multi-Tenancy

- \*\*Decision:\*\* Enforce Request-Scoped RLS in the database provider.
- \*\*Implementation:\*\* Clients NEVER pass `orgId`. The NestJS Request-Scoped Supabase Provider will extract the tenant ID from the validated JWT and use Postgres `set_config` to establish a secure RLS context for every transaction.
- \*\*Secrets:\*\* Deprecate custom Infisical loaders. Enforce the Infisical CLI wrapper (`infisical run --env=prod -- pnpm start`) at the infrastructure layer. Frontend apps are banned from using `process.env` directly; they must use the Zod-validated `@soustools/config`.

#### 2.3 The Omnibar Tool Registry (IoC)

- \*\*Decision:\*\* Remove the procedural `if/else` block in `CommandsService`.
- \*\*Implementation:\*\* Build a `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator. Omnibar commands will return a `200 OK` instantly, dispatch the LLM task to a BullMQ worker, and stream execution states back to the client via GraphQL Subscriptions (Redis PubSub).

#### 2.4 Ingestion Pipeline Resilience &amp; Learning

- \*\*Decision:\*\* Bulletproof the pipeline against external API timeouts and bad data.
- \*\*Implementation:\*\*
  1. \*\*Resilience:\*\* Use `Promise.allSettled` for ingredient and line-item processing.
  2. \*\*USDA Normalization:\*\* Pass queries through a culinary normalizer (e.g., "Full fat milk" -&gt; "Milk, whole") before querying the FDC Foundation/SR Legacy databases.
  3. \*\*Calculation Types:\*\* Implement `determineCalculationType()` to infer `fixed_weight`, `fixed_volume`, or `each` dynamically from parsed units.
  4. \*\*The Learning Loop:\*\* Execute an upsert to `vendor_item_aliases` when a user approves a mapped ingredient/item, ensuring 1.0 confidence auto-resolution on future runs.
- \*\*Event-Driven Sync:\*\* Decouple Neo4j syncing. `IngestionService` emits `@nestjs/event-emitter` events (`ingestion.approved`); `Neo4jSyncService` listens asynchronously.

#### 2.5 NestJS Production Tooling

- \*\*Decision:\*\* Enforce enterprise Node.js standards.
- \*\*Implementation:\*\* Implement `nestjs-pino` for async structured JSON logging. Rebuild `apps/cli` using `nest-commander` to replace shell scripts (`.zsh_aliases`) for tasks like agent log tailing and DB syncs. Enable `@nestjs/devtools-integration`. Write comprehensive Jest (Unit) and Supertest (E2E) tests.

---

# [AGENTS.md](http://AGENTS.md) (Update contents to this)

## 1. Domain-Driven Design (DDD) &amp; Infrastructure

- \*\*Strict Boundaries:\*\* Next.js apps (`apps/web`, `apps/pos-simulator`) and domain packages (`packages/domain-*`) are strictly forbidden from importing database clients.
- \*\*The Supabase Firewall:\*\* NO CLIENT OR UI APP is allowed to access Supabase directly. Absolutely no one outside of `apps/api` should have access to or knowledge of Supabase.
- \*\*API First &amp; Dumb Transport Layer:\*\* ALL network requests must go exclusively through `packages/api-client`. Native `fetch()`, `axios`, or direct endpoint calls outside of `api-client` are strictly forbidden. `api-client` encapsulates the URQL GraphQL client, standard REST webhook endpoints, and custom upload functions (`uploadFile`, `uploadAndIngest`).
- \*\*Secrets SSOT (Fail Fast):\*\* Infisical is the Single Source of Truth. The custom `packages/config` script is deprecated. Apps MUST boot using the official Infisical CLI (`infisical run --env=... -- pnpm start`). `packages/config` purely serves as a Zod validation schema. 
- \*\*ESLint `process.env` Ban:\*\* Frontend apps are strictly banned from accessing `process.env` (including `NEXT_PUBLIC_`) directly. All configuration must flow through the type-safe `@soustools/config` package to ensure variables are present at build and run time.

## 2. Component Architecture, Data Fetching &amp; Styling

- \*\*React Server Components (RSC) vs. Containers:\*\* 
  - Initial, non-interactive data fetching should happen in Next.js Server Components.
  - Deeply nested interactive components or real-time views MUST NOT rely on massive prop-drilling from the server.
  - Instead, use the Container/View pattern. `*.container.tsx` files are explicitly authorized to use auto-generated URQL GraphQL hooks (`useQuery`, `useSubscription`) to fetch their own data and listen for live Redis events.
- \*\*Global Tenant Scoping:\*\* Frontend clients NEVER pass `orgId` as an argument or variable in GraphQL queries/subscriptions. The API extracts the tenant ID directly from the JWT auth token to enforce strict Row-Level Security (RLS) globally.

## 3. NestJS API Standards (Modular Monolith)

- \*\*Code-First GraphQL:\*\* The API is a Code-First GraphQL server. REST is deprecated except for third-party webhooks (Stripe, etc.) and Auth (`/v1/auth/*`).
- \*\*URQL &amp; Auth Resiliency:\*\* The URQL client in `api-client` utilizes `@urql/exchange-auth` to automatically pause outbound queries/subscriptions on a 401, hit the REST refresh endpoint, and seamlessly reconnect the WebSocket. Do not write manual token retry logic.
- \*\*No Global Database Clients:\*\* Never use `import { supabase } from '../../lib/supabase'`. Use Request-Scoped providers that read the token and enforce RLS.
- \*\*IoC Tool Registry:\*\* The Omnibar relies on an Inversion of Control Tool Registry. Never use `if/else` blocks for AI tool routing. Create isolated `@CommandTool()` classes.
- \*\*Async Execution:\*\* Heavy AI tasks (like Omnibar commands) MUST NOT block the HTTP lifecycle. Return an immediate `200 OK` with a `conversationId`, drop the task in BullMQ, and stream updates to the frontend via GraphQL Subscriptions over Redis PubSub.
- \*\*Event-Driven Boundaries:\*\* Use `@nestjs/event-emitter` to decouple domains (e.g., Ingestion finishing -&gt; Emits Event -&gt; Neo4j Sync Service updates graph).
- \*\*Resilient Processing:\*\* Queue workers MUST use `Promise.allSettled` for batch external requests. Handle partial failures gracefully to avoid poisoning the queue.
- \*\*Nest-Commander CLI:\*\* The `apps/cli` package uses `nest-commander` to wrap routine tasks (DB syncs, SSH generation, audit reporting).

## 4. AI Orchestration &amp; Execution (4-Interface &amp; Kanban Agents)

- \*\*Direct Execution:\*\* Analyze silently, and immediately use your file-editing tools to execute changes.
- \*\*GitHub Issue &amp; Kanban Management (MCP):\*\* Autonomous agents must inspect ticket details and use GitHub API/MCP to move tickets across the Kanban board.
- \*\*Halt-on-Error with Self-Repair:\*\* Run `pnpm typecheck && pnpm lint && pnpm test`. If errors occur, attempt self-repair up to 3 times before opening a PR.

## 5. Graph Database (Neo4j) &amp; Relational Parity

- \*\*PostgreSQL &amp; Neo4j Synchronization:\*\* PostgreSQL and Neo4j MUST stay in perfect 1:1 synchronization. Any changes made to the PostgreSQL schema MUST be immediately reflected in Neo4j `schema-registry.ts` and associated synchronization events.

## ARCHITECTURAL MEMORY PROTOCOL (QDRANT)

You have access to a Qdrant vector database via MCP. This is your long-term memory for the [sous.tools](http://sous.tools) infrastructure, design decisions, and resolved bugs. You must actively manage this memory.

- \*\*MANDATORY RETRIEVAL (READ):\*\* Before answering questions about or modifying infrastructure, you MUST query Qdrant for existing constraints.
- \*\*MANDATORY COMMIT (WRITE):\*\* You must proactively store new, valuable information into Qdrant using tags like `[INFRASTRUCTURE]`, `[BUGFIX]`, `[SECRETS]`. Include the problem, context, and exact solution.

## ISSUE GENERATION PROTOCOL (PLANNER AGENT)

When planning epics and sub-tasks with the user, use the strict templates:

- \*\*Epics:\*\* Use `.github/ISSUE_TEMPLATE/epic.yml`. Summarize the architecture and list sub-tasks.
- \*\*Sub-Tasks:\*\* Use `.github/ISSUE_TEMPLATE/agent-task.yml`. Must be highly detailed (Context, Exact Files, Step-by-Step, Validation command). Reference the parent Epic.

---

# THE 4 MASTER EPICS

## EPIC 1: Infrastructure Hardening, Secrets &amp; Codebase Purge

\`\`\`yaml

Title: "\[EPIC-1\] Infrastructure Hardening, Secrets &amp; Codebase Purge"

Labels: \["Epic", "Infrastructure"\]

Description: |

  \*\*Context:\*\* The codebase has accumulated hallucinated paths (`apps/api/apps/api`), disorganized files, and unstable secrets management. Developers randomly bypass `@soustools/config` via `process.env`.



  \*\*Sub-Tasks:\*\*

- \[ \] \*\*Task 1.1: Codebase Purge &amp; Domain Restructure\*\*
  ```
  - Identify and delete hallucinated folders and rogue `schema.gql` files. 
  
  - Restructure `apps/api/src/` strictly into `core/` (config, filters, guards, db providers), `shared/` (utilities), and `modules/` (health, ingestion, commands, pos). 
  
  - \*\*RENAME:\*\* Globally rename the module, files, and BullMQ queues from `unified-ingestion` to simply `ingestion`.
  ```
- \[ \] \*\*Task 1.2: Infisical Standardization &amp; ESLint Lockdown\*\*
  ```
  - Delete the custom Infisical loader script in `packages/config`. 
  
  - Update all `package.json` scripts across the monorepo to explicitly use the Infisical CLI wrapper (`infisical run --env=... -- pnpm ...`). 
  
  - Add an ESLint rule to ban `process.env` in `apps/web` and `apps/pos` to enforce `@soustools/config`.
  ```
- \[ \] \*\*Task 1.3: `nest-commander` CLI Overhaul\*\*
  ```
  - Convert `apps/cli` to use `nest-commander`. 
  
  - Migrate shell scripts from `.zsh_aliases` into executable NestJS CLI commands (e.g., `pnpm sous agent:tail` to tail docker logs, `pnpm sous ssh:prod`, db syncing).
  ```
- \[ \] \*\*Task 1.4: API Production Tooling\*\*
  ```
  - Implement `nestjs-pino` for async JSON logging. 
  
  - Enable URI Versioning for REST routes (`/v1/auth`, `/v1/webhooks`). 
  
  - Enable `@nestjs/devtools-integration` in development mode.
  ```

\`\`\`

## EPIC 2: Code-First GraphQL, URQL Resiliency &amp; Upload Abstraction

\`\`\`yaml

Title: "\[EPIC-2\] Code-First GraphQL, URQL Resiliency &amp; Upload Abstraction"

Labels: \["Epic", "API"\]

Description: |

  \*\*Context:\*\* Native WebSockets drop auth tokens. File uploads over GQL are messy. We need a Code-First GQL architecture with URQL handling auth retries natively, and an abstracted file upload layer.



  \*\*Sub-Tasks:\*\*

- \[ \] \*\*Task 2.1: NestJS Code-First GQL &amp; Redis PubSub\*\*
  ```
  - Install and configure `@nestjs/graphql` (Code-First).
  
  - Configure `graphql-redis-subscriptions` to enable horizontal scaling of real-time events.
  ```
- \[ \] \*\*Task 2.2: JWT Tenant Scoping (No Client `orgId`)\*\*
  ```
  - Build a Request-Scoped Supabase Provider that reads `orgId` from the validated JWT and enforces Postgres Row-Level Security (RLS) via `set_config`. Ensure the GQL execution context never requires `orgId` as an argument from the client.
  ```
- \[ \] \*\*Task 2.3: `api-client` URQL Setup &amp; `@urql/exchange-auth`\*\*
  ```
  - Implement `@graphql-codegen/cli` to generate typed React hooks. 
  
  - Configure the URQL client inside `packages/api-client` with `@urql/exchange-auth`. It MUST catch 401s, hit the REST `/v1/auth/refresh` endpoint, and seamlessly reconnect the WebSocket.
  ```
- \[ \] \*\*Task 2.4: The File Upload Abstraction\*\*
  ```
  - Export two helpers from `api-client`: 
  
    1) `uploadFile(file)`: Executes a GQL mutation for a Supabase Signed URL, natively HTTP PUTs the binary to Supabase, and returns the URL.
  
    2) `uploadAndIngest(file)`: Awaits `uploadFile`, then fires the GQL mutation `submitDocumentForIngestion(url)`.
  ```

\`\`\`

## EPIC 3: Omnibar IoC Registry &amp; Async Execution Flow

\`\`\`yaml

Title: "\[EPIC-3\] Omnibar IoC Registry &amp; Async Execution Flow"

Labels: \["Epic", "Agent"\]

Description: |

  \*\*Context:\*\* The Omnibar relies on a procedural "God Class" (`CommandsService`) with massive `if/else` blocks. AI tasks hold the HTTP connection hostage.



  \*\*Sub-Tasks:\*\*

- \[ \] \*\*Task 3.1: Implement ToolRegistryService\*\*
  ```
  - Create `ToolRegistryService` utilizing NestJS `DiscoveryService` and a `@CommandTool()` decorator. 
  
  - Refactor `commands.service.ts` to dynamically resolve and execute tools based on the LLM's requested `functionName`.
  ```
- \[ \] \*\*Task 3.2: Isolate Existing Tools\*\*
  ```
  - Strip all `if/else` logic out of the commands service. 
  
  - Create standalone classes inside `src/modules/commands/tools/` for `ingest_document`, `add_to_purchase_order`, `search_the_web`, etc. Ensure they are registered as providers.
  ```
- \[ \] \*\*Task 3.3: Async Execution &amp; GQL Subscriptions\*\*
  ```
  - Refactor the Omnibar endpoint to execute synchronously: return an immediate `200 OK` with a generated `conversationId`. 
  
  - Push the LLM execution task into a BullMQ queue. As the worker executes tools, publish state updates via Redis. The frontend URQL client listens via `subscription onOmnibarEvent($conversationId)`.
  ```

\`\`\`

## EPIC 4: Ingestion Resilience, USDA Fixes &amp; The Learning Loop

\`\`\`yaml

Title: "\[EPIC-4\] Ingestion Resilience, USDA Fixes &amp; The Learning Loop"

Labels: \["Epic", "Data"\]

Description: |

  \*\*Context:\*\* The pipeline fails completely if one item crashes (`Promise.all`). USDA searches fail on colloquial terms. Units are hardcoded to `fixed_weight`. The system forgets user corrections on subsequent runs.



  \*\*Sub-Tasks:\*\*

- \[ \] \*\*Task 4.1: `Promise.allSettled` Resilience\*\*
  ```
  - In the `IngestionProcessor`, replace `Promise.all` over ingredients and line items with `Promise.allSettled`. If an embedding or USDA fetch fails, catch the error, mark the block with `resolutionError: true`, and allow the successful items to proceed.
  ```
- \[ \] \*\*Task 4.2: USDA Canonicalization\*\*
  ```
  - In `UsdaResolverService`, write a `normalizeCulinaryTerms(query)` helper to map strings (e.g., "Full fat milk" -&gt; "Milk, whole") BEFORE querying the API. 
  
  - Append `&dataType=Foundation,SR%20Legacy` to the USDA URL.
  ```
- \[ \] \*\*Task 4.3: Dynamic Calculation Types\*\*
  ```
  - Write a `determineCalculationType(unitString)` helper. In `commitRecipeBlock`, assign `fixed_weight`, `fixed_volume`, or `each` dynamically so costs calculate correctly.
  ```
- \[ \] \*\*Task 4.4: The Entity Learning Loop\*\*
  ```
  - In `commitInvoiceBlock` and `commitRecipeBlock`, if an item resolves to a `selectedTenantId`, execute a Postgres upsert to the `vendor_item_aliases` table. Map `rawName` to `master_item_id`, ensuring the system auto-resolves this exact string with 1.0 confidence in the future.
  ```
- \[ \] \*\*Task 4.5: Event-Driven Graph Sync\*\*
  ```
  - Remove direct Neo4j service calls from the Ingestion pipeline. Use `@nestjs/event-emitter` to broadcast `EntityApproved` events. 
  
  - `Neo4jSyncService` must listen to these events via `@OnEvent` to asynchronously update the graph database.
  ```
- \[ \] \*\*Task 4.6: Comprehensive Testing Suite\*\*
  ```
  - Write Jest Unit Tests for `UsdaResolverService` (mocking the external API) and `ToolRegistryService`. 
  
  - Write Supertest E2E tests for the GraphQL Ingestion endpoints. E2E tests must programmatically upload a mock file buffer to verify the entire pipeline (queue to Postgres commit) functions properly.
  ```

\`\`\`