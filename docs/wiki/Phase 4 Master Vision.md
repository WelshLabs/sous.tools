Phase IV Master Vision & Architecture Blueprint: Antigravity 2.0

1. The 'Glacier' Philosophy & Architectural Mandate

The "Glacier" philosophy is the non-negotiable system anchor for Antigravity 2.0. It enforces a 97/3 ratio: 97% of the system is a hyper-complex, AI-driven backend engine (the "submerged" mass) designed to absorb the chaotic physics and data-entropy of professional kitchens. The remaining 3%—the interface—is a "Zero-Ambiguity" neon-glass skin. We suffer the complexity in the engine so the chef, facing a Saturday morning rush with "Dirty Hands," never has to.

North Star Vision To eliminate the operational "voids" left by fragmented legacy tools by providing a unified, high-performance engine engineered for the high-heat, high-pressure reality of Dtown Cafe. Stability is the only metric; every feature must be "Saturday Morning Ready."

Design Principle Implementation Mandate
Zero-Ambiguity High-contrast Dark UI with Cyan (#00FFFF) accents. Binary clarity for kitchen visibility. Exclusive use of cloud-chef-hat-logo.svg.
Hardware Optimization Optimized for Raspberry Pi 5. Mandated use of labwc Wayland compositor for dedicated dual-head 1080p kiosk mode output.
Progressive Disclosure Framer Motion-driven tiered info reveal to manage cognitive load without distracting line staff during service.
Library-First UI 100% utilization of @soustools/ui. Local UI hacks in apps/app are Tier 1 violations subject to immediate refactoring.

2. 3-Tier Governance & Data Sovereignty

The "Rosetta Stone" model enforces strict data sovereignty through the application of Row Level Security (RLS) across three distinct tiers.

1. Tier 1: Global/FDA (Standardized Nutrition)

- Scope: Master dataset for standardized nutritional anchoring and global ingredient IDs.
- RLS Rule: Read-only for all tenants; authenticated access only; managed by System Superadmins.

2. Tier 2: Organization/Tenant (Private Operational Data)

- Scope: Dtown Cafe-specific recipes, private inventory, copyrighted instructional data, and RLS-scoped ledger data.
- RLS Rule: Strictly enforced by organization_id. Cross-tenant data leakage triggers a HALT-ON-ERROR state.

3. Tier 3: Local/Site (Operational Overrides)

- Scope: Site-specific counts, wastage ledgers, and local ingredient pricing overrides (e.g., Doylestown Produce vs. Triple A Paper Co.).
- RLS Rule: Scoped to organization_id and verified site identifiers.

3. Unified Ingestion Engine & Public Domain Integration

The universal ingestion pipeline transitions to an asynchronous, Vision-LLM-driven workflow to handle messy, handwritten, or carbon-copy invoices.

1. Universal Uploader: A single @soustools/ui component using the intent prop (e.g., intent="invoice") to route data.
2. Asynchronous BullMQ Pipeline:

- NestJS API receives the file, stores it in Supabase raw_scans, and returns a job_id.
- BullMQ worker invokes Llama-3.2-Vision with a context-aware Zod schema.

3. Public Domain Integration: The engine cross-references extracted data against:

- Escoffier / Professional Baking: For baseline professional intelligence and shaping techniques.
- TheMealDB / Open Food Facts: For supplementary validation.
- Wikidata / USDA: For standardized nutritional anchoring.

4. Human-in-the-Loop Reconciliation: A reconciliation UI for the chef to map vendor names (e.g., "CUTLET BLACK.L") to internal IDs, with the system "learning" these mappings for future scans.

5. Database Architecture & Ingredient Schema Separation

The schema enforces a "USDA Lazy-Loading Architecture" to preserve Supabase free-tier limits. Heavier nutritional data is fetched only upon user demand or final recipe validation.

interface IngredientSchema {
// Tier 1 & 2: Mandatory Governance
id: string;
organization_id: string; // Mandatory for RLS enforcement

// Base Ingredient (Standardized Mapping)
base_ingredient: {
id: string;
fda_id?: string; // Link to USDA global data
name: string; // e.g., "Unsalted Butter"
category: string;
};

// Preparation & Context (Recipe Specific)
preparation_note: {
recipe_id: string;
note: string; // e.g., "browned," "melted"
scaling_type: 'weight' | 'unit'; // weight for Pullman, unit for Buns
};

// Culinary Physics Metrics
physics: {
quantity: number;
unit: string;
weight_to_volume_ratio: number;
density_modifier: number;
};
}

5. Semantic Vector Mapping: The Flavor Bible Engine

The system uses Semantic Vector Mapping to bridge the gap between technical execution and "Culinary Physics," specifically focusing on flavor affinities and weight/volume profiles.

Culinary Physics & Affinity Table | Category | Attribute / Ratio | Logic | | :--- | :--- | :--- | | Yeast Conversion | Fresh to Instant | Multiply by 0.33 | | Yeast Conversion | Fresh to Active Dry | Multiply by 0.5 | | Yeast Conversion | Instant to Fresh | Multiply by 3.0 | | Flavor Profile | Tuna | Weight: Heavy | Volume: Moderate | | Flavor Profile | White Truffles | Weight: Light | Volume: Loud | | Scaling Logic | Pullman Loaves | Weight-based (Volumetric calculation) | | Scaling Logic | Burger Buns | Unit-based (Discrete counts) |

6. Infrastructure Consolidation: The Oracle 'Holy Grail' Migration

We are deprecating the "Bees Nest" of fragmented SaaS providers in favor of a unified Oracle Cloud Always Free ARM architecture (4 OCPUs, 24GB RAM).

Services to Deprecate Services to Retain
Render.com (API/Worker Hosting) Supabase (Database, Auth, Storage)
Upstash / Redis Cloud (Queueing) GitHub (Actions, GHCR)
Docker Hub (Registry) Infisical (Secret Management)
Vercel (Frontend Orchestration) New Relic (Telemetry)

Migration Tasklist

- [ ] Provision Oracle ARM: Ubuntu 24.04; Open ports 80, 443, 22.
- [ ] Execute Triple-Environment Truncation Protocol:

SET session_replication_role = 'replica';
DO
DECLARE r RECORD;
BEGIN
FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
END LOOP;
END;
SET session_replication_role = 'origin';

- [ ] Deploy Traefik & Local Redis: Configure for internal BullMQ routing.
- [ ] GHCR Transition: Push all images (including RPi 5 signage) to GitHub Container Registry.
- [ ] Reaper Beater Deployment: Cron job forcing Ollama generation every 12h to maintain >10% CPU and RAM utilization.

7. Phase IV Execution Roadmap: "Saturday Morning Ready"

This sprint focuses on operational readiness for Dtown Cafe and the digitization of the "Bread Encyclopedia."

Required Output Success Metric
Migration Flattening 0000_init_schema.sql success; All GRANT/ALTER statements at file end.
Identity Seeding Conar Welsh logs in with Superadmin and Org-Admin flags.
Voice Wastage WearOS NLP accuracy > 95% for ledger updates (e.g., "Dropped 6 buns").
Encyclopedia Integration Live Cook Mode shows shaping techniques (e.g., rounded end of scraper for dough).
Neon-Glass UI 0% client-side mutations; 100% @soustools/ui component utilization.

8. Anti-Patterns & Refactoring Guardrails

To maintain the integrity of the Glacier engine, the following mandates are strictly enforced.

- FORBIDDEN: Direct client-side Supabase mutations in apps/app. All mutations must route through NestJS or Server Actions.
- FORBIDDEN: Usage of GEMINI.md or activation of "Management Mode" meta-cognitive loops.
- FORBIDDEN: Local UI implementations in apps/app. Everything must be extracted to the shared @soustools/ui library.
- FORBIDDEN: Bypassing the "Skeleton App" pattern. Next.js is an orchestration layer, not a database client.
- MANDATORY: HALT-ON-ERROR. If a TypeScript, Migration, or Runtime failure occurs, all execution stops immediately. No circular corrections.

Server-Side Supremacy is non-negotiable. We build for the "Dirty Hands" environment—if the system lacks the stability to survive a rush, it is a Tier 1 architectural failure.
