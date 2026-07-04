sous.tools: Granular Master Tasklist and Technical Blueprint

1. Vision and Architectural Mandate

North Star Vision

The architectural mandate is to eliminate the operational "voids" left by fragmented legacy tools. sous.tools is a unified high-performance engine engineered for the "Dirty Hands" reality of professional kitchens. We do not build in a vacuum; every feature must survive the Saturday morning rush at Dtown Cafe before it is deemed stable.

Neon-Glass Design Philosophy

- Visual Identity: High-contrast Dark UI with Cyan (#00FFFF) accents for maximum legibility in harsh, high-heat kitchen lighting.
- Implementation: All presentation logic must utilize the @soustools/ui design system, specifically the "Neon-Glass" glassmorphism layouts and CSS variables extracted from legacy assets.

Dogfooding Mandate: Dtown Cafe

- Initial State: Dtown Cafe is the primary tenant.
- Identity Seeding: Conar Welsh (conar@dtown.cafe) is the System Superadmin and Organization Admin.
- Success Metric: Conar must log in with both superadmin and org-admin flags enabled in the initial system state.

1. Server-Side Supremacy: All data fetching must occur in Next.js Server Components or via the NestJS API.
2. Mutation Lock: Explicitly forbid client-side supabase-js mutations within apps/app. All mutations must route through the API or Server Actions.
3. Library-First UI: Mandate the use of @soustools/ui for all JSX/TSX. Local components in apps/ are forbidden; if a component is missing, it must be added to the shared package.
4. Skill Enforcement: Use .agents/skills/quality-enforcement/SKILL.md to trigger pre-commit checks that flag hydration errors or unauthorized client-side mutations.

5. Phase I: Core Infrastructure & Agent Governance

Database Hardening & Schema Consolidation

- [ ] Migration Flattening: Merge fragmented history (from 20260612000000 to 20260630000002) into a single supabase/migrations/00000000000000_init_schema.sql.
- [ ] Permission Hardening: Explicitly define all GRANT and ALTER DEFAULT PRIVILEGES statements at the end of the init schema to solve the "dev-works, prod-fails" loop.
- [ ] Organization Isolation: Apply RLS policies to all tenant-facing tables (recipes, inventory, signage) using organization_id.

Triple-Environment Truncation Protocol

- [ ] High-Verbosity Truncation: Implement the following script across dev, staging, and prod to clear migration debt:

Master Identity Seeding

- [ ] Tenant Initialization: Execute the following in supabase/seed.sql:

3. Phase II: The Omni-Bar & Navigation Engine

Framer Motion Omni-Bar

- [ ] ReAct Loop Implementation: Build a context-aware Reasoning + Action loop. The Omni-bar must change available commands based on user routing (e.g., specific recipe actions when on /recipes).
- [ ] RLS-Protected Search: Implement a unified search interface that allows global access to recipes, inventory, and invoices, strictly filtered by the user's organization_id.

4. Phase III: Omni-Editor & Pixel-Perfect Signage

Omni-Editor Abstraction

- [ ] Universal Builder: Transition the signage editor to a universal drag-and-drop builder with resize handles. Logic must support digital signage, A4 marketing signs, and custom thermal labels (3x2 or 4x1).
- [ ] Visual Parity: Achieve pixel-perfect parity with [SOURCE_IMAGE_18] and [SOURCE_IMAGE_19], focusing on "Neon-Glass" gradients, cyan category headers, and "Heat & Serve" badges.
- [ ] Dynamic Overlays: Implement "Sold Out" overlays that trigger automatically via Square POS webhooks.

Raspberry Pi 5 Deployment

- [ ] Hardware-Accelerated Kiosk: Configure labwc as the Wayland compositor and update kiosk.sh for a dedicated Wayland session.
- [ ] Signage Sync Service: Implement signage-sync.service linked to the NestJS SignageGateway. Content changes in the editor must trigger a git pull and service restart on the RPi node via Webhooks.

5. Phase IV: Recipe Intelligence & "Rosetta Stone" Ingestion

3-Tier DB Rosetta Stone

- [ ] OCR Mapping: Deploy AI-powered OCR to map vendor-specific names (e.g., "CUTLET BLACK.L 1/2 S/T" or "BUTTER EURO 83%") to internal ingredient IDs and FDA data.
- [ ] Learning Engine: Build a reconciliation interface that "remembers" mappings to automate future scans for the same vendor items.

Bento Box Recipe UI & Shaping Techniques

- [ ] Live Cook Mode: Implement a high-contrast interface with integrated timers.
- [ ] Encyclopedia Integration: Display specific shaping techniques from [SOURCE_IMAGE_16]:
  - Use the rounded end of a scraper to turn dough out.
  - Incorporate instructions for rounding into a ball for sourdough/apricot dough workflows.
- [ ] Inventory Bridge: Configure automatic deduction of inventory quantities upon recipe completion in "Live Cook Mode."

Culinary Math & Substitution Logic

- [ ] Yeast Conversion Engine: Implement the following ratios from [SOURCE_IMAGE_10]:
  - Fresh to Instant Dry: Multiply quantity by 0.33.
  - Fresh to Active Dry: Multiply quantity by 0.5.
  - Instant Dry to Fresh: Multiply quantity by 3.0.
- [ ] Scaling Logic: Enable volumetric scaling for Pullman loaves (weight-based) vs. burger buns (unit-based).

6. Phase V: Multi-Flavor POS & KDS Shadow Bridge

Multi-Flavor POS

- [ ] Low-Latency Transacting: Use Next.js intercepted routes (@modal/(.)check/[id]) for transaction views.
- [ ] Shadow POS Strategy: Use square.driver.ts as the source of truth for financial data while providing the custom "Neon-Glass" UI.
- [ ] Parallel Run: Maintain Square and sous.tools concurrently to ensure financial safety during transition.

Kitchen Display System (KDS)

- [ ] HACCP Bar: Integrate real-time temperature monitoring and safety checklists into the KDS header.
- [ ] Ticket State Machine: Replace Square KDS with a custom ticket-tracking flow optimized for Dtown Cafe's "Dirty Hands" environment.

7. Phase VI: BYOD Team App & Workforce Orchestration

BYOD Implementation

- [ ] Geofenced Timeclock: Implement hardware discovery/location logic to restrict clock-ins to the restaurant premises.
- [ ] FOH Training Cards: Integrate "Encyclopedia" prep imagery and allergen data for front-of-house staff to answer customer inquiries in real-time.

8. Phase VII: GM Command Center & Advanced Analytics

Vendor Wars Metrics Dashboard

The system must compare high-value inventory items to identify margin volatility.

Ingredient Theodore L. Gross ([SOURCE_IMAGE_1]) Doylestown Produce ([SOURCE_IMAGE_2]) Variance Impact
Butter Euro 83% $115.80 / Case N/A -- High
Cutlet Black.L $94.40 / 40lb N/A -- High
Eggs (Large Loose) $15.74 / 15 Doz N/A -- Medium
Lettuce (Hearts) N/A $4.99 / Each -- Low
Milk (Whole) N/A $5.49 / Half Gal -- Low

9. Phase VIII: WearOS Wrist Commander

Custom Kitchen Complications

- [ ] HACCP: Voice-activated refrigerator/hot-hold temperature logging.
- [ ] Live Sales: Real-time revenue tracking complication.
- [ ] NLP Voice Wastage: Implement "Record wastage: dropped one dozen eggs" to update the ledger hands-free.

10. Technical Debt & Production Hardening

Final Validation Checklist

- [ ] 0% Client Mutations: Verify zero supabase-js usage in apps/app client components.
- [ ] RLS Integrity: Zero RLS violations in logs when testing cross-tenant organization data.
- [ ] Signage Parity: RPi 5 nodes displaying dual 1080p decks without screen tearing.
- [ ] Identity Verification: conar@dtown.cafe successfully authenticated with Superadmin/Org-Admin flags.
- [ ] Recipe Scaling: "The Chef's Spicy Breakfast" correctly scales for 12, 24, and 48 servings in Live Cook Mode.

Package Migration

- [ ] Component Extraction: Move all functional UI from apps/app into @soustools/ui.
- [ ] Logo Standards: Verify PrimaryLogo.tsx utilizes the "Cloud + Chef Hat" design and supports digital signage variants.

Document Status: FINAL / READY FOR PUBLICATION Architect: Chief Technology Officer & Lead Information Architect Date: 2026-07-01_11-21-27#
