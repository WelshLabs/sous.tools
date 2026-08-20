#!/bin/bash
set -e

create_task() {
  local epic=$1
  local title=$2
  local context=$3
  local files=$4
  local steps=$5
  local validation=$6

  gh issue create --title "[Task]: $title" --body "## Agent Instructions
This issue must be small, scoped, and highly specific so the AI agent can execute it perfectly on the first try.

### Parent Epic Issue Number
$epic

### Context
$context

### Files in Scope
$files

### Implementation Steps
$steps

### Validation Command
$validation
"
}

# Epic 1 (#174)
create_task "#174" "Codebase Purge & Domain Restructure" "Clean up duplicate folders and restructure API." "apps/api/src/**/*" "1. Delete duplicate/hallucinated folders like apps/api/apps/api. 2. Restructure apps/api/src/ strictly into core/, shared/, and modules/. 3. Globally rename all instances of unified-ingestion to ingestion." "pnpm turbo typecheck"
create_task "#174" "Infisical Machine Identity & ESLint Lockdown" "Secure config via Infisical and ban process.env." "packages/config/**/*, packages/eslint-config/**/*, package.json" "1. Delete custom packages/config/cli.ts. 2. Update package.json scripts to wrap commands in infisical run --env=... --. 3. Add ESLint rule banning process.env in apps/web and apps/pos-simulator." "pnpm turbo lint"
create_task "#174" "nest-commander CLI Overhaul" "Convert apps/cli to use nest-commander." "apps/cli/**/*" "1. Convert apps/cli to use nest-commander. 2. Migrate shell scripts from .zsh_aliases into executable NestJS commands (e.g., sous agent:tail, sous db:sync-neo4j)." "pnpm turbo typecheck"
create_task "#174" "Enterprise Plugins (CLS, Throttler, Terminus, Pino)" "Implement enterprise stability packages." "apps/api/src/**/*" "1. Implement nestjs-cls (Async Local Storage). Refactor Supabase Provider to act as a Singleton reading orgId from CLS context. 2. Implement @nestjs/throttler. 3. Implement @nestjs/terminus. 4. Implement nestjs-pino." "pnpm turbo typecheck && pnpm turbo test"

# Epic 2 (#175)
create_task "#175" "NestJS Code-First GraphQL & Redis PubSub" "Setup GraphQL and real-time events." "apps/api/src/**/*" "1. Install @nestjs/graphql configured for autoSchemaFile: true. 2. Configure graphql-redis-subscriptions." "pnpm turbo typecheck"
create_task "#175" "The api-client URQL SDK" "Generate typed React hooks and setup URQL." "packages/api-client/**/*" "1. Set up @graphql-codegen/cli to generate hooks. 2. Configure URQL client using @urql/exchange-graphcache. 3. Configure @urql/exchange-auth." "pnpm turbo typecheck"
create_task "#175" "Signed URL File Upload Abstraction" "Handle file uploads seamlessly." "apps/api/src/**/*, packages/api-client/**/*" "1. Create GQL Mutation generateUploadUrl(fileName). 2. Export uploadFile(file) and uploadAndIngest(file) from api-client." "pnpm turbo typecheck"

# Epic 3 (#176)
create_task "#176" "Command Tool Registry (IoC)" "Create dynamic tool registry." "apps/api/src/modules/commands/**/*" "1. Create ToolRegistryService utilizing NestJS DiscoveryService and @CommandTool() decorator. 2. Refactor CommandsService to dynamically resolve tools." "pnpm turbo typecheck"
create_task "#176" "Isolate Existing Tools" "Move tools into standalone classes." "apps/api/src/modules/commands/tools/**/*" "1. Move ingest_document, add_to_purchase_order, etc. into standalone provider classes in src/modules/commands/tools/." "pnpm turbo typecheck"
create_task "#176" "Async Execution & Subscription Streaming" "Stream tool execution states." "apps/api/src/modules/commands/**/*" "1. Refactor Omnibar GQL mutation to return 202 and a conversationId immediately. 2. Push LLM task to BullMQ. 3. Publish Redis events for frontend subscription." "pnpm turbo typecheck"

# Epic 4 (#177)
create_task "#177" "Idempotency & Promise.allSettled Resilience" "Prevent duplicate ingestion and handle errors gracefully." "apps/api/src/modules/ingestion/**/*" "1. Hash vendor_id + invoice_id + date before DB insertion. 2. Replace all Promise.all loops with Promise.allSettled." "pnpm turbo typecheck"
create_task "#177" "Triage, Debate & USDA Normalization" "Route and verify extractions." "apps/api/src/modules/ingestion/**/*" "1. Implement Ollama routing. 2. Implement Critic Ollama agent to verify extractions. 3. Implement normalizeCulinaryTerms() before USDA FDC query." "pnpm turbo typecheck"
create_task "#177" "Baker's Math & Recipe Checkpoints" "Handle complex recipe math." "apps/api/src/modules/recipes/**/*" "1. Implement RecipeMathService.determineCalculationType(). 2. Update recipe_ingredients for baker's percentage. 3. Implement snapshot versioning in recipe_versions." "pnpm turbo typecheck"
create_task "#177" "The Learning Loop & Auto-Commit" "Auto-commit confident extractions." "apps/api/src/modules/ingestion/**/*" "1. Upsert vendor_item_aliases on approval. 2. Auto-commit newly extracted items if pgvector similarity >= 0.95. 3. Create weekly cron for raw_unmapped_data." "pnpm turbo typecheck"

# Epic 5 (#178)
create_task "#178" "Canonical Memories & Event Emitters" "Sync Graph data asynchronously." "apps/api/src/modules/memory/**/*" "1. Create system_memories Postgres table. 2. Broadcast events using @nestjs/event-emitter. 3. Build BullMQ workers to sync Qdrant and Neo4j." "pnpm turbo typecheck"
create_task "#178" "LLM Gateway Router" "Optimize LLM usage." "apps/api/src/modules/ai/**/*" "1. Build LlmRouterService to route tasks to Ollama, Flash, or Pro." "pnpm turbo typecheck"
create_task "#178" "Enterprise Data Integrity" "Enforce RBAC, Soft Deletes, OCC." "apps/api/src/**/*" "1. Implement deleted_at globally. 2. Implement version checks on recipes for OCC. 3. Implement RolesGuard and @Roles(). 4. Support tenant-defined Business Days." "pnpm turbo typecheck"
create_task "#178" "Test Automation Standard" "Ensure pipeline stability." "apps/api/src/**/*" "1. Write Jest Unit Tests. 2. Write Supertest E2E tests for ingestion queue." "pnpm turbo test"

# Epic 6 (#179)
create_task "#179" "Dumb Relay Daemon" "Lightweight Node/Bun daemon for RPi." "apps/edge-node/**/*" "1. Strip business logic from Pi codebase. 2. Maintain secure WebSocket to cloud API." "pnpm turbo typecheck"
create_task "#179" "mDNS & ESC/POS Translation" "Discover local printers." "apps/edge-node/**/*" "1. mDNS discovery. 2. Translate JSON to ESC/POS bytes." "pnpm turbo typecheck"
