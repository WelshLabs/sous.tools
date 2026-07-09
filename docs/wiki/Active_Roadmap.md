Active_Roadmap.md: Sprint - Glacier Anchor & Infrastructure Hardening

This roadmap serves as the architectural directive for stabilizing the core infrastructure, enforcing strict AI governance, and deploying the foundational identity for the "Dtown Cafe" launch. We are building for the "Saturday morning rush"—instability in high-heat environments is an operational failure.

1. Phase I: AI Governance & 'Glacier' Philosophy Anchor

The "Glacier" philosophy mandates that the project state is the immutable anchor. In a high-pressure kitchen environment, the system must be as reliable as a physical tool.

Update Agent Source of Truth Update .agents/AGENTS.md to define the Glacier philosophy. All agent operations must follow the Antigravity 2.0 3-tier workflow:

- Tier 1: Analysis & State Update: Analyze prompts against current context. Update .agents/AGENTS.md to reflect planned changes before any code is modified.
- Tier 2: Specialized Execution: Use defined skills and @soustools/ workspace conventions exclusively.
- Tier 3: Validation: Verify against engineering standards and update documentation tiers (Tenant, Dev, Internal) simultaneously.

Hard Prohibitions:

- FORBIDDEN: Creation or usage of GEMINI.md.
- FORBIDDEN: Activation of "Management Mode" or meta-cognitive loops.
- FORBIDDEN: Direct supabase-js calls in client components.

Skill Definition Refactor Audit and rewrite .agents/skills/ (migrations, supabase-client, nextjs-patterns) to enforce:

- Server-Side Supremacy: All data fetching must occur in Next.js Server Components or the NestJS API. Client-side calls are limited to real-time subscriptions.
- Library-First Development: Mandatory use of @soustools/ui. Components must be added to the library, never built locally in apps/app.
- Modular Logic: Enforce the "Skeletal App" pattern. apps/app and apps/api are orchestration layers; business logic must reside in @soustools/logic or @soustools/api-types.

Quality Enforcement Implementation Scaffold .agents/skills/quality-enforcement/SKILL.md to implement pre-commit style rules that flag "use client" components performing database mutations and validate UI exports against @soustools/ui/src/index.ts.

2. Phase II: Database Reset & Dtown Cafe Seeding

To resolve "dev-works, prod-fails" loops and migration debt, we require a clean-slate reset with hardened Row Level Security (RLS).

Triple-Environment Truncation Execute the following high-verbosity script across dev, staging, and production. Staging is ignored for parity; focus on Local -> Production consistency.

-- High-Verbosity Truncation Script
SET session_replication_role = 'replica';
DO $$
DECLARE r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
END LOOP;
END $$;
SET session_replication_role = 'origin';

Migration Flattening Consolidate the fragmented history (20260612000000 through 20260630000002) into supabase/migrations/00000000000000_init_schema.sql.

- Requirement: Define all GRANT and ALTER DEFAULT PRIVILEGES at the end of the file to prevent recurring permission errors.

Identity & Tenant Seeding Populate supabase/seed.sql with the foundational data for Dtown Cafe:

Table: public.organizations | Field | Value | | :--- | :--- | | Name | Dtown Cafe | | ID | gen_random_uuid() | | Slug | dtown-cafe | | Logo URL | cloud-chef-hat-logo.svg |

Table: public.profiles | Field | Value | | :--- | :--- | | ID | [CONAR_AUTH_ID] | | Email | conar@dtown.cafe | | Role | superadmin | | Org Context | (SELECT id FROM organizations WHERE slug = 'dtown-cafe') |

RLS Hardening

- Admin Scoping: Restrict admin schema and Users route to System Superadmins only.
- Organization Isolation: Apply RLS to all tenant tables (recipes, inventory, signage). All queries must include organization scoping.

3. Phase III: Next.js 16 Route Group Restructuring

The application directory must be restructured to support the "Skeleton App" pattern, separating data orchestration from UI presentation.

Directory Scaffolding Checklist

- [ ] apps/app/src/app/(pos): High-volume transactional service interface.
- [ ] apps/app/src/app/(kds): High-performance Kitchen Display System.
- [ ] apps/app/src/app/(team): Staff BYOD (Bring Your Own Device) application.
- [ ] apps/app/src/app/(fullscreen)/recipes/[id]/kitchen: Live Cook Mode.

Skeleton Pattern Enforcement These routes must contain zero UI logic. They function strictly as Server Component data orchestration layers, pulling from NestJS or Supabase and passing data to components in @soustools/ui. Business logic must be abstracted to @soustools/logic.

4. Phase IV: Advanced UI & AI Integration

The "Neon-Glass" system is designed for visibility in harsh kitchen lighting. We are extracting legacy assets to achieve pixel-perfect parity with established benchmarks.

Omni-bar Scaffolding Develop a Framer Motion-powered Omni-bar to serve as the primary system trigger.

- ReAct Loops: Acts as the entry point for Gemini 2.5 ReAct loops.
- Hardware Link: Must provide the UI bridge for "Voice Wastage" inputs received from WearOS.

Neon-Glass UI Extraction

- Visual Markers: High-contrast Dark UI with Cyan accents.
- Extraction: Identify legacy CSS variables and refactor into @soustools/ui/src/components/signage-glass.
- Constraint: Components must be presentation-only. Remove useEffect or useState data-fetching hooks; data must be passed via props from server-side renders.

Logo Standardization Update PrimaryLogo.tsx in @soustools/ui to support variant props for digital signage vs. POS headers, using the "Cloud + Chef Hat" asset exclusively.

5. Phase V: WearOS & Hardware Scaffolding

Professional kitchens require "Offline-First" resilience. If the internet fails, the line must keep moving.

WearOS Service & Voice Wastage

- Scaffold ComplicationDataSourceService on WearOS.
- NLP Commands: Enable staff to record wastage (e.g., "Dropped six burger buns") via voice.
- Ledger Integration: Voice inputs must trigger real-time updates to the inventory ledger and predictive margin engine.

Raspberry Pi 5 Wayland Config

- OS: Ubuntu Desktop 24.04 (64-bit) or Raspberry Pi OS (Bookworm).
- Compositor: Configure labwc for dedicated dual-head kiosk mode.
- Display: Force 1920x1080 resolution on HDMI-A-1 and HDMI-A-2.
- Signage Sync: Configure signage-sync.service to link with the NestJS SignageGateway (Websockets) for immediate git pulls upon content changes.

6. Phase VI: Sprint Validation & Success Metrics

The following criteria define the "Saturday Morning Ready" baseline.

Success Criteria for Sprint Completion

Phase Required Output Success Metric
Agent Governance Rewritten .agents/skills/ 0% client-side supabase-js usage in apps/app.
DB Infrastructure Consolidated init_schema.sql Zero RLS violations in logs; successful local-to-prod parity.
Identity Seeding Seeded Dtown Cafe Org & Profile conar@dtown.cafe successfully logs in with Superadmin flags.
Hardware Deployment Wayland RPi 5 Node Dual 1080p output without screen tearing; WebSocket-triggered sync.
UI Salvage Neon-Glass Components Pixel-perfect parity with Source Images 1 and 2; zero side effects.
Operational Launch Dtown Digital Cookbook "Live Cook Mode" scales "Famous Cinnamon Knots" correctly for 48 servings.
Recipe Ingestion OCR Validation Accurate ingestion of "Egg & Cheese Sandwich" with unit-based scaling.

[!CAUTION] HALT-ON-ERROR RULE: If any error occurs—including TypeScript errors, Database Migration failures, Runtime exceptions, or Playwright test failures—all execution must STOP IMMEDIATELY. Do not attempt circular corrections or automated guessing. Request manual intervention or local verification.
