# SOUS.TOOLS Agent Rules
> **Source of Truth**: This file is read FIRST on every session. No deviation is permitted without a Tier 1 update here.

---

## 3-Tier AI Workflow (Antigravity 2.0)

All agent operations must follow this exact sequence:

1. **Tier 1 — Analysis & State Update**: Analyze the prompt against current context. Update this file (`.agents/AGENTS.md`) to reflect planned changes and updated state *before* touching any source code.
2. **Tier 2 — Specialized Execution**: Execute logic using the specific skills defined in `.agents/skills/`. Use `@soustools/` workspace conventions exclusively.
3. **Tier 3 — Validation & Documentation**: Verify implementation against standards and update all documentation tiers simultaneously (tenant docs, dev docs, internal docs).

---

## Hard Prohibitions

> [!CAUTION]
> These rules are absolute and may not be overridden under any circumstance.

- **FORBIDDEN**: Creation or usage of `GEMINI.md` in any directory.
- **FORBIDDEN**: Activation of "Management Mode" or any similar meta-cognitive loop.
- **FORBIDDEN**: The `any` TypeScript type anywhere in the workspace.
- **FORBIDDEN**: `process.env` lookups outside `packages/config/`.
- **FORBIDDEN**: Direct client-side `supabase-js` calls in `apps/app` (except authorized real-time subscriptions).
- **FORBIDDEN**: UI logic or direct database clients inside `apps/app` — it is a routing/orchestration layer only.
- **FORBIDDEN**: Automatic test runs. Tests execute only on explicit user command or to debug a remote push failure.

---

## HALT-ON-ERROR Rule

> [!CAUTION]
> **CRITICAL — NO CIRCULAR CORRECTION LOOPS**
>
> If **any** error occurs — TypeScript compilation, database migration, runtime crash, or Playwright/E2E test failure — the agent **MUST STOP IMMEDIATELY**. Do **not** guess at a fix or enter a correction loop. Surface the error verbatim and request user intervention or local verification before proceeding.

---

## Code Boundaries

- **150-Line Limit**: No TypeScript/TSX file may exceed 150 lines. Abstract aggressively.
- **Strict Typing**: The `any` type is strictly forbidden.
- **Environment Isolation**: `process.env` lookups are forbidden outside `packages/config/`.
- **Next.js**: Use Server Components by default; `"use client"` is for leaf/interactive nodes only.
- **Isomorphic Validation**: All API inputs, form submissions, and data payloads MUST use isomorphic Zod schemas shared between the Next.js frontend and the NestJS backend (via `ValidationPipe` / `ZodGuard`).
- **WSL Execution**: Run all project commands in WSL with standard paths and bypass scopes.

---

## Architecture — Skeleton App Pattern

| Concern | Location | Technology |
|---|---|---|
| UI / Design System | `packages/ui` | React / Tailwind (`@soustools/ui`) |
| Business Logic / API | `apps/api` | NestJS |
| Routing / Data Fetching | `apps/app` | Next.js 16 (Skeleton Pattern) |
| Shared Types / Logic | `packages/api-types` | TypeScript (`@soustools/api-types`) |

All shared logic, configs, and UI components must reside in the `@soustools/` workspace. Local "hacky" implementations in `apps/app` or `apps/api` are subject to immediate refactoring.

---

## Git & Workflow

- **Branches**: Always commit on isolated topic branches off `main` (e.g. `feature/`).
- **Pipeline**: Read specs/skills → Write Unit Tests first → Inject JSDoc → Update Docs.
- **Testing**: Manual only. No automatic test invocation.

---

## Brand & UI Design

- **Iconography**: Japanese Gokujo curved knife profiles ONLY (no Western blades).
- **Theme**: Programmatic `oklch` Tailwind variables; use `.glass-panel` for high-glare environments.
- **Kitchen Mode**: Preventative wake-lock UI with thick borders and large touch padding.
- **Logo**: Use "Cloud + Chef Hat" from `packages/ui` exclusively.

---

## Core Services

- **Nutrition/Math**: Support metric, imperial, and Baker's percentages with density coefficients.
- **Security**: NestJS RBAC filters must isolate tenant data; edge node kiosk runs 24/7.
- **RLS**: Every table must be scoped to the organization. `authenticated` role must be explicitly granted on all non-admin tables.

---

## Concurrent Documentation Requirement (The Parallel Rule)

For every feature or refactor, simultaneously update:

- **Tenant Docs** — user-facing functionality and feature guides.
- **Dev Docs** — technical implementation details in `apps/docs`.
- **Internal Docs** — codebase context updates within `.agents/` or `llm-context.md`.
