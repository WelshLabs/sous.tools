Active Roadmap: sous.tools [Immediate Sprints]

1. High-Level Mission & Aesthetic Constraints

Mission Synthesis: Syntax and Heat The objective is to collapse the hospitality "Franken-stack"—a fragmented graveyard of disconnected POS, inventory, and procurement tools—into a unified intelligence layer. We are not just building software; we are closing the visibility gaps and stopping the margin erosion caused by operational drift. This system provides proactive orchestration, identifying labor-to-sales drift and vendor price creep in real-time before the damage reaches the P&L.

Neon-Glass Design Mandates UI development must survive the high-glare, high-velocity environment of a commercial kitchen. All work must adhere to these tokens:

Neon-Glass Technical Specifications

- Color Space: High-vibrancy, luminance-locked OKLCH tokens to ensure vibrancy across inconsistent display hardware.
  - Primary (Vibrant Blue): oklch(0.60 0.25 250)
  - Background (Light): oklch(0.98 0.005 240)
  - Background (Dark): oklch(0.12 0.02 240)
- Ambient Radiance: Every layout requires dual-node refraction depth.
  - Top-Left: blue-500/10 | Bottom-Right: cyan-500/5 | Blur: 120px.
- Glassmorphism: .glass-panel utilities (bg-zinc-950/40, backdrop-blur-2xl, border-white/5).
- Typography: Strict scannability via Inter (Sans), Outfit (Brand), and Geist Mono (Technical Data).
- Logo Rule: The identity is the "Cloud and Chef Hat" hybrid. Legacy culinary tropes (whisks, knives, rustic textures) are strictly forbidden.

2. Priority 1: AI Agent Intelligence & Database Integrity

AI Skill Initialization Every new AI session must begin by injecting the following protocol into .agents/skills. This ensures the "Autonomous Executor" maintains architectural hygiene.

### AI EXECUTION PROTOCOL: SOUS.TOOLS

1. ATOMIC FILE RULE: Strictly enforce a 150-line cap on all TS/TSX files to maintain context-window precision.
2. 3-TIER HIERARCHY:
   - Tier 1: NotebookLM (Static Context Briefs)
   - Tier 2: Gemini (Feature Lab planning via GEMINI.md)
   - Tier 3: Antigravity 2.0 (Autonomous Executor)
3. ZERO-PROMPT TOOLING: Ensure write_file and git access are enabled via `~/.gemini/` configuration.
4. RLS MANDATE: Every table migration must include:
   - ALTER TABLE [name] ENABLE ROW LEVEL SECURITY;
   - GRANT ALL ON TABLE [name] TO authenticated, service_role;
   - Policy: (organization_id = auth.uid_org_id())

Database Flattening Protocol To eliminate production migration drift, the "Migration Purge" is initiated:

- [ ] Flatten: Collapse all current migrations into a single, ordered .sql file.
- [ ] Isolation: Ensure the /users admin route is restricted to the Superadmin tier (conar@dtown.cafe).
- [ ] Multi-tenancy: Validate that every query is logically isolated via organization_id.
- [ ] Cleanup: Permanently deprecate the staging database; focus entirely on production-grade data integrity.

3. Priority 2: Raspberry Pi 5 Hardware & Signage Deployment

Hardware Configuration Signage nodes are localized on Raspberry Pi 5 hardware for "Invisible yet Bulletproof" performance.

- Deployment: Docker + Watchtower for zero-touch updates.
- Persistence: Local heartbeats aggregated via Better Stack uptime monitors.

Window Management Strategy Wayland lacks coordinate-based window positioning. Therefore, we utilize title-based mapping in the Labwc compositor configuration (rc.xml):

- SignageDisplay1 -> HDMI-A-1
- SignageDisplay2 -> HDMI-A-2
- Trigger: Zero-latency refreshes via NestJS WebSockets on layout_updated events.

Visual Editor: The Generalized Canvas The signage editor is not just a menu tool; it is a Generalized Canvas designed for signage, then web, then print-labeling (labels for frozen meals). It must achieve pixel-perfect parity with Dtown Cafe mockups for:

- Breakfast Masterpieces: Egg & Cheese Sandwich on scratch brioche ($10.00).
- Soup of the Week: Chili (highlighting 8oz vs 12oz pricing parity).
- Frozen Take Home Dinners: Scratch Pierogi (Potato & Cheese, Sauerkraut & Bacon) and Chicken Pot Pie.

4. Priority 3: Recipe Engine Beta & Data Entry

Core Math & Substitution Intelligence Implement the "Generalized Base-Ingredient Logic" to unify savory and baking workflows:

- Base Divisor: Use the base_calculation_group flag. Sum weights of "base" ingredients (e.g., flour or base liquid) to establish the 100% divisor.
- Substitution Logic: Implement "Intelligence Ratios" for high-impact swaps (e.g., 1:0.33 ratio for fresh vs. instant yeast).

Data Entry Backlog [Dtown Cafe]

- Chili: Ensure 8oz and 12oz pricing points are mapped.
- Scratch Pierogi: Initialize varieties (Potato/Cheese, Sauerkraut/Bacon, Farmers Cheese).
- Egg & Cheese: Link to Brioche Bun sub-recipe requirements.

Kitchen Mode UI

- Live Cook Interface: Full-screen walkthroughs with haptic-ready timers.
- Vessel Awareness: Scaling logic linked to tenant equipment volumes (e.g., scaling a recipe to fit exactly three 12-quart Cambros or four Pullman Pans).

5. Essential Refactor & Hygiene Backlog

The Purge Protocol Engineering practices are now binary. Non-compliance results in immediate PR rejection.

Practice Forbidden Mandatory
Data Fetching Client-side Supabase calls Next.js 16 Server Components
UI Components Local code in apps/ Migration to @soustools/ui
Logging console.log @soustools/logger (Better Stack)
Logic Extraction Inline app logic @soustools/api-types / @soustools/utils
Config process.env in apps @soustools/config (Infisical)

Singleton Utility Audit Singletons from @soustools/utils must be used to prevent race conditions:

- SingletonLock: Redis-backed distributed locking for BullMQ ingestion pipelines.
- SingletonSocket: Persistent auto-reconnecting bridge for RPi signage.
- SingletonCookie: Unified client/server resolution.

6. Deployment & Resilience Checklist

Infrastructure Health

- Keep Warm: Better Stack monitors hitting NestJS health-check routes every 60s to bypass Render.com instance sleep limits.
- Centralized Observability: All server and browser logs must pipe through @soustools/logger.

Sync Integrity: "Sign-then-Drop" Protocol To prevent infinite sync loops with Square/Toast:

1. Every outgoing sync carries a unique actor_id.
2. Incoming webhooks are inspected.
3. Matching actor_id signatures are dropped immediately at the gateway.

Local Mesh Strategy For survival in kitchen Wi-Fi dead zones, use the Delta-Action Log architecture:

- Journal mutations (e.g., toggle_step) locally.
- Resolve state conflicts via CRDTs using deterministic vector timestamps upon reconnection to the mesh.
