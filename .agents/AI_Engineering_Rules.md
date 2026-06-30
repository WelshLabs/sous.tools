AI Engineering Rules: sous.tools Architecture & Orchestration

1. The 3-Tier AI Orchestration Workflow

Orchestration is a non-negotiable hierarchy engineered to maintain 1:1 alignment between architectural blueprints and code execution. Contextual drift is a failing offense.

1.1 Tier Hierarchy

1. Tier 1: NotebookLM (Static Anchor): Processes codebase snapshots generated via Repomix and PRDs to produce the Context Brief.
2. Tier 2: Gemini (Feature Lab): The strategic planning partner. Anchored by the root GEMINI.md, it validates all execution plans against the Context Brief.
3. Tier 3: Antigravity 2.0 Standalone (The Executor): Autonomous execution in "Management Mode." It orchestrates three specialized sub-agents:

- Agent A (Schema): Database migrations, RLS, and Type-Safety.
- Agent B (UI): Atomic components and Neon-Glass aesthetics.
- Agent C (API): NestJS controllers, DTOs, and Service logic.

1.2 Mandatory Initialization Rules

Every AI session MUST be initialized with the following checklist. Failure to anchor these files constitutes a session breach.

- [ ] Anchor .agents/AGENTS.md
- [ ] Anchor root GEMINI.md
- [ ] Verify "Management Mode" in ~/.gemini/ (Enable write_file and git tools; zero-prompt required).

  1.3 The First Task Rule

The absolute first action of any agent is updating .agents/skills. This reinforces RLS enforcement and codebase standards. If an agent generates feature code before this update, the session is considered Corrupted and must be reset immediately.

2. Mandatory Technical Stack & Infrastructure

No legacy overrides. No unauthorized state management.

Layer Component Platform / Tool
Frontend Next.js 16 Vercel
Backend NestJS Render.com
Persistence Supabase (PostgreSQL + Realtime) Supabase Cloud
Caching/Queuing Redis Cloud/Upstash + BullMQ Redis Cloud
Secrets Infisical (via @soustools/config) Infisical
Observability Better Stack (Logs & Uptime) Better Stack

Infrastructure Resilience

Production NestJS instances MUST be kept "warm" 24/7. Better Stack uptime monitors are mandated to hit health-check routes every 60 seconds to bypass Render.com instance sleeping.

3. Architectural Mandates & "Atomic" File Hygiene

3.1 The 150-Line Cap Rule

No TypeScript (.ts) or React (.tsx) file shall exceed 150 lines.

- The Why: This forces clean abstractions and ensures files remain within the LLM's optimal attention window, preventing "lazy coding" and agent hallucinations during partial rewrites.

  3.2 Data Fetching & NestJS Gateway

- Refactor Mandate: All data fetching MUST migrate to Next.js 16 Server Components.
- DEFERRED Status: Label existing client-side fetching as "DEFERRED."
- Browser Restriction: Direct Supabase calls from the browser are FORBIDDEN. All persistence must pass through the NestJS Gateway to ensure API-types/DTO enforcement.

  3.3 Singleton Pattern Enforcement

Utilize ONLY the standardized singletons from @soustools/utils:

- SingletonLock: Redis-backed distributed locking for BullMQ race-prevention.
- SingletonSocket: Auto-reconnecting bridge for real-time signage state.
- SingletonCookie: Unified resolution for client/server-side cookies.

4. Monorepo Hygiene & "The Purge" Protocol

4.1 UI Migration & Boundary Rules

The apps/ directory is for routing and data-fetching skeletons only.

- The Purge: Move all UI components from apps/ to @soustools/ui.
- Zero-Bundler Tailwind v4: @soustools/ui must remain a zero-bundler implementation. The introduction of postcss.config.js or Webpack overrides in this package is strictly FORBIDDEN.

  4.2 Shared Package Integrity

- @soustools/config: Sole provider for secrets (via Infisical). process.env calls outside this package are a failing offense.
- @soustools/api-types: Mandatory shared interfaces for all service boundaries.
- @soustools/logger: Unified logging via Better Stack.

5. Security, Multi-Tenancy, and RLS Boundaries

5.1 Logical Isolation & Superadmin Restriction

- Organization Scoping: Every database query MUST include an organization_id scope via Supabase RLS.
- Superadmin Tier: The /users admin route is EXCLUSIVELY reserved for Conar Welsh. No exceptions.

  5.2 Database Protocol

- Flattening: All existing migrations must be flattened into a single, properly ordered file to facilitate clean schema resets.
- Permission Skill: Every table migration MUST explicitly grant permissions to the authenticated and service_role roles.

  5.3 Loop Prevention Logic (Actor Signature)

To prevent infinite loops during bidirectional POS syncs (Square/Toast), implement the actor_id signature mechanism:

// Loop Prevention Enforcement
const internal_sync_actor_id = config.get('SYNC_ACTOR_ID');

if (incoming_webhook.actor_id === internal_sync_actor_id) {
logger.info('Internal sync detected. Dropping webhook to prevent loop.');
return drop_webhook();
}

6. Local Mesh & Hardware Orchestration

6.1 Raspberry Pi 5 & Connectivity

Local nodes run Docker/Watchtower for kitchen environments. Resilience is maintained via:

- Delta-Action Log: Journals individual mutations (e.g., toggle_step).
- CRDTs: Merges state chronologically using deterministic vector timestamps upon reconnection.

  6.2 Signage Output Mapping

Wayland/Labwc window management is used because Wayland lacks coordinate-based positioning.

- SignageDisplay1 maps to HDMI-A-1 via rc.xml.
- SignageDisplay2 maps to HDMI-A-2 via rc.xml.

7. Brand Identity: Syntax and Heat

7.1 Brand Metaphor Mapping

Use this table to ensure iconographic consistency across the OS:

Symbol Brand Metaphor Function
\_ (Prompt) Command & Logic Core OS (sous.app)
Cloche Service & Presentation Digital Signage (apps/signage)
Document Schema & Knowledge Documentation (sous.docs)
Chain Interconnectivity Integrations & POS Sync

7.2 Neon-Glass Aesthetic

- Logo: The only approved identity is the "Cloud and Chef Hat" hybrid found in packages/ui. Legcay culinary tropes (knives/whisks) are forbidden.
- Tokens (OKLCH):
  - Vibrant Blue: oklch(0.60 0.25 250)
  - Light BG: oklch(0.98 0.005 240)
  - Dark BG: oklch(0.12 0.02 240)
- Radiance: Mandatory dual-node radiance (Top-Left: blue-500/10, Bottom-Right: cyan-500/5) with 120px blur.
- UI Components: Apply .glass-panel utility (bg-zinc-950/40, backdrop-blur-2xl, border-white/5).
