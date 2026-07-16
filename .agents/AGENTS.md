# sous.tools AI System Rules & Anchor

## 1. Domain-Driven Design (DDD) & Infrastructure

- **Strict Boundaries:** Next.js apps (`apps/web`, `apps/pos-simulator`, `apps/setup-portal`) and domain packages (`packages/domain-*`) are strictly forbidden from importing database clients.
- **The Supabase Firewall:** NO CLIENT OR UI APP is allowed to access Supabase. Absolutely no one outside of `apps/api` should have access to or knowledge of Supabase.
- **API First & Network Fetching:** ALL network requests must go exclusively through `packages/api-client`. Native `fetch()`, `axios`, or direct endpoint calls outside of `api-client` are strictly forbidden.
- **Config Lockdown:** `process.env` is strictly forbidden outside of `@soustools/config`. All apps must import the type-safe `config` object. Infisical is the Single Source of Truth.
- **TSConfig Management:** All `tsconfig.json` files must extend from the shared `packages/tsconfig`. No relative paths (e.g., `../../../`) are allowed.

## 2. Component Architecture & Folder Structure

- **Feature-Driven Folders:** Group files by their Feature/Domain (e.g., `Supplier/`). Do not use `atoms/`, `molecules/`, or `organisms/` as folder names.
- **Design System vs. Domain Packages:** `packages/design-system` is strictly reserved for generic, reusable UI primitives. Domain-specific UI components (e.g., `SupplierOrderGroup`) MUST live in their respective `packages/domain-*` package.
- **Container/View Pattern:** Pure presentational UI components must live in `*.tsx` files and are banned from importing data-fetching hooks or infrastructure logic.
- **Logic Quarantines:** Business logic, API calls, and state management must be strictly quarantined to `*.container.tsx` files.
- **Max Lines:** Files must not exceed 200 lines. Refactor logically into smaller compositional units instead of artificially chopping files.
- **Zero Tech Debt:** Do not use `eslint-disable` to bypass rules. If a file fails linting or `knip` dead-code checks, refactor it into compliance.

## 3. sous.tools Design System & Styling

- **Tailwind v4:** Use the `@theme` directive in CSS. No `tailwind.config` file.
- **Semantic Variables Only:** Hardcoding legacy Tailwind colors (e.g., `slate-*`), arbitrary values (e.g., `w-[32px]`), or absolute z-indexes is forbidden. Strictly use semantic CSS variables and the "Midnight Slate" (`zinc-*`) palette defined in `@soustools/design-system`.
- **Animations:** Use Framer Motion for micro-animations and spring physics.

## 4. AI Orchestration & Execution

- **Halt-on-Error:** If a TypeScript, ESLint, Database Migration, Runtime, or Playwright E2E error occurs, STOP IMMEDIATELY. Circular correction loops or automated guessing are forbidden. Request manual intervention.
- **Direct Execution:** Do not waste output tokens "thinking out loud". Analyze silently, and immediately use your file-editing tools to execute the changes.
- **Task Decomposition:** If a refactor involves moving multiple files, execute the file creations and edits one by one to avoid context/token exhaustion.
