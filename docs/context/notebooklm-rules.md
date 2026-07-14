# sous.tools AI System Rules

# Antigravity/Cursor Architectural Rules


## 1. Domain-Driven Design (DDD) & Infrastructure

- **Strict Boundaries:** Next.js apps (`apps/*`) and domain packages (`packages/domain-*`) are strictly forbidden from importing anything from `packages/infrastructure`. This is physically enforced by `eslint-plugin-boundaries`.
- **API First & Network Fetching:** ALL network requests must go exclusively through our unified `packages/api-client`. Native `fetch()`, `axios`, or direct endpoint calls outside of `api-client` are strictly forbidden.
- **Server-Side Supremacy:** Next.js functions strictly as a routing and data orchestration layer. Server Components are the default. Client-side Supabase data fetching inside `apps/*` is forbidden.
- **Config Lockdown:** `process.env` is strictly forbidden outside of `@soustools/config` (enforced via `no-restricted-imports`). All apps must import the type-safe, validated `config` object.
- **Secrets SSOT:** Infisical is the Single Source of Truth for all environment variables. Agents must NEVER hardcode secrets or instruct the creation of environment variables in GitHub, Vercel, or Docker. Environments should only hold the credentials needed to access Infisical.
- **TSConfig Management:** All `tsconfig.json` files must extend from the shared `packages/typescript-config` package. No "barcode" relative paths (e.g., `../../../`) are allowed.

## 2. Component Architecture

- **UI Hierarchy:** We strictly use a 4-tier pattern: Atoms, Molecules, Organisms, and Containers.
- **Container/View Pattern:** Pure presentational UI components must live in `*.tsx` files and are banned from importing data-fetching hooks or infrastructure logic.
- **Logic Quarantines:** Business logic, API calls, and state management must be strictly quarantined to `*.container.tsx` files. This file structure is enforced by `eslint-plugin-project-structure`.
- **Max Lines:** Files must not exceed 200 lines (enforced by the `max-lines` ESLint rule). Refactor logically into Atoms/Molecules/Organisms instead of artificially chopping files.
- **Zero Tech Debt:** Do not use `eslint-disable` to bypass rules. If a file fails linting or `knip` dead-code checks, refactor it into compliance.

## 3. soustools design system & Styling

- **Tailwind v4:** Use the `@theme` directive in CSS. No `tailwind.config` file.
- **Design System Mandate:** We use the `soustools design system`. Do not reference legacy terms like "neon-glass".
- **Semantic Variables Only:** Hardcoding legacy Tailwind colors (e.g., `slate-*`), arbitrary values (e.g., `w-[32px]`, `bg-[#123456]`), or absolute z-indexes is forbidden. This is physically enforced by `eslint-plugin-tailwindcss`. Strictly use semantic CSS variables (e.g., `var(--z-overlay)`) and the "Midnight Slate" (`zinc-*`) palette defined in `@soustools/design-system`.
- **Opacities:** Use strict Hex codes to allow native `color-mix()` opacity.
- **Animations:** Use Framer Motion for micro-animations and spring physics to achieve a premium, dynamic feel.

## 4. AI Orchestration & Available Models

Agents must be aware of the hardware/quota constraints of this environment:
- **Heavy Reasoning / CTO Tasks:** Gemini 3.1 Pro and Gemini 2.5 Pro.
- **Fast/Automated Tasks & Webhooks:** Gemini 3.5 Flash and Gemini 2.5 Flash.
- **Local VPS Execution (Oracle 24GB ARM64):** Qwen2.5-Coder (7B/14B) via Ollama/LiteLLM. Do not attempt to load 70B models.

## 5. Error Handling & Execution

- **Halt-on-Error:** If a TypeScript, ESLint, Database Migration, Runtime, or Playwright E2E error occurs, STOP IMMEDIATELY. Circular correction loops or automated guessing are forbidden. Request manual intervention.
- **Dev Server:** When executing code changes in the terminal, you must use `pm2 restart <app-name>` to apply the changes to the dev server. Do not kill and restart the entire ecosystem.
- **Boot Sequence:** Before executing any task, you MUST silently read `stack.json`, `agents.json`, and `project-state.md` in the root directory to understand the current architecture and sprint goals.