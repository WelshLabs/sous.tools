# sous.tools AI System Rules

# sous.tools AI System Rules

## 1. Domain-Driven Design (DDD) & Infrastructure

- **Strict Boundaries:** Next.js apps (e.g., `apps/web`, `apps/pos-simulator`) and domain packages (`packages/domain-*`) are strictly forbidden from importing database clients.
- **The Supabase Firewall:** NO CLIENT OR UI APP is allowed to access Supabase. Absolutely no one outside of `apps/api` should have access to or knowledge of Supabase.
- **API First & Network Fetching:** ALL network requests must go exclusively through our unified `packages/api-client`. Native `fetch()`, `axios`, or direct endpoint calls outside of `api-client` are strictly forbidden.
- **Server-Side Supremacy:** Next.js functions strictly as a routing and data orchestration layer. Server Components are the default.
- **Config Lockdown:** `process.env` is strictly forbidden outside of `@soustools/config`. All apps must import the type-safe, validated `config` object.
- **Secrets SSOT:** Infisical is the Single Source of Truth for all environment variables.
- **TSConfig Management:** All `tsconfig.json` files must extend from the shared `packages/tsconfig`. No relative paths (e.g., `../../../`) are allowed.

## 2. Component Architecture

- **UI Hierarchy:** We strictly use a 4-tier pattern: Atoms, Molecules, Organisms, and Containers.
- **Container/View Pattern:** Pure presentational UI components must live in `*.tsx` files and are banned from importing data-fetching hooks or infrastructure logic.
- **Logic Quarantines:** Business logic, API calls, and state management must be strictly quarantined to `*.container.tsx` files.
- **Max Lines:** Files must not exceed 200 lines. Refactor logically into Atoms/Molecules/Organisms instead of artificially chopping files.
- **Zero Tech Debt:** Do not use `eslint-disable` to bypass rules. If a file fails linting or `knip` dead-code checks, refactor it into compliance.

## 3. soustools design system & Styling

- **Tailwind v4:** Use the `@theme` directive in CSS. No `tailwind.config` file.
- **Semantic Variables Only:** Hardcoding legacy Tailwind colors (e.g., `slate-*`), arbitrary values (e.g., `w-[32px]`, `bg-[#123456]`), or absolute z-indexes is forbidden. Strictly use semantic CSS variables (e.g., `var(--z-overlay)`) and the "Midnight Slate" (`zinc-*`) palette defined in `@soustools/design-system`.
- **Opacities:** Use strict Hex codes to allow native `color-mix()` opacity.
- **Animations:** Use Framer Motion for micro-animations and spring physics.

## 4. AI Orchestration & Execution

- **Halt-on-Error:** If a TypeScript, ESLint, Database Migration, Runtime, or Playwright E2E error occurs, STOP IMMEDIATELY. Circular correction loops or automated guessing are forbidden. Request manual intervention.
- **Issue Triage & Diagnostics:** Before writing code to fix a bug, you MUST read the diagnostic comments inside `docs/context/notebooklm-issues.md` to leverage previous junior-agent research.
- **Debt Audits:** When refactoring, you MUST review the reports in `docs/context/` and `docs/audits/` (such as `knip-report.txt` and `lint-report.txt`) to ensure you are not duplicating tech debt.
- **Boot Sequence:** Before executing any task, you MUST silently read `.agents/AGENTS.md`, `docs/context/notebooklm-project.md` (Kanban State), and `docs/context/notebooklm-architecture.md` (Workspace Graph) to understand the current architecture and sprint goals.

## 5. Continuous X-Ray Sync (NotebookLM / CTO Directive)

- **Living Document:** This `.cursorrules` file is a living document.
- **CTO Oversight:** During architectural planning sessions, the AI CTO (NotebookLM) is explicitly instructed to monitor for any new conventions, UI decisions, or workflow changes.
- **Auto-Correction:** If a conversation dictates a change in our strategy (e.g., swapping a tool, changing a naming convention, or adjusting the CI/CD pipeline), NotebookLM MUST conclude its response by providing a formatted update block to append to or modify this `.cursorrules` file.
