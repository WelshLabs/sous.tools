#!/bin/bash
set -e

# Epic 1
gh issue create --title "[Epic]: Infrastructure, Secrets & NestJS Enterprise Features" --label "Epic" --body "## Overview
Purge technical debt, secure config via Infisical, and implement enterprise stability packages.

## Architectural Decisions
- Restructure apps/api/src/ into core/, shared/, modules/.
- Deprecate process.env in favor of @soustools/config.
- Use nest-commander for apps/cli.
- Implement nestjs-cls, @nestjs/throttler, @nestjs/terminus, nestjs-pino.
"

# Epic 2
gh issue create --title "[Epic]: Code-First GraphQL, Offline URQL & Upload Abstraction" --label "Epic" --body "## Overview
Migrate transport layer to GQL, enable offline KDS/POS functionality, and handle file uploads seamlessly.

## Architectural Decisions
- @nestjs/graphql configured for autoSchemaFile: true.
- graphql-redis-subscriptions.
- @graphql-codegen/cli in packages/api-client.
- URQL client with @urql/exchange-graphcache and @urql/exchange-auth.
- Signed URL File Upload Abstraction.
"

# Epic 3
gh issue create --title "[Epic]: Omnibar IoC Registry & Async Execution Flow" --label "Epic" --body "## Overview
Decouple AI tool execution from the HTTP lifecycle and implement an infinite-scaling Tool Registry.

## Architectural Decisions
- ToolRegistryService utilizing NestJS DiscoveryService and @CommandTool() decorator.
- Isolate tools into standalone provider classes in src/modules/commands/tools/.
- Async Execution & Subscription Streaming via BullMQ and Redis PubSub.
"

# Epic 4
gh issue create --title "[Epic]: The Autonomous Ingestion Engine & Baker's Math" --label "Epic" --body "## Overview
Implement the 7-Step Waterfall, Idempotency, and the Self-Learning Memory Loop.

## Architectural Decisions
- Idempotency Hash (vendor_id + invoice_id + date).
- Promise.allSettled for resilience.
- Ollama routing (Invoice vs Recipe vs Textbook) and Critic agent.
- RecipeMathService for Volumetric Math and Baker's Math.
- Vector-Accelerated Tenant Memory (pgvector).
"

# Epic 5
gh issue create --title "[Epic]: SSOT Event-Driven Graph & Enterprise Integrity" --label "Epic" --body "## Overview
Establish Postgres as the ultimate Source of Truth, sync Neo4j/Qdrant asynchronously, and enforce RBAC and Concurrency controls.

## Architectural Decisions
- system_memories Postgres table.
- @nestjs/event-emitter for Domain Decoupling.
- LlmRouterService for optimizing quotas.
- Soft Deletes, OCC, RBAC, Business Days.
- Jest Unit Tests and Supertest E2E Tests.
"

# Epic 6
gh issue create --title "[Epic]: IoT Edge Node & Mesh Networking" --label "Epic" --body "## Overview
Unblock the local Raspberry Pi deployment to support private subnet printers and offline resilience.

## Architectural Decisions
- Dumb Relay Daemon (Node/Bun).
- mDNS & ESC/POS Translation.
"
