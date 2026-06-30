Active_Roadmap.md

1. Phase I: Agent Governance & Skill Optimization

Audit and Refactor Directive for Agent Skills

Rewrite the following skill definitions in .agents/skills/ (migrations/SKILL.md, supabase-client/SKILL.md, and nextjs-patterns/SKILL.md) to align with the "AI Execution Rules." Use the following prompt for the LLM execution:

Directive: Audit the current skill definitions. Standardize them to enforce the following architectural constraints:

1. Server-Side Supremacy: All data fetching must occur in Next.js Server Components or via the NestJS API. Explicitly forbid client-side supabase-js calls within apps/app unless specifically authorized for real-time subscriptions.
2. Library First: Mandate the use of @soustools/ui for all JSX/TSX. If a component does not exist, it must be added to the package rather than built locally in the app.
3. Modular Logic: Enforce the "Skeletal App" pattern where apps/app and apps/api are routing/orchestration layers, and business logic resides in shared packages.

Code Quality Enforcement Skill

Generate a new skill file: .agents/skills/quality-enforcement/SKILL.md.

- Goal: Eradicate "hacky" workarounds and hydration errors.
- Logic: Implement a pre-commit check-style rule for LLMs that flags any use client component performing direct database mutations.
- Enforcement: Priority must be placed on the @soustools/ui design system. Any generated UI code must be checked against packages/ui/src/index.ts exports.

2. Phase II: Database Infrastructure Reset & Hardening

Triple-Environment Truncation Protocol

Execute the following "Clean Slate" command set across dev, staging, and prod to clear migration debt.

-- High-Verbosity Truncation Script
SET session_replication_role = 'replica';
DO $$
DECLARE
r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
END LOOP;
END $$;
SET session_replication_role = 'origin';

Migration Flattening & Schema Consolidation

Standardize the schema by merging the fragmented history starting from supabase/migrations/20260612000000_schema.sql through 20260630000002_alter_vendors_schema.sql.

- Task: Flatten these into a single supabase/migrations/00000000000000_init_schema.sql.
- Requirement: Ensure all GRANT and ALTER DEFAULT PRIVILEGES statements are explicitly defined at the end of the file to prevent recurring permission errors.

RLS Reinforcement & Permission Mapping

Harder the security layer based on apps/api/src/common/guards/admin.guard.ts logic:

1. Admin Scoping: Restrict the admin schema and specific routes to the Users table (System Superadmins).
2. Organization Isolation: Apply the following policy template to all tenant-facing tables (recipes, inventory, signage):

3. Phase III: Dtown Cafe Identity & Data Seeding

Master Seed Configuration

Populate supabase/seed.sql with the foundational data for the first tenant:

INSERT INTO public.organizations (id, name, slug, logo_url)
VALUES (gen_random_uuid(), 'Dtown Cafe', 'dtown-cafe', 'cloud-chef-hat-logo.svg');

INSERT INTO public.profiles (id, email, organization_id, role)
VALUES ('[CONAR_AUTH_ID]', 'conar@dtown.cafe', (SELECT id FROM organizations WHERE slug = 'dtown-cafe'), 'superadmin');

Logo Verification

- Check: Verify packages/ui/src/components/logos/PrimaryLogo.tsx for the "Cloud + Chef Hat" implementation.
- Action: Standardize the PrimaryLogo component to accept a variant prop for digital signage vs. POS headers.

4. Phase IV: Signage Hardware & OS Deployment

Raspberry Pi 5 Wayland Technical Checklist

1. OS: Flash Ubuntu Desktop 24.04 (64-bit) or Raspberry Pi OS (Bookworm).
2. Window Manager: Configure labwc as the Wayland compositor (reference: deploy/ansible/roles/config/files/labwc-rc.xml).
3. Display: Force 1920x1080 resolution on HDMI-A-1 and HDMI-A-2.
4. Kiosk Mode: Update deploy/ansible/roles/config/files/kiosk.sh to launch the signage player in a hardware-accelerated Wayland session.

Auto-Update & Sync Integration

Configure the signage-sync.service using the template at deploy/ansible/roles/services/templates/signage-sync.service.j2.

- Webhook Logic: Link the service to the NestJS SignageGateway (Websockets) to trigger an immediate git pull and service restart upon content changes in the visual editor.

5. Phase V: UI Salvage & Design System Extraction

Neon-Glass UI Extraction

Use Repomix to isolate components from the legacy directory.

- Directive: Identify the "Neon-Glass" CSS variables and glassmorphism layouts.
- Migration: Refactor these into @soustools/ui/src/components/signage-glass.
- Constraint: Convert all functional components into presentation-only components. Strip any internal useEffect or useState that handles data fetching; data must be passed via props from server-side signage renders.

6. Phase VI: Operational Data Entry & Launch

Recipe Data Ingestion Workflow

Initialize the Dtown Cafe digital cookbook with OCR-assisted entry.

- Test Cases: Prioritize "Egg & Cheese Sandwich," "The Chef's Spicy Breakfast," and "Famous Cinnamon Knots."
- Accuracy Check: Cross-reference against Source Images 1 and 2 to ensure "Breakfast Masterpieces" and "Scratch Pastries" categories match pixel-perfect.

Live Cook Mode Validation

Test the kitchen interface (apps/app/src/app/(fullscreen)/recipes/[id]/kitchen/page.tsx):

1. Scaling: Verify scaling logic for "Pullman loaves" (weight-based) and "burger buns" (unit-based).
2. Encylopedia Integration: Ensure yeast substitution ratios (Fresh vs. Instant) are accessible via the recipe UI.

3. Roadmap Appendix: Success Metrics & Validation

Phase Required Output Validation Criteria

1. Agent Governance Rewritten .agents/skills/ Agent-generated PRs show 0% client-side supabase-js usage in apps/app.
2. DB Infrastructure Consolidated init_schema.sql Zero RLS violations in logs when accessing data from a non-admin organization_id.
3. Identity Seeding Seeded "Dtown Cafe" Org conar@dtown.cafe successfully logs in with both Superadmin and Org-Admin flags.
4. Hardware Deployment Wayland RPi 5 Node Signage displays dual 1080p slide decks without screen tearing; refreshes on webhook.
5. UI Salvage Neon-Glass Components packages/ui contains refactored glassmorphism components with zero data-fetching side effects.
6. Operational Launch Dtown Recipe Book "Live Cook Mode" correctly scales "Chef's Spicy Breakfast" for 12, 24, and 48 servings.
