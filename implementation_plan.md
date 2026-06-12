# Hybrid Recipe & Production Engine (Module 2) Implementation Plan

Implement the core culinary/beverage recipe engine, supporting hybrid linear/Baker's percentage scaling, global vessel profile adjustments, liquid density-based unit conversions, a persistent Active Kitchen Mode viewer with wake-lock, and Open Food Facts compliance data auto-population.

## User Review Required

> [!IMPORTANT]
> - **Dual-Mode Scaling Algorithm**: Stored recipes support two calculation models:
>   - `fixed_weight`: Scales mass or volume linearly using the multiplier: `Target Yield / Base Yield`.
>   - `bakers_percentage`: Calculates weight outputs relative to the aggregate weight of ingredients designated as `base_calculation_group = true` (representing the 100% baseline, typically flour).
> - **Vessel-Aware Adjustments**: Scaling can be driven by swapping vessel profiles. The system computes a scaling multiplier based on the volumetric ratio of the new vessel versus the recipe's default vessel.
> - **Density-Based Unit Conversions**: Fluid-to-weight conversions read a `density_g_ml` coefficient (grams per milliliter) on `master_ingredients` to safely scale mass (g, oz, lb) and volume (ml, tsp, tbsp, cups).
> - **Active Kitchen Mode & Timers**: Kitchen timers run locally and are persisted directly to `localStorage`. If the browser is refreshed or goes offline, the timers continue tracking elapsed time relative to the system clock.
> - **Compliance Ingestion**: We query the free Open Food Facts API directly from the client browser to auto-populate nutritional macro values and flag common allergen markers (e.g. wheat, dairy, nuts).

---

## Proposed Changes

### 1. Database Schema

Add the table structures for vessel profiles, master ingredients, and recipes.

#### [NEW] [packages/supabase/schema.sql (updates)](file:///home/conar/code/sous.tools/packages/supabase/schema.sql)

Extend the schema to support:
- `vessel_profiles`: Represents baking pans, sheet trays, or containers. Holds `name`, `shape` (`ROUND` | `RECTANGULAR`), dimensions (`length`, `width`, `height`, `diameter` as nullable numeric columns), and calculated `volume_ml`.
- `master_ingredients`: Holds the ingredient registry, `density_g_ml` (numeric, default 1.0), and JSONB fields for `nutrition_macros` and `allergens`.
- `recipes`: Stored recipe records with `title`, `yield_count` (numeric), `yield_unit` (e.g. grams, portions), and default `vessel_id`.
- `recipe_ingredients`: Join table mapping recipes to master ingredients. Holds `amount`, `unit`, `calculation_type` (`fixed_weight` | `bakers_percentage`), `base_calculation_group` (boolean), and `prep_notes`.
- Enables Row Level Security (RLS) for all new tables.

---

### 2. Shared Types (`@soustools/api-types`)

Define type-safe interfaces for recipes, units, conversions, and client timer states.

#### [MODIFY] [packages/api-types/src/index.ts](file:///home/conar/code/sous.tools/packages/api-types/src/index.ts)

Add interfaces for:
- `VesselProfile`: `id`, `name`, `shape`, `dimensions`, `volumeMl`.
- `MasterIngredient`: `id`, `name`, `densityGMl`, `nutritionMacros`, `allergens`.
- `Recipe`: `id`, `title`, `yieldCount`, `yieldUnit`, `defaultVesselId`, `instructions`.
- `RecipeIngredient`: `id`, `recipeId`, `masterIngredientId`, `amount`, `unit`, `calculationType`, `baseCalculationGroup`, `prepNotes`, `masterIngredient?`.
- `KitchenTimerState`: `id`, `stepIndex`, `durationSeconds`, `startedAt`, `pausedAt`, `elapsedSeconds`, `isActive`.

---

### 3. NestJS Backend API (`apps/api`)

Build CRUD endpoints and calculation engines in the backend api.

#### [NEW] [apps/recipe/recipe.module.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/recipe.module.ts)
#### [NEW] [apps/recipe/recipes.controller.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/recipes.controller.ts)
#### [NEW] [apps/recipe/recipes.service.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/recipes.service.ts)

Endpoints to manage recipes:
- `GET /recipes`: Retrieve recipes.
- `GET /recipes/:id`: Retrieve detailed recipe with join query on ingredients.
- `POST /recipes`, `PUT /recipes/:id`, `DELETE /recipes/:id`: Manage recipes and nested ingredients.

#### [NEW] [apps/recipe/ingredients.controller.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/ingredients.controller.ts)
#### [NEW] [apps/recipe/ingredients.service.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/ingredients.service.ts)

Endpoints to manage the master ingredient database:
- `GET /ingredients`: Search and paginate master ingredients.
- `POST /ingredients`: Create new master ingredient with density and nutritional details.
- `PUT /ingredients/:id`: Update ingredient attributes.

#### [NEW] [apps/recipe/vessels.controller.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/vessels.controller.ts)
#### [NEW] [apps/recipe/vessels.service.ts](file:///home/conar/code/sous.tools/apps/api/src/modules/recipe/vessels.service.ts)

CRUD endpoints to manage global vessel profiles (`/recipes/vessels`).

---

### 4. Shared Utilities (`packages/ui` & `packages/config`)

Create shared mathematical logic for scaling and conversions.

#### [NEW] [packages/ui/src/utils/scaling.ts](file:///home/conar/code/sous.tools/packages/ui/src/utils/scaling.ts)

Unit conversion and recipe scaling utility functions:
- `convertUnit(amount, fromUnit, toUnit, density)`: Performs mass-volume conversions. Supporting units: `g`, `kg`, `oz`, `lb`, `ml`, `l`, `tsp`, `tbsp`, `cup`.
- `calculateRecipeScale(ingredients, targetYield, baseYield, targetTotalWeight, targetVesselVolume, defaultVesselVolume, customIngredientWeights)`:
  - Computes linear multipliers and Baker's percentage baselines.
  - Applies vessel-aware volumetric ratios.
  - Computes scaled ingredient amounts.

---

### 5. Next.js Admin App (`apps/app`)

Develop the visual builder, recipe listings, vessel configuration tabs, and the responsive Active Kitchen Mode viewer.

#### [NEW] [apps/app/src/app/dashboard/recipes/page.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/recipes/page.tsx)

Recipe grid view displaying details, target default yields, default vessels, and quick action buttons.

#### [NEW] [apps/app/src/app/dashboard/recipes/new/page.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/recipes/new/page.tsx)
#### [NEW] [apps/app/src/app/dashboard/recipes/[id]/edit/page.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/recipes/[id]/edit/page.tsx)

Recipe creation/editor forms supporting:
- Recipe metadata: Title, yield, yield unit, default vessel.
- Recipe Ingredients builder: Add ingredients, select master ingredients, set amounts/units, select calculation type (`fixed_weight` or `bakers_percentage`), and toggle `base_calculation_group` checkbox.
- Instructions builder: Step-by-step editor to add instructions and associate timer durations.

#### [NEW] [apps/app/src/components/recipes/recipe-scaling-panel.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/recipes/recipe-scaling-panel.tsx)

Panel for interactive scaling:
- Yield multiplier inputs.
- Target batch weight inputs.
- Single ingredient weight overrides (anchoring).
- Vessel swap dropdown.

#### [NEW] [apps/app/src/components/recipes/compliance-search.tsx](file:///home/conar/code/sous.tools/apps/app/src/components/recipes/compliance-search.tsx)

Ingredient modal integrated with Open Food Facts search. Queries the API and auto-fills macro values (protein, carbs, fat, calories) and flags matching allergens.

#### [NEW] [apps/app/src/app/dashboard/recipes/[id]/kitchen/page.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/recipes/[id]/kitchen/page.tsx)

Active Kitchen Mode interface:
- High-visibility single-column step-by-step layout.
- Screen Wake Lock API integration to keep tablet screens awake in the kitchen.
- Large touch targets for crossing off steps.
- Local floating timer overlay. Persists timer state (elapsed time relative to system clock) in `localStorage` so timers survive refreshes/reloads.

#### [NEW] [apps/app/src/app/dashboard/recipes/vessels/page.tsx](file:///home/conar/code/sous.tools/apps/app/src/app/dashboard/recipes/vessels/page.tsx)

Vessel profile manager interface allowing bakers to configure shapes, dimensions (width, length, height, diameter), and calculate pans' volume capacities.

---

## Verification Plan

### Automated Tests

1. **Vitest Unit Tests**:
   - `packages/ui/src/utils/scaling.test.ts`: Verify unit conversion correctness (including density coefficients) and linear vs. Baker's percentage scaling edge-cases.
2. **NestJS API Tests**:
   - `apps/api/src/modules/recipe/recipe.spec.ts`: Verify REST CRUD endpoints for recipes, ingredients, and vessel profiles.

### Manual Verification

1. **Vessel Scaling**: Create a recipe with a default round pan vessel profile, swap it to a rectangular pan profile in the scaling panel, and verify ingredient weights scale according to volume differences.
2. **Baker's Percentages**: Verify that changing a base ingredient's weight recalculates all non-base ingredient weights dynamically relative to the new base total.
3. **Active Kitchen Mode Timers**: Start a kitchen mode step timer, refresh the browser page, and verify the timer continues running smoothly from the correct elapsed time.
4. **Open Food Facts Ingestion**: Search for a common food product (e.g. "unsalted butter"), select it, and verify that nutrition macros and allergens are filled in instantly.
