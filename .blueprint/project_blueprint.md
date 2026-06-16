# Master Project Blueprint: Sous Tools Platform (sous.tools)

## 1. Architecture & Core Stack

- **Monorepo Manager**: Turborepo with `pnpm` workspaces
- **Main SaaS Site**: Next.js 16 (`apps/marketing`) for sous.tools sales and subscription landing pages
- **Unified Kitchen App**: Next.js 16 PWA (`apps/app`) with Workspace-style feature toggles. Built web-first, architecture compatible with future Capacitor native wrappers.
- **Customer Ordering App**: Next.js 16 (`apps/customer-site`) with multi-tenant custom domain routing
- **TV Signage App**: Next.js optimized for smart TVs & Raspberry Pi browsers (`apps/signage`)
- **Backend API**: NestJS (`apps/api`)
- **Primary Database**: Supabase (PostgreSQL + Realtime) with Row Level Security (RLS)
- **Queue & Workers**: Redis + BullMQ (For OCR recipe scanning, invoice processing, POS syncing, and Stripe webhook handling)
- **Deployment & Mesh**: Dockerized local setup for Raspberry Pi 5 master nodes with offline-first support. Headless auto-updates managed via Docker Cron/Watchtower during custom tenant maintenance windows.

## 2. Authentication & Access Control (RBAC)

- **Authentication**: Supabase Auth supporting Email/Password and Google OAuth.
- **Multi-Tenant Model**: Shared database with logical isolation via `organization_id` on all entities.
- **Data Protection**: Strict Supabase Row Level Security (RLS) to enforce tenant isolation.
- **Tenant Administration**: Tenant Admins (Owners) can invite, suspend, or delete users within their own organization.
- **Subscription Tiering**: Feature-flag gates strictly tied to organization subscription plans managed via Stripe (e.g., Starter, Pro, Enterprise).
- **Roles Defined**: Super Admin, Owner, Chef, Cook, Device/Station (TV/Tablet). Enforced via NestJS Guards.

## 3. Core Business & Technical Constraints

- **Unit Conversion Engine**: System must handle fluid conversions between volumetric, weight, metric, and imperial units (e.g., matching a 5lb inventory box to a 10g recipe step).
- **Dynamic Base Ingredient Scale Engine**: Core engine built to handle baking and non-baking weight scaling configurations cleanly against variable 100% base baselines (Baker's percentages capability).
- **Ingredient Alias Mapping**: An intelligent string-matching layer to map messy vendor invoice text (e.g., "GARLIC WHL PLD 5LB") to clean internal inventory item IDs.
- **Local Device Discovery**: Simple pairing system for smart TVs / tablets to safely connect to the local master Pi IP address on the mesh network.
- **Stripe Lifecycle Syncing**: BullMQ workers dedicated to processing incoming Stripe webhooks to immediately sync tenant account status (active, past due, canceled).

## 4. API & AI Analytics Protocols

- **REST**: Standard CRUD operations (Inventory logs, user settings, Stripe checkouts).
- **GraphQL**: Complex, nested queries (Recipe cost maps, historical vendor order trends via graphql-codegen).
- **WebSockets**: Live kitchen updates (Real-time KDS sheets, immediate TV signage swaps, instant incoming customer orders).
- **AI Context Isolation**: Gemini SDK queries must pass through NestJS RBAC filters first. The AI receives _only_ the user's isolated organization dataset as a secure context payload.

## 5. UI Package Sharing Strategy (`@soustools/ui`)

- **Zero-Bundler Package**: No Vite, Rollup, or Tsup inside the UI package. Export raw TSX/TypeScript files directly.
- **Compilation**: Consuming applications must list `@soustools/ui` in their `next.config.js` `transpilePackages` array.
- **Styling**: Tailwind CSS v4. The UI package exports styles and standard elements that the apps extend.

## 6. Engineering Quality Controls

- **Test Mandate**: 100% statement, branch, and function testing coverage. Tested via Vitest (frontend packages/apps) and Jest (backend API) required for all new features.
- **Dual-Layer Docs**: Every component/service file must contain deep code-level JSDocs _and_ a clear Markdown block labeled `@tenant-docs-export` outlining the user guide for restaurant employees.
- **Formatting & Linting**: Managed by ESLint + Prettier.

## 7. High-Level Domain Boundaries (DDD)

- **Signage Domain**: Visual editor, layouts, video/image marketing playlists, asset management, live TV updates.
- **Recipe Domain**: Camera OCR processing, browser scraping, bakers percentages engine, cooking mode + Web API timers.
- **Inventory Domain**: Low-stock buffers, invoice processing, text/email vendor ordering, dynamic recipe cost tracking.
- **Order/Sync Domain**: Online customer checkout system + 2-way sync engine for Toast & Square APIs.

## 8. Future Scopes (Do Not Build Yet)

- Point of Sale (POS) UI and Hardware integration
- Kitchen Display System (KDS) live tracking matrix
- Hostess / Seating Management
- Wear OS Companion App (Voice-to-Inventory queues, WebSocket haptic kitchen timers, custom dashboard complications)

## 9. AI Agent Workspace Meta-Rules

- **Rule Hierarchy**: Always reference the .instructions and global Workspace Rules panel for code formatting boundaries before proposing modifications.
- **Minimal Diffs**: Output code strictly as atomic, target-specific text diffs or isolated code blocks. Do not rewrite unaffected portions of an existing file.
- **Autonomous Progress**: When executing a complex multistep feature plan, use the /goal command and enable agent auto-proceed pipelines rather than stopping to prompt the developer for trivial implementation details.
