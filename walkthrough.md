# Hybrid Recipe & Production Engine (Module 2) Walkthrough

We have successfully implemented the core features of the Hybrid Recipe & Production Engine (Module 2) for the **Sous Tools** platform. This system enables bakers and chefs to define ingredient calculations (linear fixed weights and Baker's percentages), configure global vessel profiles (pan volume ratios), perform conversions between mass and volume dynamically based on ingredient densities, and run step-by-step active kitchen timers persisted locally.

---

## 1. Architectural Changes Made

### A. Database Schema & Type Contracts
- **Schema Script**: Extended [`packages/supabase/schema.sql`](file:///home/conar/code/sous.tools/packages/supabase/schema.sql) to add tables `vessel_profiles`, `master_ingredients`, `recipes`, and `recipe_ingredients`. Seeded the database with sample pans (Pullman pans, round cake pans) and master ingredients (Bread Flour, Yeast, Water, Butter, Milk) with HSL values, densities, and allergens.
- **Type Definitions**: Split the shared type package [`@soustools/api-types`](file:///home/conar/code/sous.tools/packages/api-types/src/index.ts) into sub-modules (`common.ts`, `signage.ts`, `recipes.ts`) to maintain compliance with the strict 150-line file cap. Declared type-safe interfaces for recipes, units, vessel profiles, and kitchen timer states.

### B. Shared Scaling & Conversion Utilities (`packages/ui`)
- **Unit Conversion**: Implemented `convertUnit` in [`scaling.ts`](file:///home/conar/code/sous.tools/packages/ui/src/utils/scaling.ts) supporting transitions between weight (`g`, `kg`, `oz`, `lb`) and volume (`ml`, `l`, `tsp`, `tbsp`, `cup`) utilizing the ingredient's density coefficient (`density_g_ml`).
- **Hybrid Recipe Scaling**: Implemented `calculateRecipeScale` which scales recipe ingredients proportionally. Supports linear portion yield, volume capacity ratio swapping (vessel-aware), total batch weight, and anchoring custom weights to individual ingredients. Integrates Baker's percentage calculations relative to base flour groups.

### C. NestJS Backend REST API (`apps/api`)
- **Controllers & Services**:
  - `recipes.controller.ts` & `recipes.service.ts`: Handles recipe CRUD operations and cascades nested ingredient mapping logic.
  - `ingredients.controller.ts` & `ingredients.service.ts`: Manages master ingredient assets and their nutrition/allergen configurations.
  - `vessels.controller.ts` & `vessels.service.ts`: Manages global kitchen vessel profiles.
  - Registered all under `RecipeModule` within the main `AppModule`.

### D. Frontend Interfaces (`apps/app`)
- **Vessel Profile Manager**: Created a dashboard interface under `/recipes/vessels` allowing users to configure circular/rectangular pans and auto-calculate volume capacities.
- **Recipe Builder & List**: Created recipe inventory catalog and creation/edit forms supporting nested ingredient adding, unit picking, baseline flour toggles, and step durations.
- **Recipe Viewer & Scaling Panel**: Added detailed page allowing chefs to toggle between scaling models (yield, total batch weight, vessel swap, or individual ingredient overrides) in real-time.
- **Compliance Ingestion**: Integrated browser-based search modal query to the free Open Food Facts API to auto-fill nutritional macros and allergen tags.
- **Active Kitchen Mode**: Created fullscreen step checklist utilizing browser Wake Lock API, large touch targets, and `localStorage` persistent step timers.

---

## 2. Verification & Validation Results

### A. Unit Tests
We executed the Vitest unit tests in `@soustools/ui` verifying all unit conversions (cross-dimension mass/volume) and scaling calculations (linear and Baker's percentage formulas) with 100% success:
```bash
 ✓ src/utils/scaling.test.ts  (10 tests) 7ms
 ✓ src/components/Button.test.tsx  (2 tests) 87ms

 Test Files  2 passed (2)
      Tests  12 passed (12)
```

We executed the NestJS Jest tests for the new recipe API controllers:
```bash
PASS src/modules/recipe/recipe.spec.ts
PASS src/modules/signage/signage.spec.ts
PASS src/app.controller.spec.ts

Test Suites: 3 passed, 3 total
Tests:       8 passed, 8 total
```

### B. Playwright E2E Tests
We ran the complete Playwright E2E suite, validating login, navigation, vessel manager, and active kitchen step check-offs:
```bash
Running 3 tests using 1 worker
  ✓  1 [chromium] › e2e/recipe.spec.ts:105:7 › Recipe Engine E2E › should navigate to recipes, view, scale, and start active kitchen mode (1.7s)
  ✓  2 [chromium] › e2e/recipe.spec.ts:135:7 › Recipe Engine E2E › should navigate to vessels manager and see list of vessels (1.4s)
  ✓  3 [chromium] › e2e/signage.spec.ts:4:7 › TV Signage System E2E › should login, navigate dashboard, and verify signage layout panels (1.7s)

  3 passed (5.7s)
```

### C. Production Build & Secret Audits
Compiled the entire monorepo production build (`pnpm build`) and ran the environment secret isolation audit check:
```bash
[@soustools/config] Starting secret isolation audit...
[@soustools/config] Audit PASSED. No direct environment variable access detected.
```
All checks passed cleanly!
