# Antigravity 2.0: Master Agent Anchor

## 1. Core Directives & "Glacier" Philosophy
This file is the absolute source of truth for all AI agent behavior. You are operating under the **"Glacier" Philosophy**: 97% of the system is a hyper-complex backend (Culinary Physics, OCR Ingestion, Predictive Inventory, 3-Tier Invoice Mapping) built to absorb the chaotic physics of culinary operations, while the 3% exposed to the user is an ultra-simple, "Zero-Ambiguity" interface.

**[!DANGER] Hard Prohibitions:**
*   **FORBIDDEN:** The creation or usage of `GEMINI.md`.
*   **FORBIDDEN:** The activation of "Management Mode" or any meta-cognitive loops.
*   **FORBIDDEN:** Client-side `supabase-js` database mutations within `apps/app`.

## 2. The Mandatory 3-Tier Workflow
Execute this sequence for every single task, without exception:
1.  **Tier 1: Analysis & State Update:** Analyze the prompt. Update this `.agents/AGENTS.md` file to reflect planned changes *before* modifying application code.
2.  **Tier 2: Specialized Execution:** Execute logic strictly using defined skills in `.agents/skills/`. Adhere exclusively to `@soustools/` workspace conventions.
3.  **Tier 3: Validation & Documentation:** Verify implementation against engineering standards. Update Tenant, Dev, and Internal docs simultaneously (The Parallel Rule).

## 3. Engineering & Architecture Standards (The Skeleton App)
*   **Server-Side Supremacy:** Next.js (`apps/app`) functions *strictly* as a routing and data orchestration layer. Server Components are the default. Client-side data fetching is heavily restricted; use NestJS (`apps/api`) for business logic and GraphQL/REST endpoints.
*   **UI Modularity:** All UI presentation logic must utilize the `@soustools/ui` or specialized domain packages (e.g., `packages/domain-recipes`). Local UI implementations inside `apps/app` are "hacky" and strictly forbidden.
*   **Neon-Glass UI:** Implement high-contrast Dark UI with Cyan (`#00FFFF`) accents for high-heat, high-light kitchen environments. Maximize Progressive Disclosure using Framer Motion. 
*   **RLS Boundaries:** Every database table must be scoped to an `organization_id`. The admin schema and `/users` route are strictly restricted to System Superadmins.

## 4. Omni-Bar ReAct Execution & Culinary Physics
When the user issues a command via the Omni-bar or WearOS (e.g., "Record wastage: dropped one dozen eggs"), the agent must execute a Gemini ReAct Loop:
*   **Thought:** [Reasoning about the culinary physics or technical intent, such as Vendor Wars pricing or Baker's Math scaling]
*   **Action:** [Specific NestJS API tool invocation or data mutation]
*   **Observation:** [Result of the action, continuing until final response]

## 5. Operational Protocols & Safety
**[!IMPORTANT] CRITICAL: HALT-ON-ERROR RULE** 
Operational stability in a kitchen takes precedence over feature velocity. If a TypeScript, Database Migration, Runtime, or Playwright E2E error occurs, the agent MUST STOP IMMEDIATELY. Circular correction loops or automated guessing are forbidden. You must request manual intervention.
