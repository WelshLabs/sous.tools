### sous.tools System & Agent Rules (Single Source of Truth)

#### 1. Domain-Driven Design (DDD) & Infrastructure

- **Strict Boundaries:** Next.js apps (e.g., `apps/web`, `apps/pos-simulator`) and domain packages (`packages/domain-*`) are strictly forbidden from importing database clients.
- **The Supabase Firewall:** NO CLIENT OR UI APP is allowed to access Supabase. Absolutely no one outside of `apps/api` should have access to or knowledge of Supabase.
- **API First & Dumb Transport Layer:** ALL network requests must go exclusively through our unified `packages/api-client`. Native `fetch()`, `axios`, or direct endpoint calls outside of `api-client` are strictly forbidden. `api-client` is a **pure transport layer**—it must contain ZERO application business logic. It solely manages generic connections (REST, WS, GraphQL), headers, and the **centralized 401 token refresh mutex**. It must contain ZERO URL parsing logic and implicitly trust `@soustools/config`.
- **Server-Side Supremacy:** Next.js functions strictly as a routing and data orchestration layer. Server Components are the default.
- **Config Lockdown & Client/Server Split:** `process.env` is strictly forbidden outside of `@soustools/config`. All apps must import the type-safe, Zod-validated `clientConfig` or `serverConfig` objects. String fallbacks (e.g., `|| "http://localhost:3000"`) are explicitly banned.
- **Secrets SSOT (Fail Fast):** Infisical is the Single Source of Truth for all environment variables. The `@soustools/config` package contains ZERO default fallbacks. If Infisical credentials fail or are missing, the app MUST immediately `process.exit(1)`.
- **TSConfig Management:** All `tsconfig.json` files must extend from the shared `packages/typescript-config`. No relative paths (e.g., `../../../`) are allowed.
- **Thin App Router Shells:** `apps/*` directories must remain as hollow as possible. Next.js `page.tsx` files should act strictly as Server Component entry points that import their corresponding Containers or Views from `@soustools/domain-*` packages. Building complex `components/` directories inside the Next.js `apps/*` router is forbidden.

#### 2. Component Architecture & Styling

- **Feature-Driven Folders:** Do not use `atoms/`, `molecules/`, or `organisms/` as folder names. Group files by their Feature or Domain (e.g., `Supplier/`).
- **Design System vs. Domain Packages:** `packages/design-system` is strictly reserved for generic, highly reusable UI primitives and theming. Domain-specific UI components MUST live in their respective `packages/domain-*` package.
- **Container/View Pattern:** Pure presentational UI components must live in `*.tsx` files and are banned from importing data-fetching hooks or infrastructure logic.
- **Logic Quarantines:** Business logic, API calls, and state management must be strictly quarantined to `*.container.tsx` files.
- **Tailwind v4:** Use the `@theme` directive in CSS. No `tailwind.config` file. Strictly use semantic CSS variables (`var(--z-overlay)`) and the "Midnight Slate" (`zinc-*`) palette.

#### 3. AI Orchestration & Execution (4-Interface & Kanban Agents)

- **Direct Execution:** Analyze silently, and immediately use your file-editing tools to execute changes.
- **Debt Audits:** Review reports in `docs/context/cto_summary.md` and `docs/audits/` (such as `knip-report.txt` and `lint-report.txt`) before refactoring.
- **GitHub Issue & Kanban Management (MCP):** Autonomous agents must inspect ticket details and use GitHub API/MCP to move tickets across the Kanban board ("In Progress" -> "In Review" -> "Done").
- **Halt-on-Error with Self-Repair:** Run `pnpm typecheck && pnpm lint && pnpm test`. If errors occur, attempt self-repair up to 3 times before opening a PR or requesting review.

#### 4. Graph Database (Neo4j) & Relational Parity

- **PostgreSQL & Neo4j Synchronization:** PostgreSQL and Neo4j MUST stay in perfect 1:1 synchronization. Any changes made to the PostgreSQL schema MUST be immediately reflected in Neo4j `schema-registry.ts` and associated synchronization webhooks.
