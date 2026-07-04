AI Execution Rules: Antigravity 2.0 & sous.tools Engineering Standards

1. Core System Anchor: Antigravity 2.0

The .agents/AGENTS.md file is the absolute source of truth for all agent behavior and system state. All operations must begin by reading this file. Agents are forbidden from deviating from the state recorded in this document without an immediate Tier 1 update.

The Mandatory 3-Tier Workflow Execute this sequence for every task without exception:

1. Tier 1: Analysis & State Update

- Analyze the prompt against the current system context.
- Update .agents/AGENTS.md to reflect planned changes and updated state before modifying any code.

2. Tier 2: Specialized Execution

- Execute logic using defined skills in .agents/skills/.
- Adhere exclusively to @soustools/ workspace conventions.

3. Tier 3: Validation & Documentation

- Verify the implementation against established engineering standards.
- Perform simultaneous documentation updates across all tiers.

[!DANGER] Hard Prohibitions

- FORBIDDEN: The creation or usage of GEMINI.md.
- FORBIDDEN: The activation of "Management Mode" or any meta-cognitive loops.

2. UI Philosophy: The 'Glacier' Design System

The "Glacier" philosophy dictates an architecture of "cold, hard utility," where the "Neon-Glass" visual identity serves as the implementation skin.

Design Principles

- Zero-Ambiguity Interfaces: Implement high-contrast Dark UI with Cyan accents. All information must be binary and clear to ensure visibility in high-heat, high-light kitchen environments.
- Hardware Optimization: CSS must be optimized for Raspberry Pi 5 hardware. Minimize layout thrashing for stable dual-head 1080p output.
- Progressive Disclosure: Use Framer Motion for tiered information reveal to manage cognitive load.
- Component Source: Mandate use of @soustools/ui. Local UI implementations in apps/app are "hacky" and subject to immediate refactoring.
- Logo Protocol: Use the "Cloud + Chef Hat" logo (cloud-chef-hat-logo.svg) exclusively from the @soustools/ui package.

3. AI Logic & Omni-bar Execution

AI interactions must bridge the gap between technical execution and "Culinary Physics" logic.

COMMAND: Initialize Gemini ReAct Loop When executing complex Omni-bar intents, the agent must follow this loop structure:

Thought: [Reasoning about the user's culinary or technical intent]
Action: [Specific tool invocation or code modification]
Observation: [Result of the action, e.g., TypeScript error or successful data fetch]
... (Repeat until final response)

Culinary Physics Logic Requirements

- 3-Tier Governance Enforcement:
  1. Global/FDA: Standardized nutritional and ingredient data.
  2. Organization: Tenant-wide operational rules (e.g., Dtown Cafe standards).
  3. Local: Site-specific overrides.
- Vendor Wars Logic: Compare pricing across vendors for the same ingredient to identify cost-saving paths.
- Voice Wastage Integration: Support WearOS NLP commands to record physical loss (e.g., "Dropped a dozen eggs") into the real-time inventory ledger.
- Bread Encyclopedia: Apply scaling logic for specific shapes (Pullman loaves vs. burger buns) and yeast conversion ratios (Fresh vs. Instant).

4. Architectural Modularity: The 'Skeleton App' Pattern

Enforce strict separation of concerns. Next.js applications function solely as routing and orchestration layers.

Concern Location / Technology
UI / Design System packages/ui (React/Tailwind/Framer Motion)
Business Logic / API apps/api (NestJS)
Routing / Data Fetching apps/app (Next.js 16 Server Components)
Shared Types @soustools/api-types (TypeScript)

Mandate: Next.js applications are FORBIDDEN from containing direct database client implementations or complex UI logic. Local implementations are subject to immediate extraction into the @soustools/ workspace.

5. Technical Standards: Data Fetching & Security

"Server-Side Supremacy" and Row Level Security (RLS) are non-negotiable.

- COMMAND: Enforce Server-Side Supremacy. Prohibit all client-side fetching to Supabase within apps/app. Use Server Components by default. supabase-js is authorized on the client only for real-time WebSocket subscriptions.
- COMMAND: Mandate RLS Organization Scoping. Every table must be scoped to an organization_id.
  - Verify ALTER TABLE ... ENABLE ROW LEVEL SECURITY in all migrations.
  - The Users route is the only Admin-only exception; all other routes must be member-accessible but RLS-restricted.
- COMMAND: Standardize NestJS Patterns. Use ZodValidationPipe for all request payloads and AllExceptionsFilter for standardized error responses.
- COMMAND: Limit Admin Access. Restrict AdminGuard and the admin schema strictly to the Users table and System Superadmins.

6. Operational Protocols & Error Handling

Operational stability takes precedence over feature velocity.

[!IMPORTANT] CRITICAL: HALT-ON-ERROR RULE If a TypeScript, Migration, Runtime, or Test error occurs, the agent MUST STOP IMMEDIATELY. Circular correction loops are forbidden. Request manual intervention.

Triple-Environment Truncation Protocol To resolve migration debt and ensure a clean state, execute this high-verbosity script:

SET session_replication_role = 'replica';
DO $$
DECLARE r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
END LOOP;
END $$;
SET session_replication_role = 'origin';

Deployment Standards

- Migration Flattening: Consolidate history into supabase/migrations/00000000000000_init_schema.sql. All GRANT and ALTER DEFAULT PRIVILEGES must be at the end.
- Hardware Target: Raspberry Pi 5 dual-head 1080p. Use the labwc Wayland compositor for kiosk mode.

7. Concurrent Documentation (The Parallel Rule)

No code change is complete until the following task list is satisfied:

- [ ] Tenant Docs: Update user-facing features, guides, and "Live Cook Mode" instructions.
- [ ] Dev Docs: Document technical implementations in apps/docs.
- [ ] Internal Docs: Update codebase context in .agents/ or llm-context.md.

8. Anti-Patterns & Refactoring Guardrails

Eradicate legacy logic and "hacky" workarounds systematically.

Anti-Patterns Checklist

- [ ] API Bypassing: Direct Supabase calls from the frontend instead of the NestJS API.
- [ ] Inline Styles: Local CSS/Tailwind instead of @soustools/ui components.
- [ ] Fragmented Migrations: Messy migration chains instead of flattened schemas.
- [ ] Hacky Types: Usage of any or imprecise types across workspace boundaries.

UI Salvage Workflow

1. Extract UI logic from apps/app to @soustools/ui.
2. Mandate: Refactored components must be presentation-only.
3. Mandate: Strip all internal useEffect or useState hooks handling data fetching. Data must be passed via props from server-side renders.
   AI Execution Rules: Antigravity 2.0 & sous.tools Engineering Standards

4. Core System Anchor: Antigravity 2.0

The .agents/AGENTS.md file is the absolute source of truth for all agent behavior and system state. All operations must begin by reading this file. Agents are forbidden from deviating from the state recorded in this document without an immediate Tier 1 update.

The Mandatory 3-Tier Workflow Execute this sequence for every task without exception:

1. Tier 1: Analysis & State Update

- Analyze the prompt against the current system context.
- Update .agents/AGENTS.md to reflect planned changes and updated state before modifying any code.

2. Tier 2: Specialized Execution

- Execute logic using defined skills in .agents/skills/.
- Adhere exclusively to @soustools/ workspace conventions.

3. Tier 3: Validation & Documentation

- Verify the implementation against established engineering standards.
- Perform simultaneous documentation updates across all tiers.

[!DANGER] Hard Prohibitions

- FORBIDDEN: The creation or usage of GEMINI.md.
- FORBIDDEN: The activation of "Management Mode" or any meta-cognitive loops.

2. UI Philosophy: The 'Glacier' Design System

The "Glacier" philosophy dictates an architecture of "cold, hard utility," where the "Neon-Glass" visual identity serves as the implementation skin.

Design Principles

- Zero-Ambiguity Interfaces: Implement high-contrast Dark UI with Cyan accents. All information must be binary and clear to ensure visibility in high-heat, high-light kitchen environments.
- Hardware Optimization: CSS must be optimized for Raspberry Pi 5 hardware. Minimize layout thrashing for stable dual-head 1080p output.
- Progressive Disclosure: Use Framer Motion for tiered information reveal to manage cognitive load.
- Component Source: Mandate use of @soustools/ui. Local UI implementations in apps/app are "hacky" and subject to immediate refactoring.
- Logo Protocol: Use the "Cloud + Chef Hat" logo (cloud-chef-hat-logo.svg) exclusively from the @soustools/ui package.

3. AI Logic & Omni-bar Execution

AI interactions must bridge the gap between technical execution and "Culinary Physics" logic.

COMMAND: Initialize Gemini ReAct Loop When executing complex Omni-bar intents, the agent must follow this loop structure:

Thought: [Reasoning about the user's culinary or technical intent]
Action: [Specific tool invocation or code modification]
Observation: [Result of the action, e.g., TypeScript error or successful data fetch]
... (Repeat until final response)

Culinary Physics Logic Requirements

- 3-Tier Governance Enforcement:
  1. Global/FDA: Standardized nutritional and ingredient data.
  2. Organization: Tenant-wide operational rules (e.g., Dtown Cafe standards).
  3. Local: Site-specific overrides.
- Vendor Wars Logic: Compare pricing across vendors for the same ingredient to identify cost-saving paths.
- Voice Wastage Integration: Support WearOS NLP commands to record physical loss (e.g., "Dropped a dozen eggs") into the real-time inventory ledger.
- Bread Encyclopedia: Apply scaling logic for specific shapes (Pullman loaves vs. burger buns) and yeast conversion ratios (Fresh vs. Instant).

4. Architectural Modularity: The 'Skeleton App' Pattern

Enforce strict separation of concerns. Next.js applications function solely as routing and orchestration layers.

Concern Location / Technology
UI / Design System packages/ui (React/Tailwind/Framer Motion)
Business Logic / API apps/api (NestJS)
Routing / Data Fetching apps/app (Next.js 16 Server Components)
Shared Types @soustools/api-types (TypeScript)

Mandate: Next.js applications are FORBIDDEN from containing direct database client implementations or complex UI logic. Local implementations are subject to immediate extraction into the @soustools/ workspace.

5. Technical Standards: Data Fetching & Security

"Server-Side Supremacy" and Row Level Security (RLS) are non-negotiable.

- COMMAND: Enforce Server-Side Supremacy. Prohibit all client-side fetching to Supabase within apps/app. Use Server Components by default. supabase-js is authorized on the client only for real-time WebSocket subscriptions.
- COMMAND: Mandate RLS Organization Scoping. Every table must be scoped to an organization_id.
  - Verify ALTER TABLE ... ENABLE ROW LEVEL SECURITY in all migrations.
  - The Users route is the only Admin-only exception; all other routes must be member-accessible but RLS-restricted.
- COMMAND: Standardize NestJS Patterns. Use ZodValidationPipe for all request payloads and AllExceptionsFilter for standardized error responses.
- COMMAND: Limit Admin Access. Restrict AdminGuard and the admin schema strictly to the Users table and System Superadmins.

6. Operational Protocols & Error Handling

Operational stability takes precedence over feature velocity.

[!IMPORTANT] CRITICAL: HALT-ON-ERROR RULE If a TypeScript, Migration, Runtime, or Test error occurs, the agent MUST STOP IMMEDIATELY. Circular correction loops are forbidden. Request manual intervention.

Triple-Environment Truncation Protocol To resolve migration debt and ensure a clean state, execute this high-verbosity script:

SET session_replication_role = 'replica';
DO $$
DECLARE r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
END LOOP;
END $$;
SET session_replication_role = 'origin';

Deployment Standards

- Migration Flattening: Consolidate history into supabase/migrations/00000000000000_init_schema.sql. All GRANT and ALTER DEFAULT PRIVILEGES must be at the end.
- Hardware Target: Raspberry Pi 5 dual-head 1080p. Use the labwc Wayland compositor for kiosk mode.

7. Concurrent Documentation (The Parallel Rule)

No code change is complete until the following task list is satisfied:

- [ ] Tenant Docs: Update user-facing features, guides, and "Live Cook Mode" instructions.
- [ ] Dev Docs: Document technical implementations in apps/docs.
- [ ] Internal Docs: Update codebase context in .agents/ or llm-context.md.

8. Anti-Patterns & Refactoring Guardrails

Eradicate legacy logic and "hacky" workarounds systematically.

Anti-Patterns Checklist

- [ ] API Bypassing: Direct Supabase calls from the frontend instead of the NestJS API.
- [ ] Inline Styles: Local CSS/Tailwind instead of @soustools/ui components.
- [ ] Fragmented Migrations: Messy migration chains instead of flattened schemas.
- [ ] Hacky Types: Usage of any or imprecise types across workspace boundaries.

UI Salvage Workflow

1. Extract UI logic from apps/app to @soustools/ui.
2. Mandate: Refactored components must be presentation-only.
3. Mandate: Strip all internal useEffect or useState hooks handling data fetching. Data must be passed via props from server-side renders.
