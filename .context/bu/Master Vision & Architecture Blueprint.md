Master Vision & Architecture Blueprint: sous.tools

1. Feature State Categorization

Before establishing the technical roadmap, we define the current development baseline to ensure architectural focus and eliminate conceptual drift.

Completed / Active Features (Phase 1)

- Digital Menu Signage MVP: Core rendering engine with Square POS baseline catalog sync.
- Monorepo Scaffolding: Turborepo structure with functional apps/ (api, app, tv-signage) and packages/ (ui, config, api-types).
- Neon-Glass Design System: Baseline Tailwind CSS v4 implementation with OKLCH token mapping.
- Multi-tenant Foundation: Supabase Auth with organization-level logical isolation and RLS.
- Local Node Heartbeat: Basic connectivity tracking for Raspberry Pi 5 mesh nodes.

Future Roadmap Ideas (Phase 2+)

- Hybrid Recipe & Production Engine: Generalized base-ingredient logic with dual-mode (Fixed vs. Baker’s %) scaling.
- Universal Ingestion & Learning Pipeline: Polymorphic OCR (Tesseract.js/BullMQ) with automated vendor-to-internal ID mapping.
- Procurement & Three-Way Ledger: Digital whiteboard to PO flow with automated invoice reconciliation.
- Alcohol & Beverage Matrix: Volumetric tracking with state excise tax decoupling.
- Predictive Agents: Deadstock mitigation and Menu Engineering Profit Matrices (Stars, Dogs, etc.).
- Platform Expansion: KDS Matrix, Hostess/Seating Management, and Wear OS haptic kitchen integrations.

Discarded / Conflicting Ideas

- Legacy Culinary Branding: Rejection of literal whisks/chef hats in favor of "Syntax and Heat" high-tech aesthetics.
- Windows-Direct Execution: Native execution replaced by forced WSL (Windows Subsystem for Linux) for filesystem integrity.
- Manual Context Briefing: Shift from manual session prep to the automated "3-Tier AI" architecture anchored by GEMINI.md.

2. Platform Vision and Brand Identity

The Master Vision

The sous.tools platform is a unified Restaurant Operating System (OS) designed to collapse the fragmented "Franken-stack" of modern hospitality technology. By merging POS, inventory, recipe math, and procurement into a single, high-performance intelligence layer, we eliminate the visibility gaps that lead to margin erosion and operational friction.

The architecture prioritizes real-time profitability tracking through a proactive orchestration engine. Rather than reviewing labor or food costs after the damage is done, the system provides live labor-to-sales drift alerts and dynamic recipe costing that reacts instantly to vendor price creep.

Our goal is a resilient, local-mesh ecosystem that behaves like a utility. The software is designed to be invisible yet bulletproof, surviving high-glare kitchen environments and intermittent connectivity through high-contrast design and offline-first engineering.

The Brand Metaphor: The Intersection of Heat and Syntax

The visual language rejects traditional tropes for a developer-centric aesthetic of precision.

Symbol Metaphor Sub-App / Module

> \_ (Terminal Prompt) Command & Logic sous.app (Core OS / Admin)
> Cloche Service & Presentation apps/tv-signage
> Document Icon Schema & Knowledge sous.docs (Documentation)
> Link/Chain System Interconnectivity Integrations & POS Sync

UI/UX Aesthetic (Neon-Glass)

The system utilizes a "Neon-Glass" design system engineered for high-glare commercial environments.

- Color Space: High-vibrancy OKLCH tokens via tokens.ts. Primary: oklch(0.60 0.25 250) (Vibrant Blue); Background: oklch(0.98 0.005 240) (Light) / oklch(0.12 0.02 240) (Dark).
- Glassmorphism: .glass-panel utilities utilizing bg-zinc-950/40, backdrop-blur-2xl, and border-white/5.
- Ambient Radiance: Every layout must host dual-node background radiance for refraction depth. Top-left: blue-500/10 radiance; Bottom-right: cyan-500/5 radiance; both nodes utilizing 120px blur.
- Typography: High-scannability fonts: Inter (Sans), Outfit (Brand), and Geist Mono (Technical data).

3. Core Architecture and Infrastructure

Monorepo Structure (Turborepo)

- Applications (apps/):
  - app: Admin Dashboard (Next.js 16 PWA).
  - api: Central NestJS Gateway.
  - tv-signage: Wayland-optimized signage player.
  - customer-site: Multi-tenant domain routing engine.
  - marketing: Landing and sales portal.
- Shared Packages (packages/):
  - @soustools/ui: Zero-bundler Tailwind v4 component library.
  - @soustools/config: The sole provider of configuration; direct process.env calls elsewhere are strictly prohibited. Uses Infisical for secret management.
  - @soustools/api-types: Shared TypeScript interfaces/DTOs.
  - @soustools/utils: Standard singletons and helper functions.

The Technology Stack & Deployment

- Backend: NestJS on Render.com.
- Frontend: Next.js 16 on Vercel.
- Persistence: Supabase (PostgreSQL + Realtime).
- Observability & Keep-Alive: Centralized logging via Better Stack. Production NestJS instances are kept warm 24/7 using Better Stack uptime monitors hitting health-check routes to survive instance limits; RPi heartbeats are aggregated here.
- Local Infrastructure: Raspberry Pi 5 running Docker/Watchtower for auto-updates.

Local Mesh and Offline-First Strategy

The system handles kitchen Wi-Fi dead zones via a local master node deployment.

- Sync Logic: A Delta-Action Log Architecture journals individual mutations (e.g., toggle_step).
- Conflict Resolution: CRDTs (Conflict-free Replicated Data Types) merge states chronologically via deterministic vector timestamps when devices reconnect to the local mesh.

4. Primary Functional Modules

Digital Menu Signage (Phase 1)

A dual-TV kiosk setup on Raspberry Pi 5 using Wayland/Labwc.

- Window Management: Because Wayland lacks coordinate-based positioning, browser windows are mapped to hardware outputs (HDMI-A-1/2) via custom window titles (SignageDisplay1, SignageDisplay2) caught by rc.xml window rules.
- Real-time Layer: NestJS WebSockets broadcast layout_updated events for zero-latency screen refreshes.

Hybrid Recipe and Production Engine

The engine utilizes a Generalized Base-Ingredient Logic to accommodate both baking and savory/beverage workflows.

- Math Engine: Uses the base_calculation_group flag in the schema. The system sums the weight of all ingredients marked as "base" to establish the 100% divisor (whether flour, meat for charcuterie, or base liquid for cocktails).
- Dual-Mode Scaling: Supports fixed_weight (static scaling) and bakers_percentage (dynamic scaling relative to the base group).
- Vessel Awareness: Volume-aware scaling based on many-to-many relationships with tenant-defined equipment (e.g., Pullman Pan volumes).

Universal Ingestion and Learning Pipeline

A polymorphic pipeline for digitizing raw data using context-aware system prompts.

- Pipeline: Tesseract.js (Local OCR) -> BullMQ (Async Queue) -> LLM Parser.
- Deterministic Translation Matrix: A learning engine mapping cryptic vendor strings (e.g., "CHIK BRST 5#") to internal human-readable IDs, stored in vendor_item_aliases.

Procurement and Three-Way Reconciliation Loop

Digitizing the "Kitchen Whiteboard" into a structured financial ledger.

- Three-Way Reconciliation: A loop comparing Purchase Orders vs. Invoices vs. Scanned Deliveries.
- UI Intelligence: Discrepancies such as quantity mismatches or price creep are highlighted in amber within the verification grid to protect margins.
- Market Walk Mode: Mobile-optimized checklist with strike-through striking and offline local caching for manual shopping trips.

5. Third-Party Integration and POS Sync

Bidirectional Sync Engine

Ensures 100% state integrity with Square/Toast.

- Webhook Loop Attenuation: Every outgoing sync carries an actor signature. Incoming webhooks matching the internal actor_id are dropped to prevent infinite loops.
- Mapping Layers: pos_mappings table tracks internal vs. external IDs with last_synced_at timestamps for idempotency.

Beverage and Alcohol Optimization

- Volume Matrix: A fluid-ounce/milliliter-to-weight translation matrix for precision inventory.
- Shared-Base Mapping: Multiple cocktail recipes (e.g., Negroni/Boulevardier) mapped to a single master SKU bottle for accurate drawdown.

6. Engineering Standards and AI Orchestration

The AI Engineering Pipeline (3-Tier)

1. NotebookLM (Static Anchor): Holds flattened codebase snapshots (via repomix) and PRDs. It generates the "Context Brief."
2. Gemini (Feature Lab): Brainstorming partner using the Context Brief and the Project Root GEMINI.md anchor.
3. Antigravity 2.0 (Executor): Autonomous coder operating in Management Mode with parallel sub-agents (Agent A: Schema, Agent B: UI, Agent C: API).

Code Quality Mandates

- GEMINI.md & ~/.gemini/: All agents must parse the root GEMINI.md for context. Autonomous tools (write_file, git) are enabled via ~/.gemini/ configuration for zero-prompt execution.
- Atomic Files: Strict 150-line file cap per TS/TSX file.
- Singleton Utilities:
  - SingletonLock: Redis-backed distributed locking to prevent race conditions in BullMQ.
  - SingletonSocket: Persistent, auto-reconnecting WebSocket bridge for TV signage persistence.
  - SingletonCookie: Unified client/server resolution.

7. Strategic Future Roadmap

Platform Expansion

1. KDS Matrix: Real-time ticket aging and station routing.
2. Hostess & Seating: Reservation integration and floor plan management.
3. Deadstock Mitigation: Predictive agents flagging slow-moving inventory to suggest specials.
4. Wear OS Integration: Haptic timers and voice-logged inventory queues.

Scaling Metrics (Menu Engineering Matrix)

The system categorizes all menu items into performance quadrants based on real-time COGS data and POS performance:

- Stars: High Profit, High Popularity.
- Plowhorses: Low Profit, High Popularity (Targets for portion adjustment).
- Puzzles: High Profit, Low Popularity (Targets for marketing).
- Dogs: Low Profit, Low Popularity (Targets for removal).
