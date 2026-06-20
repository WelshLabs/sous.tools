# 🪐 SOUS.TOOLS - MASTER SYSTEM CONTEXT & GUARDRAILS

## 1. STRATEGIC ARCHITECTURE & MONOREPO STANDARDS
*   **Platform Vision:** sous.tools is an abstract multi-tenant SaaS Restaurant OS. 
*   **Workspace Apps Layout:**
    *   `apps/api`: NestJS backend. Single source of truth.
    *   `apps/app`: Next.js 16 (App Router). Core SaaS Admin Dashboard & marketing pages.
    *   `apps/customer-site`: Next.js 16. Wildcard multi-tenant custom domain routing.
    *   `apps/signage`: Next.js 16. Ultra-lightweight edge node player for smart TVs & Raspberry Pi.
    *   `apps/docs`: Next.js (Fumadocs/Nextra). Independent public tenant documentation portal.
*   **Shared Packages Layout:**
    *   `packages/api-types`: Global type-safe API interfaces.
    *   `packages/config`: Tokenized config system (Infisical).
    *   `packages/supabase`: Local database clients and RLS policies.
    *   `packages/ui`: Tailwind CSS v4 zero-bundler raw TSX design system.

## 2. ABSOLUTE CODE GUARDRAILS (ZERO EXCEPTIONS)
*   **The 150-Line Limit:** No TypeScript/TSX file may exceed 150 lines. Abstract aggressively into atomic sub-components.
*   **Strict Type Boundaries:** The `any` type is strictly banned.
*   **Environment Isolation:** Direct `process.env` lookups are completely forbidden outside of `packages/config/`.
*   **Next.js 16 Data Fetching:** Default entirely to asynchronous Next.js Server Components. "use client" is limited to leaf components requiring real-time WebSockets (Live Signage, KDS) or DOM interactivity.
*   **WSL2 & Windows Execution:** 
    * To run project builds or package scripts, bypass PowerShell's script execution policy natively on the Windows host by prepending the bypass scope: 'Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process; pnpm <args>'.
    * For Git actions, file lookups, or Linux utilities inside the WSL container, ensure commands are executed directly against the mapped mount directory without complex string escaping (e.g., use 'wsl git diff' or 'wsl find . -maxdepth 5...'). Do not use the 'wsl env 'PATH=...'' prefix as it causes node permission blocks.
    * To execute builds inside WSL on this system, always use: wsl bash -c "cd /home/conar/code/sous.tools && env PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin pnpm build"
*   **Git Branching Autonomy:** Execute all new features inside isolated Git branches off `main` using standard prefixes (e.g., `feature/signage-`, `feature/recipe-`).

## 3. MANDATORY AI EXECUTION PIPELINE
Before proposing or applying any code changes, the Agent must execute these sub-steps in sequence:
1.  **Read Blueprints:** Use the `read_file` tool to load relevant deep specs from `.blueprints/` (e.g., schemas, hardware routing) before modifying code.
2.  **Write Unit Tests First:** Generate/update Vitest (frontend) or Jest (backend) unit tests targeting 100% statement and branch coverage.
3.  **Inject JSDocs:** Fully document exported interfaces, types, methods, and parameters.
4.  **Append User-Facing Docs:** If a UI component or business service updates, provide a brief restaurant user guide marked clearly with the `@tenant-docs-export` tag.

## 4. DESIGN SYSTEM, UI/UX & BRANDING
*   **High-Glare Environment Styling:** The design system utilizes Tailwind v4 with a programmatic `oklch` token engine. Use fluid typography scales and deep glassmorphic layers (`.glass-panel`) to counteract bright, high-glare ambient commercial kitchen environments.
*   **Brand Iconography:** All generated logo assets, icons, and branding materials must exclusively feature a Japanese Gokujo-style curved knife profile. Standard Western kitchen knife profiles are strictly prohibited.
*   **Active Kitchen Mode:** Preventative wake-lock UI must present high-visibility layouts with thick border parameters and large touch padding metrics for fast striking.

## 5. CORE ENGINES & DATA FLOW
*   **Omni-Channel Ingestion:** BullMQ processes incoming assets. Tesseract.js handles zero-cost local OCR for invoices and prep lists.
*   **Math & Volume Engine:** Recipes support metric, imperial, and Baker's Percentages (100% baseline relative scaling), natively handling fluid-to-weight density coefficients.
*   **2-Way Shadow Sync:** External POS (Square, Toast) is the source of truth. Webhooks handle real-time sync; BullMQ cron catches dropped events.

## 6. SECURITY & EDGE DEPLOYMENT
*   **AI Data Isolation:** All AI/LLM contextual queries must pass through NestJS RBAC filters first to ensure strict tenant data isolation.
*   **Edge Node Logic (Raspberry Pi 5):** The Pi never sleeps. `sync-watchtower.js` polls tenant operating hours and uses Wayland commands (`wlr-randr`) to toggle TVs programmatically.
*   **Compute Limits:** Production NestJS API is kept warm via a 5-minute Better Stack ping. Staging instances must sleep.