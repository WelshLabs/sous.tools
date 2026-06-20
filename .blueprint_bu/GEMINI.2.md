# 🪐 SOUS.TOOLS - MASTER SYSTEM CONTEXT & GUARDRAILS

## 1. STRATEGIC ARCHITECTURE & MONOREPO STANDARDS
* Platform Vision: sous.tools is an abstract multi-tenant SaaS Restaurant OS. Platform primitives must never force a specific organization's look or workflow. 
* Workspace Apps Layout:
  * apps/api: NestJS backend. Single source of truth.
  * apps/app: Next.js 16 (App Router). Core SaaS Admin Dashboard AND public SaaS marketing landing pages combined.
  * apps/customer-site: Next.js 16. Wildcard multi-tenant custom domain routing.
  * apps/signage: Next.js 16. Ultra-lightweight edge node player for smart TVs and Raspberry Pi hardware.
  * apps/docs: Next.js (Fumadocs/Nextra). Independent public tenant documentation portal.
  * apps/pos-simulator: Next.js/Express. Isolated local dev utility. MUST NEVER be deployed to Vercel (blocked in turbo.json).
* Shared Packages Layout:
  * packages/api-types: Global type-safe API interfaces.
  * packages/config: Tokenized config system (Infisical).
  * packages/supabase: Local database clients and RLS policies.
  * packages/ui: Tailwind CSS v4 zero-bundler raw TSX design system.

## 2. ABSOLUTE CODE GUARDRAILS (ZERO EXCEPTIONS)
* The 150-Line Limit: No TypeScript/TSX file may exceed 150 lines. Abstract aggressively into atomic sub-components.
* Strict Type Boundaries: The `any` type is strictly banned.
* Environment Isolation Rule: Direct `process.env` lookups are completely forbidden outside of packages/config/.
* Next.js 16 Data Fetching: Default entirely to asynchronous Next.js Server Components. The "use client" directive is limited to leaf components requiring real-time WebSocket updates (e.g., Live Signage, KDS) or direct DOM interactivity.
* Structural Design Conventions:
  * Backend (apps/api): Strict Domain-Driven Design (DDD). Isolated Controllers/Services/DTOs. Cross-domain queries use dependency injection or BullMQ.
  * Frontend (apps/app, apps/signage): Strict Feature-Driven Design (FDD). Source elements are categorized inside feature folders (e.g., src/features/signage-editor/components/).

## 3. CORE ENGINES
* 2-Way Shadow Sync: External POS (Square, Toast) is the source of truth via polymorphic connectors (pos_provider, external_id). Webhooks handle real-time sync; BullMQ cron catches dropped events for safe, zero-friction migration.
* Omni-Channel Ingestion: BullMQ processes incoming assets via Email, direct Network Scanners (IPP/eSCL), Google Drive APIs, and Web Share. Tesseract.js handles zero-cost local OCR.
* Math & Volume: Recipes support metric, imperial, and Baker's Percentages (100% baseline relative scaling). Density coefficients handle fluid-to-weight conversions. Opt-in abv_percentage for bar tenants.

## 4. EDGE DEPLOYMENT & FREE-TIER COMPUTE
* Compute Limits (Render): PRODUCTION NestJS API is kept warm 24/7 via a 5-minute /health ping from Better Stack. STAGING instances must sleep.
* Edge Provisioning (Raspberry Pi 5): Automated CI/CD builds .img.xz via sdm and deploys to GitHub Releases. The Pi auto-logins, fetches Infisical secrets, launches Labwc/Chromium, and loads the sync-watchtower.js daemon.
* Edge Node Power Logic: The Pi never sleeps (maintains Better Stack heartbeats). sync-watchtower.js polls tenant operating hours and uses Wayland commands (wlr-randr --output HDMI-A-1 --off) to toggle TVs programmatically.
