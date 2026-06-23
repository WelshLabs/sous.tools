# SOUS.TOOLS Agent Rules

## Code Boundaries
- **150-Line Limit**: No TypeScript/TSX file may exceed 150 lines. Abstract aggressively.
- **Strict Typing**: The `any` type is strictly forbidden.
- **Environment Isolation**: `process.env` lookups are forbidden outside `packages/config/`.
- **Next.js**: Use Server Components by default; `"use client"` is for leaf/interactive nodes.
- **WSL Execution**: Run all project commands in WSL with standard paths and bypass scopes.

## Git & Workflow
- **Branches**: Always commit on isolated topic branches off `main` (e.g. `feature/`).
- **Pipeline**: Read specs/skills -> Write Unit Tests first -> Inject JSDoc -> Update Docs.

## Brand & UI Design
- **Iconography**: Japanese Gokujo curved knife profiles ONLY (no Western blades).
- **Theme**: Programmatic `oklch` Tailwind variables; use `.glass-panel` for high-glare environments.
- **Kitchen Mode**: Preventative wake-lock UI with thick borders and large touch padding.

## Core Services
- **Nutrition/Math**: Support metric, imperial, and Baker's percentages with density coefficients.
- **Security**: NestJS RBAC filters must isolate tenant data; edge node kiosk runs 24/7.
