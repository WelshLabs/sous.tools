Master Tasklist & Codebase Audit: sous.tools

1. Core Infrastructure & Monorepo Foundation

The architecture is a Turborepo-managed monorepo designed for high-performance service orchestration and local-mesh reliability in high-interference kitchen environments.

Feature Status Item Details
Monorepo Scaffolding [x] Turborepo structure verified with apps/api, apps/app, apps/signage, and shared packages/ including @soustools/ui, @soustools/config, @soustools/api-types, @soustools/utils (Standard Singletons), and @soustools/logger.
Auth & Multi-tenancy [x] Supabase Auth with organization-level logical isolation; RLS foundation established.
Database Migration Management [ ] PENDING: Flatten multiple incremental migration files in supabase/migrations/ into a single, ordered schema file to prevent production permission failures.
Secrets Management [x] Infisical established as the sole provider for secrets via @soustools/config.
Observability & Resilience [x] Better Stack centralized logging via @soustools/logger and NestJS "keep-warm" uptime monitors for 24/7 Render.com instance availability.
Local Mesh Readiness [x] Raspberry Pi 5 Docker/Watchtower structure; Delta-Action Log architecture for offline-first mutation journaling and CRDT state merging.

2. Signage System & Visual Editor

The signage system must transition from a basic rendering engine to a pixel-perfect "Digital Canvas" capable of replicating high-fidelity designs for the Dtown Cafe beta.

1. Wayland/Labwc Hardware Mapping [x]: Implementation of rc.xml window rules to map browser titles (SignageDisplay1, SignageDisplay2) to specific hardware outputs (HDMI-A-1/2).
2. Basic Signage Rendering [x]: Core engine and Square POS catalog sync are functional; supports real-time "Sold Out" status updates via SingletonSocket and NestJS WebSockets.
3. Visual Editor Benchmark [ ]: PENDING. Current editor is clunky. Must achieve pixel-perfect parity with reference designs, specifically for:

- Breakfast Masterpieces: Rendering the Egg & Cheese Sandwich ($10.00) on scratch brioche.
- Soup of the Week: Chili (8oz/12oz pricing tiers).
- Frozen Take Home Dinners: Scratch Pierogi ($16/dz) with live "Sauerkraut & Bacon" status flagging.

4. Drag-and-Drop Canvas Editor [ ]: PENDING. Implement an intuitive visual editor with drag-and-drop resize handles mimicking industry-leading website builders.
5. Generalized Editor Logic [ ]: PENDING. Abstract logic to support website design, custom receipt layouts, to-go labels with cooking instructions, and A4 marketing prints.

6. Culinary Intelligence & Ingestion Pipeline

This module serves as the proactive intelligence layer, moving from manual data entry to automated margin protection.

- OCR Pipeline [ ]: PENDING. End-to-end flow (Tesseract.js -> BullMQ -> LLM Parser) for "scan-to-use" invoice processing.
- Deterministic Translation Matrix [ ]: PENDING. Learning engine to map cryptic vendor strings (e.g., "CHIK BRST 5#") to internal human-readable IDs in vendor_item_aliases.
- Hybrid Recipe Math Engine [ ]: PENDING. Implementation of the base_calculation_group flag to establish a 100% divisor. Must support Dual-Mode Scaling: Fixed Weight (savory) vs. Baker’s Percentage (baking/doughs).
- Substitution Intelligence [ ]: PENDING. Logic for ingredient ratios (e.g., fresh vs. instant yeast) and preparation adjustments.
- Live Cook Mode & Kitchen Encyclopedia [ ]: PENDING. Full-screen interface with haptic-ready timers, walkthrough steps, and an encyclopedia of bread shapes/proofing techniques.
- Vessel Awareness [ ]: PENDING. Scaling logic tied to tenant-defined equipment volumes (e.g., 12-quart Cambros or specific Pullman Pan sizes).

4. Engineering Standards & Refactor Audit

Technical debt and architectural compliance must align with the "Syntax and Heat" aesthetic and atomic file mandates.

1. Neon-Glass Design System [ ]: PENDING. Mandatory implementation of the high-glare design spec:

- Color Space: High-vibrancy OKLCH tokens. Primary Blue: oklch(0.60 0.25 250).
- Ambient Radiance: Dual-node background radiance (Top-left: blue-500/10; Bottom-right: cyan-500/5) with fixed 120px blur.
- Glassmorphism: .glass-panel utilities (bg-zinc-950/40, backdrop-blur-2xl, border-white/5).

2. Brand Identity Alignment [ ]: PENDING. Purge legacy culinary tropes (whisks/knives). Ensure the "Cloud and Chef Hat" logo is the sole brand symbol.
3. Atomic File Rule (150-Line Cap) [ ]: PENDING. Enforcement of strict 150-line limits on all TS/TSX files to ensure LLM context compatibility and modularity.
4. Data Fetching Refactor [ ]: PENDING. Move direct client-side/browser Supabase calls to Next.js 16 Server Components.
5. UI Component Centralization [ ]: PENDING. Relocate all UI code from apps/ skeletons to the zero-bundler @soustools/ui package.
6. RLS Enforcement Skill [ ]: PRIORITY PENDING. Update AI agent skills to explicitly grant permissions to authenticated and service_role roles in all table migrations.

7. Future Roadmap: Phase 2+ Execution

Strategic expansion into advanced financial and predictive operations.

- Financial Intelligence [ ]:
  - Three-Way Reconciliation Loop (PO vs. Invoice vs. Scanned Delivery) with amber-flagged price creep.
  - "Market Walk Mode": Mobile-optimized checklist with offline caching and "Vendor Wars" price comparison logic.
- Operations & Connectivity [ ]:
  - KDS Matrix: Real-time ticket aging and station routing with Wear OS haptic integrations for timers.
  - Alcohol & Beverage Matrix: Volumetric tracking (ml/oz-to-weight) with state excise tax decoupling from base costs.
- Predictive Orchestration [ ]:
  - Menu Engineering Profit Matrices: Star (Pierogi), Plowhorse (Brioche Buns), Puzzle (Chili), and Dog quadrant categorization.
  - Deadstock Mitigation: Predictive agents flagging slow-moving inventory for specials.
- External Integrations [ ]:
  - Direct delivery sync (Uber Eats, DoorDash) and financial sync (QuickBooks).
