AI Execution Rules: Antigravity 2.0 & sous.tools Engineering Standards

1. Core System Anchor and Workflow

The .agents/AGENTS.md file is the absolute source of truth for agent behavior and project state. All operations must begin by reading this file. Under no circumstances is the agent to deviate from the state recorded therein without an immediate Tier 1 update.

3-tier Workflow (Antigravity 2.0 Standalone Logic)

1. Tier 1: Analysis & State Update: Analyze the prompt against current context. Update .agents/AGENTS.md to reflect planned changes and updated state before touching code.
2. Tier 2: Specialized Execution: Execute logic using the specific skills defined in .agents/skills/. Use @soustools/ workspace conventions exclusively.
3. Tier 3: Validation & Documentation: Verify implementation against standards and update all documentation tiers simultaneously.

Hard Prohibitions:

- FORBIDDEN: Creation or usage of GEMINI.md.
- FORBIDDEN: Activation of "Management Mode" or similar meta-cognitive loops.

2. Architectural Modularity & Package Strategy

The system architecture follows a strict "Skeleton App" pattern. Next.js applications are FORBIDDEN from containing UI logic or direct database client implementations. They function strictly as routing and Server Component data orchestration layers.

Industry Standard Modularity

Concern Location Technology
UI / Design System packages/ui React / Tailwind (@soustools/ui)
Business Logic / API apps/api NestJS
Routing / Data Fetching apps/app Next.js 16 (Skeleton Pattern)
Shared Types / Logic packages/api-types TypeScript (@soustools/api-types)

Constraint: All shared logic, configurations, and UI components must reside in the @soustools/ workspace. Local "hacky" implementations in apps/app or apps/api are subject to immediate refactoring.

3. Next.js 16 & NestJS Technical Standards

Next.js 16 (Server-First)

- Server Components: Mandated by default.
- Data Fetching: Direct client-side fetching to Supabase is STRICTLY PROHIBITED. All data must be fetched via Server Components or the NestJS API.

NestJS (Service Architecture)

Adhere to the established patterns in apps/api:

- Guards: AdminGuard is reserved ONLY for the Users route.
- Pipes: Mandatory ZodValidationPipe for all request payloads.
- Filters: AllExceptionsFilter must be applied to maintain standardized error responses.

Supabase & RLS Enforcement

Row Level Security (RLS) is the primary security boundary. Every table must be scoped to the organization.

1. Verify migration files for ALTER TABLE ... ENABLE ROW LEVEL SECURITY.
2. Grant specific permissions to the authenticated role for all non-admin tables.
3. Ensure all queries include organization scoping. Note: The "Users" route is the only Admin-only exception; all other routes must be member-accessible but RLS-restricted.

4. Operational Protocols & Error Handling

[!CAUTION] CRITICAL: HALT-ON-ERROR RULE If any error occurs—TypeScript, Database Migration, Runtime, or Playwright/E2E test failure—the agent MUST STOP IMMEDIATELY. Do not attempt to guess or enter a circular correction loop. Request user intervention or local verification.

Testing & Deployment Parity

- Local Verification: All migrations must be verified against a clean local database reset before pushing.
- Staging Policy: Ignore the staging database. Focus exclusively on Local -> Production parity to resolve "works in dev, fails in prod" discrepancies.
- Manual Testing: Automatic test runs are forbidden. Execute tests only upon explicit user command or to debug a remote push failure.

5. Concurrent Documentation Requirements (The Parallel Rule)

For every feature or refactor, the agent must simultaneously update:

- Tenant Docs: User-facing functionality and feature guides.
- Dev Docs: Technical implementation details in apps/docs.
- Internal Docs: Codebase context updates within .agents/ or llm-context.md.

6. Module-Specific Execution Context

Signage (Hardware Target: Raspberry Pi 5)

- Hardware Constraints: Target display is a dual-head 1080p TV setup. CSS and performance logic must be optimized for Raspberry Pi hardware.
- Architecture: Implement a "Multi-deck" system (Slide Decks/Screen 2). The visual editor must be abstracted from the signage logic to support future website editing and label making.
- Branding: Use the "Cloud + Chef Hat" logo from packages/ui exclusively.

Recipes / Ingestion (Vendor Wars)

- AI/OCR Logic: Prioritize logic that "learns" vendor naming conventions over time. Minimize chef manual input by reconciling vendor names to standardized FDA/Internal naming.
- Scaling Logic: Include specific handling for bread shapes (Pullman loaves, burger buns) and yeast ratios (fresh vs. instant yeast conversion).
- Business Intelligence: Implement "Vendor Wars" metrics—comparing pricing between vendors for the same ingredient to identify cost-saving opportunities.

KDS & POS (Parallel Operation)

- Square Compatibility: The system must run alongside existing Square POS systems. Do not replace Square's money-handling logic until the final phase.
- Goal: Provide a restaurant-optimized interface that tech-illiterate chefs can navigate without training.

7. Code Quality & Refactoring Guardrails

Anti-Patterns to Eliminate

- API Bypassing: Bypassing the NestJS API for direct Supabase client calls in the frontend.
- Inline Styles: Using inline CSS instead of @soustools/ui components and Tailwind utility classes.
- Fragmented Migrations: "Messy" or broken migration chains.

Refactoring Priorities

- Migration Flattening: When requested, flatten all database migrations into a single, properly ordered schema to resolve persistent permission errors.
- Logic Abstraction: Extract UI logic from apps/app and relocate it to @soustools/ui.
- Typescript Compliance: Resolve all "hacky" types; maintain strict Type safety across the workspace boundary.
