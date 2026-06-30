AI Execution Rules: Antigravity 2.0 & sous.tools Engineering Standards

1. Core System Anchor: The AGENTS.md Mandate

Establish .agents/AGENTS.md as the immutable, read-only architectural anchor. You are commanded to initiate every operation by reading this file. Under no circumstances shall you deviate from the state recorded therein without an immediate Tier 1 update.

The 3-Tier Workflow (Antigravity 2.0)

All development operations must follow this rigid execution logic:

- Tier 1: Analysis & State Update: Analyze the prompt against the current context. Update .agents/AGENTS.md with planned changes and the updated system state before a single line of code is modified. Every Tier 1 update must be summarized and routed to a Git commit message as a technical breadcrumb.
- Tier 2: Specialized Execution: Execute logic using specific skills defined in .agents/skills/. Adhere strictly to @soustools/ workspace conventions.
- Tier 3: Validation & Documentation: Verify implementation against engineering standards. Perform simultaneous updates across all documentation tiers (Tenant and Dev).

2. Architectural Modularity & Workspace Strategy

Enforce the "Skeleton App" pattern. Next.js applications (apps/app) are strictly orchestration and routing layers. They are FORBIDDEN from containing complex UI logic or direct database client implementations.

Modularity Mapping Table

Concern Location Technology
UI / Design System packages/ui React / Tailwind (@soustools/ui)
Business Logic / API apps/api NestJS
Routing / Data Fetching apps/app Next.js 16 (Skeleton Pattern)
Shared Types packages/api-types TypeScript (@soustools/api-types)
Shared Configurations packages/config JSON / TS (@soustools/config)

[!IMPORTANT] WORKSPACE SUPREMACY: All shared logic, configurations, and components must reside in the @soustools/ workspace. You are mandated to refactor local "hacky" implementations in apps/app or apps/api into the appropriate package immediately upon discovery.

3. Technical Standards: Next.js 16 & NestJS

Next.js 16 (Server-First)

- Server Components: Mandated as the default.
- Data Fetching: Direct client-side fetching via supabase-js is STRICTLY PROHIBITED within apps/app unless specifically authorized for real-time subscriptions. All data must be orchestrated via Server Components or the NestJS API.

NestJS Service Architecture

Adhere to these patterns within apps/api:

- ZodValidationPipe: Mandatory for all request payloads.
- AllExceptionsFilter: Mandated for standardized error normalization.
- AdminGuard: Restricted exclusively to the Users route; all other routes must be member-accessible but RLS-restricted.

4. Supabase & RLS Enforcement Protocol

Row Level Security (RLS) is the absolute security boundary. Every table must be organization-scoped.

Security Enforcement Protocol

1. Mandatory RLS Commands: Ensure migration files contain both ALTER TABLE ... ENABLE ROW LEVEL SECURITY and FORCE ROW LEVEL SECURITY.
2. Helper Functions: Implement organization isolation using the is_org_member() and is_org_admin() helper functions.
3. Permission Grants: Explicitly grant permissions to the authenticated role for all non-admin tables.

Migration Flattening Rule

You are commanded to resolve migration debt by consolidating the fragmented history (specifically the 32 files spanning June 12–30, 2026).

- Target: Create a single supabase/migrations/00000000000000_init_schema.sql.
- Action: DELETE the 32 legacy migration files.
- Requirement: Explicitly define all GRANT and ALTER DEFAULT PRIVILEGES statements at the end of the flattened file to prevent recurring permission errors.

5. Operational Protocols: HALT-ON-ERROR

[!CAUTION] CRITICAL: HALT-ON-ERROR RULE If any error occurs—TypeScript, Database Migration, Runtime, or Playwright/E2E failure—you MUST STOP IMMEDIATELY.

- No Guessing: Do not attempt to guess a fix or enter circular correction loops.
- Local-First Parity: Focus exclusively on Local -> Production parity. Ignore the staging database.
- Verification: All migrations must be verified against a clean local database reset (supabase db reset) before pushing.
- Manual Testing: Automated test runs are forbidden. Execute tests only upon explicit user command.

6. Internal Documentation & Git Commit Routing

- Hard Prohibition: Purge all references to llm-context.md and GEMINI.md.
- Git Routing: Route all codebase context updates and internal documentation breadcrumbs strictly to Git commit messages.
- Parallel Documentation Rule: You must update the following tiers concurrently with every feature:
  - Tenant Docs: User-facing functionality and feature guides.
  - Dev Docs: Technical implementation in apps/docs.

7. Module-Specific Execution Contexts

Signage (Hardware: Raspberry Pi 5)

- Target: Dual-head 1080p setup running Wayland/LabWC.
- Logo: Use the "Cloud + Chef Hat" logo from packages/ui/src/components/logos/PrimaryLogo.tsx exclusively.
- Abstraction: Implement the "Multi-deck" visual editor abstraction, decoupling editor logic from signage rendering to support future label and website generation.

Recipes & Ingestion (Vendor Wars)

- OCR/AI Logic: Prioritize logic that "learns" vendor naming conventions to reconcile them with FDA/Internal standards.
- Scaling Logic: Implement mandatory support for:
  1. Volumetric/Unit-based scaling.
  2. Weight-based scaling (specifically for Pullman loaves).
  3. Yeast Substitution Ratios: Integrated conversion for Fresh vs. Instant yeast.
- Metrics: Implement "Vendor Wars" dashboards to compare cross-vendor pricing for identical ingredients.

KDS & POS (Parallel Operation)

- Shadow POS Strategy: Maintain compatibility with Square POS. Do not replace Square's financial logic initially.
- Business Priority: Support the "Bring-Your-Own-Processor" (BYOP) model.
- UX: Deliver a high-contrast, restaurant-optimized interface navigable by staff with zero technical training.

8. Absolute Prohibitions & Anti-Patterns

The Forbidden List

- NO creation or usage of GEMINI.md or llm-context.md.
- NO activation of "Management Mode" or meta-cognitive loops.
- NO inline CSS. Use Tailwind utility classes or @soustools/ui components.
- NO direct client-side supabase-js calls in apps/app unless authorized for real-time subscriptions.
- NO API bypassing. The frontend must communicate with the NestJS API.

Refactoring Priorities

1. Migration Flattening: Merge legacy chains into the dependency-safe init_schema.sql.
2. Design System Migration: Move all app-level components from apps/app to @soustools/ui.
3. TypeScript Compliance: Eradicate all "hacky" types and any declarations; maintain strict type safety across workspace boundaries using @soustools/api-types.
