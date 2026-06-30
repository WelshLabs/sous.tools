Product Vision & Roadmap: sous.tools

1. Executive Mission: Collapsing the Franken-Stack

The sous.tools platform is a unified Restaurant Operating System (OS) engineered to collapse the fragmented "Franken-stack" of modern hospitality technology. Modern operators are currently forced to manage a disconnected web of POS, inventory, recipe math, and procurement tools. This fragmentation creates visibility gaps that lead to margin erosion and operational friction.

By consolidating these functions into a single, high-performance intelligence layer, sous.tools moves beyond retroactive reporting. It functions as a proactive orchestration engine that reacts in real-time to vendor price creep and labor-to-sales drift.

The Three Pillars of Invisible Utility

- Real-time Profitability: Proactive orchestration that reacts instantly to vendor price fluctuations. It identifies labor-to-sales drift in real-time, protecting margins before the damage is done.
- Operational Resilience: An "Invisible yet Bulletproof" philosophy. High-contrast, "Neon-Glass" design ensures legibility in high-glare commercial kitchens, while offline-first engineering ensures the system never stops, even when the network does.
- Local-Mesh Reliability: The architecture mandates a local-mesh ecosystem powered by Raspberry Pi 5 nodes. This ensures functional parity in high-interference kitchen RF environments via a Delta-Action Log Architecture that journals mutations and utilizes Conflict-free Replicated Data Types (CRDTs) to resolve state conflicts chronologically.

2. Brand Identity: Syntax and Heat

The "Syntax and Heat" aesthetic represents the intersection of developer-centric precision and the high-intensity reality of the commercial kitchen. We explicitly reject legacy culinary tropes—rustic textures, literal whisks, and "hand-drawn" logos—in favor of high-scannability, technical interfaces.

Symbol Metaphors

- Active Logo Identity: The official identity is the combination of a Cloud and a Chef Hat (as found in the @soustools/ui package), symbolizing the union of cloud computing and culinary expertise.

Neon-Glass Technical Specification

The UI is engineered for high-glare environments using OKLCH tokens to ensure luminance-locked vibrancy regardless of display hardware quality.

Category Token / Specification Strategic Justification
Primary Color oklch(0.60 0.25 250) Vibrant Blue: High visibility for primary actions.
Light Background oklch(0.98 0.005 240) High-contrast readability for standard prep areas.
Dark Background oklch(0.12 0.02 240) Reduced glare for night service/low-light environments.
Glassmorphism .glass-panel bg-zinc-950/40, backdrop-blur-2xl; creates depth in complex layouts.
Ambient Radiance Dual-Node 120px Blur Top-left: blue-500/10; Bottom-right: cyan-500/5; Refraction depth.
Typography Inter, Outfit, Geist Mono Utility Sans, Brand Display, and Technical Data Precision.

3. Core Architecture and Infrastructure

The platform is built as a Turborepo monorepo to ensure shared logic and type safety across all service layers.

- Technology Stack: Next.js 16 (Vercel) for the frontend, NestJS (Render) for the API gateway, and Supabase (PostgreSQL + Realtime) for persistence.
- Multi-tenant Isolation: The system utilizes Supabase Auth with Organization-level logical isolation, enforced strictly via Row-Level Security (RLS) on all database tables.
- 3-Tier AI Engineering Pipeline:
  1. NotebookLM: Generates the "Context Brief" from Repomix-flattened codebase snapshots.
  2. Gemini: Acts as the strategic "Feature Lab" planning partner.
  3. Antigravity 2.0: Serves as the autonomous executor, operating under a strict 150-line file cap mandate for code atomicity and agent readability.
- Local Mesh Strategy: To mitigate kitchen Wi-Fi dead zones, Raspberry Pi 5 master nodes maintain a local Delta-Action Log. Deterministic vector timestamps ensure that when connectivity is restored, the global state is synchronized without manual intervention.

4. Phase 1: Dtown Cafe Beta Priorities

Rollout follows an "Eat Your Own Dog Food" mandate. Superadmin Conar Welsh (Dtown Cafe) will stabilize the system in a live, high-volume environment.

Generalized "Canvas" Editor & Signage

Signage is deployed on Raspberry Pi 5 using the Wayland/Labwc compositor. Browser windows carry custom titles (SignageDisplay1, SignageDisplay2) caught by rc.xml window rules to map specific outputs to HDMI-A-1/2.

- The Canvas Vision: The visual editor is a generalized design tool. While used for signage today (rendering "Breakfast Masterpieces" like the $10.00 Egg & Cheese Sandwich and $16/dz Scratch Pierogi), it will evolve into a website editor and a print designer for custom receipts, to-go box labels (with cooking instructions), and A4 marketing prints.
- Live Data: The editor must support real-time status updates (e.g., flagging "Sauerkraut & Bacon" Pierogi as SOLD OUT) via NestJS WebSockets.

Culinary Intelligence & Recipe Engine

The engine uses "Generalized Base-Ingredient Logic" to handle savory, baking, and beverage workflows.

- Math Engine: The base_calculation_group flag sums "base" ingredients (e.g., total flour) to establish the 100% divisor.
- Knowledge Base: Beyond scaling (Fixed vs. Baker’s %), the engine includes substitution intelligence (e.g., fresh vs. instant yeast ratios) and an encyclopedia of bread shapes for kitchen training.
- Vessel Awareness: Scaling logic is linked to tenant equipment (e.g., 12-quart Cambros or specific Pullman Pan volumes).

OCR Ingestion Pipeline

A Tesseract.js -> BullMQ -> LLM pipeline digitizes vendor invoices.

- Deterministic Translation Matrix: The system learns to map cryptic vendor strings (e.g., "CHIK BRST 5#") to internal IDs, storing these in vendor_item_aliases to automate future reconciliations.

5. Shadow POS & KDS Interoperability

To ensure zero downtime and build "Tenant Trust," sous.tools runs on top of legacy systems like Square. This allow operators to use our intelligence layers while their financial data remains secured by their existing provider.

Bidirectional Sync Engine

- Actor-Signature Loop Attenuation: To prevent infinite sync loops, every outgoing event carries a unique actor signature. Incoming webhooks that match the internal actor_id are automatically dropped.
- Mapping Layers: The pos_mappings table tracks internal vs. external IDs with idempotency timestamps.

KDS Matrix

The Kitchen Display System expansion focuses on real-time ticket aging, station routing, and the integration of Wear OS haptics for kitchen timers and station-specific notifications.

6. Phase 2+: Advanced Operational Modules

- Market Walk Mode: A mobile-optimized procurement checklist for manual shopping. It features strike-through logic, offline local caching, and price-comparison "Vendor Wars" to identify better price points between suppliers.
- Alcohol & Beverage Matrix: Volumetric tracking (ml/oz-to-weight translation) that decouples state excise taxes from base costs. It maps multiple cocktail recipes to a single master SKU bottle for accurate inventory drawdown.
- Financial Integration: The "Three-Way Reconciliation Loop" (PO vs. Invoice vs. Delivery) flags price creep in amber. Final stage includes bidirectional sync with QuickBooks, Uber Eats, and DoorDash.

7. Predictive Agents & Menu Engineering

The system categorizes all menu items into performance quadrants based on real-time COGS data and POS performance.

Menu Engineering Matrix

Category Performance Strategic Action Example
Stars High Profit / High Popularity Maintain quality; protect consistency. Scratch Pierogi
Plowhorses Low Profit / High Popularity Target for portion/price adjustment. Brioche Buns
Puzzles High Profit / Low Popularity Targets for marketing and promotion. Chili
Dogs Low Profit / Low Popularity Targets for menu removal. -

Predictive Agents utilize this data for deadstock mitigation, flagging slow-moving inventory and providing proactive margin protection against vendor price creep.

8. Engineering Quality & Refactor Roadmap

- Server-Side Mandate: All client-side Supabase fetching is being migrated to Next.js Server Components. Next.js apps function as routing/data-fetching skeletons; all UI code is centralized in @soustools/ui.
- Observability & Uptime: Centralized logging via Better Stack. Production NestJS instances are kept "warm" 24/7 using Better Stack uptime monitors hitting health-check routes to survive instance limits.
- Singleton Utilities:
  - SingletonLock: Redis-backed distributed locking to prevent ingestion race conditions.
  - SingletonSocket: Persistent WebSocket bridge for signage connectivity.
  - SingletonCookie: Unified client/server resolution.
- Database Integrity: Flattening migrations into a single ordered schema and mandatory RLS enforcement on all new tables to prevent production permission failures.
