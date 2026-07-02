# SOUS.TOOLS Agent Rules

> **Source of Truth**: This file is read FIRST on every session. No deviation is permitted without a Tier 1 update here.
> **Note on Updates**: The legacy 150-line limit rule has been completely purged from all agent instructions and skills to align with `AI_Execution_Rules.md`.

---

## 3-Tier AI Workflow (Antigravity 2.0)

All agent operations must follow this exact sequence:

1. **Tier 1 — Analysis & Architectural Anchor**: Analyze the prompt against the current context. Treat `.agents/AGENTS.md` as a **READ-ONLY** architectural anchor. Do NOT write state updates, transaction logs, or planned changes to this file unless explicitly commanded by the user to permanently update an agent skill.
2. **Tier 2 — Specialized Execution**: Execute logic using the specific skills defined in `.agents/skills/`. Use `@soustools/` workspace conventions exclusively.
3. **Tier 3 — Validation & Documentation**: Verify implementation against standards. Update Tenant Docs and Dev Docs simultaneously. Internal developer documentation must be handled strictly via highly descriptive Git commit messages.

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

- **Strict Typing**: The `any` type is strictly forbidden.
- **Environment Isolation**: `process.env` lookups are forbidden outside `packages/config/`.
- **Next.js**: Use Server Components by default; `"use client"` is for leaf/interactive nodes only.
- **Isomorphic Validation**: All API inputs, form submissions, and data payloads MUST use isomorphic Zod schemas shared between the Next.js frontend and the NestJS backend (via `ValidationPipe` / `ZodGuard`).
- **WSL Execution**: Run all project commands in WSL with standard paths and bypass scopes.

---

## Architecture — Skeleton App Pattern

| Concern                 | Location                    | Technology                                        |
| ----------------------- | --------------------------- | ------------------------------------------------- |
| UI / Design System      | `packages/design-system`    | React / Tailwind v4 (`@soustools/design-system`)  |
| Business Logic / API    | `apps/api`                  | NestJS                                            |
| Routing / Data Fetching | `apps/app`                  | Next.js 16 (Skeleton Pattern)                     |
| Shared Types / Logic    | `packages/api-types`        | TypeScript (`@soustools/api-types`)               |

All shared logic, configs, and UI components must reside in the `@soustools/` workspace. Local "hacky" implementations in `apps/app` or `apps/api` are subject to immediate refactoring.

---

## UI Authority — `@soustools/design-system` (Sole Source of Truth)

> [!IMPORTANT]
> **Architectural Shift (2026-07-01):** `@soustools/ui` (`packages/ui`) has been **deprecated** and superseded by `@soustools/design-system` (`packages/design-system`).

- **ONLY** `@soustools/design-system` may be imported for UI components, tokens, and CSS.
- `@soustools/ui` remains on disk but must NOT receive new components or be imported in new code.
- All future UI work — components, tokens, glassmorphism utilities — lives in `packages/design-system/`.
- The Neon-Glass color palette (sourced from `v2-snapshot.md` / `sous-theme.kdl`) is the canonical visual identity:
  - Primary Cyan: `#4cc9f0`
  - Background: `#0f172a` (slate-900)
  - Card Surface: `#1e293b` (slate-800)
  - Neon Pink Accent: `#f72585`
  - Destructive: `#f43f5e`
- Tailwind v4 `@theme` directives in `packages/design-system/index.css` define all semantic tokens.
- Button variants use shadcn-style naming: `"default"` (not `"primary"`).

---

## Git & Workflow

- **Branches**: Always commit on isolated topic branches off `main` (e.g. `feature/`).
- **Pipeline**: Read specs/skills → Write Unit Tests first → Inject JSDoc → Update Docs.
- **Testing**: Manual only. No automatic test invocation.

---

## Brand & UI Design

- **Iconography**: Japanese Gokujo curved knife profiles ONLY (no Western blades).
- **Theme**: Tailwind v4 `@theme` semantic tokens; use `.glass-panel` / `.st-glass-panel` for high-glare environments. All tokens live in `packages/design-system/index.css`.
- **Kitchen Mode**: Preventative wake-lock UI with thick borders and large touch padding (`min-h-[48px]` on buttons, `min-h-[56px]` for `.kitchen-touch` targets).
- **Logo**: Use "Cloud + Chef Hat" from `packages/design-system` exclusively.

---

## Core Services

- **Nutrition/Math**: Support metric, imperial, and Baker's percentages with density coefficients.
- **Security**: NestJS RBAC filters must isolate tenant data; edge node kiosk runs 24/7.
- **RLS**: Every table must be scoped to the organization. `authenticated` role must be explicitly granted on all non-admin tables.

---

## Concurrent Documentation Requirement (The Parallel Rule)

For every feature or refactor, the agent must simultaneously update:

- Tenant Docs: User-facing functionality and feature guides.
- Dev Docs: Technical implementation details in apps/docs.
- Internal Docs: Highly descriptive Git commit messages detailing the "why" and "how" of the changes. Do NOT write internal docs to markdown files.
