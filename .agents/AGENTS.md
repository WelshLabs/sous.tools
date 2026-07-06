# Antigravity 2.0: Master Agent Anchor

## 1. Core Directives & "Glacier" Philosophy
This file is the absolute source of truth for all AI agent behavior. You are operating under the **"Glacier" Philosophy**: 97% of the system is a hyper-complex backend (Culinary Physics, OCR Ingestion, Predictive Inventory, 3-Tier Invoice Mapping) built to absorb the chaotic physics of culinary operations, while the 3% exposed to the user is an ultra-simple, "Zero-Ambiguity" interface.

**[!DANGER] Hard Prohibitions:**
*   **FORBIDDEN:** The creation or usage of `GEMINI.md`.
*   **FORBIDDEN:** The activation of "Management Mode" or any meta-cognitive loops.
*   **FORBIDDEN:** Client-side `supabase-js` database mutations within `apps/app`.
*   **FORBIDDEN:** Client-side Supabase data fetching inside `apps/app`. You must enforce "Server-Side Supremacy" (Next.js Server Components or NestJS API only).
*   **FORBIDDEN:** Hardcoding legacy Tailwind colors (like `slate-*`) or absolute z-indexes (like `z-40`). You MUST strictly use semantic CSS variables (e.g., `var(--z-overlay)`) and the "Midnight Slate" (`zinc-*`) palette defined in `@soustools/design-system`.
*   **DEPLOYMENT TARGET:** Oracle Cloud (ARM64) is our sole production deployment target, entirely replacing Render.com and Vercel.

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

## 6. Current Phase State
*   **Phase II (Database Reset)**: Complete.
*   **Phase II (Infrastructure Purge & Oracle Cloud Docker Parity)**: Complete.
*   **Phase IV (AI Dependency Injection)**: Complete.
*   **Phase IV (Culinary Brain CLI Pipeline)**: Complete.
*   **Phase IV (Playwright Auto-Scroller Hotfix)**: Complete.
*   **Phase IV (Playwright Persistent Auth Hotfix)**: Complete.
*   **Phase IV (Playwright Stealth Bypass Hotfix)**: Complete.
*   **Phase IV (Playwright Maximum Stealth Hotfix)**: Complete.
*   **Phase IV (Firefox Stealth Pivot Hotfix)**: Complete.
*   **Phase IV (Cookie Injection Bypass Hotfix)**: Complete.
*   **Phase IV (Consumer Chrome DRM Bypass Hotfix)**: Complete.
*   **Phase IV (CDP Host Hijacking / WSL2 Proxy)**: Complete.
*   **Phase IV (2-Pass Ingestion + Stable Diffusion API)**: Complete.
*   **Phase V (Polymorphic Schema Upgrade & Copyright Summarization)**: Complete.
*   **Phase VI (Captive Portal Handshake & Legacy Purge)**: Active - Transitioning to "Chef-Proof" Smart Device Setup Protocol, deprecating manual cloud-init provisioning.
*   **Phase VI (OAuth Device Authorization)**: Active - Scaffolding backend logic for pairing codes for WearOS and RPi devices.
*   **Phase VI (WearOS Dirty Hands Voice Trigger)**: Active - Implementing Jetpack Compose voice UI, SpeechRecognizer intent, and API Handshake. Configured BuildConfig for dynamic API_URL.
*   **Phase VI (Unified AI Triggers)**: Active - Unifying WearOS and Omni-bar AI triggers into a single context-aware POST /command NestJS endpoint in apps/api.
*   **Phase VI (Interactive Omni-bar Integration)**: Active - Wiring OmniBar and GlobalAppBar to be fully interactive and context-aware, including voice dictation and floating FAB triggers.
*   **Phase VI (WearOS Complications & Tiles)**: Active - Scaffolded MainComplicationService and KitchenCommandTileService/Activity.
*   **Phase VI (WearOS Metrics Mocking)**: Active - Scaffolding real API endpoints returning mock data for WearOS complications.
*   **Phase VI (WearOS Device Pairing)**: Active - Implementing production-ready OAuth Device Flow (Pairing Codes) using DataStore for secure JWT persistence.
*   **Phase VI (Device Pairing 404 Routing Hotfix)**: Complete - Resolved 404 NotFoundException for `/pair/confirm` by correctly prefixing the route to `/api/devices/pair/confirm` in frontend clients.
*   **Phase VI (Auth Header Hotfix)**: Complete - Resolved 401 UnauthorizedException by injecting the Supabase JWT token into the fetch request for `/api/devices/pair/confirm`.
*   **Phase VI (Light Mode Zero-Tolerance Hotfix)**: Complete - Enforced Frosted Glass variables in pos-simulator globals.css and aggressively purged hardcoded classes from item cards.
*   **Phase VI (Light Mode Prep Table Re-Architecture)**: Complete - Re-architected Light Mode variables to HSL values ("The Prep Table") and updated PosItemCard.tsx wrapper classes.
*   **Phase VI (Global Theme Re-Architecture & Overflow Hotfix)**: Complete - Rewrote design system Light Mode CSS variables to pure white/stainless steel, reverted Primary Blue, and fixed base layout overflow in SidebarLayout.
*   **Phase VI (Targeted UI Salvage)**: Complete - Aggressively purged hardcoded grey backgrounds, transparent blacks, and light text from apps/web inventory and admin route groups.
*   **Phase VI (Mass Extinction & Architectural Salvage)**: Complete - Executed global programmatic purge of legacy utility classes, fixed Next.js hydration errors in root layout, and resolved flexbox overflow bounds.
*   **Phase VI (Strict Semantic Theme Restoration)**: Complete - Restored HSL CSS variables, fixed true Neon Cyan brand color, and upgraded Card primitive to dynamic opacity glassmorphism.
*   **Phase VII (Route Reorganization)**: Active - Abolishing `(dashboard)`, establishing `(workspace)` and `(fullscreen)` route groups, and standardizing sidebars with `SidebarLayout`.
*   **Phase VII (API Architecture Refactor)**: Active - Extracting UI-coupled modules into true domain entities (e.g., `devices`, `commands`).
*   **Phase VIII (Universal Zod Schemas)**: Active - Establishing foundational Zod schemas for the 3-Tier Culinary Engine (recipes, ingredients, macros, allergens) prior to building ingestion pipelines.
*   **Phase IX (Kiosk OS & Self-Hosted Runner)**: Active - Configuring pi-gen for 64-bit unattended Raspberry Pi OS with labwc and Chromium, and setting up an Oracle Cloud self-hosted GitHub Actions runner for external repository release.
*   **Phase X (Infisical Universal Auth Migration)**: Active - Replacing deprecated Service Token with Universal Auth (Client ID/Secret) in GitHub Actions workflows.
*   **Phase X (Docker Engine Upgrade & CSS Reversion)**: Active - Upgrading Node to 24 in apps/api/Dockerfile, removing static platform flags, and reverting packages/design-system/index.css to its original HSL palette.
*   **Phase X (The Semantic Purge)**: Active - Purging all hardcoded utility classes (Tailwind colors/borders) globally in UI components and replacing them with semantic tokens.
*   **Phase X (Targeted Semantic Purge & UI Injection)**: Active - Fixing Light Mode contrast, injecting TwoToneHeader into domain routes, and targeted purging of border and background anti-patterns.
