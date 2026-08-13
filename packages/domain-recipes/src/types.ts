/**
 * Shared domain types used across @soustools/domain-recipes components.
 * These are convenience re-exports and local extensions of @soustools/api-types.
 */

/** A single recipe ingredient line in a builder form. */
export interface RecipeIngredientLine {
  masterIngredientId: string | null;
  amount: number;
  unit: string;
  calculationType: "fixed_weight" | "bakers_percentage";
  baseCalculationGroup: boolean;
  prepNotes: string;
  rawName?: string | null;
}

/** A single recipe instruction step in a builder form. */
export interface RecipeInstructionStep {
  stepNumber: number;
  text: string;
  timerDurationSeconds: number | null;
}

/** A scaled ingredient row emitted from calculateRecipeScale. */
export interface ScaledIngredient {
  ingredientId: string;
  name: string;
  scaledAmount: number;
  scaledUnit: string;
  weightInGrams: number;
  baseCalculationGroup: boolean;
  calculationType: string;
  percentageOfBase?: number;
}

/** Cost breakdown for a single ingredient. */
export interface CostIngredient {
  ingredientId: string;
  name: string;
  weightG: number;
  costUsd: number;
}

/** Full recipe cost data returned by the /api/recipes/:id/cost endpoint. */
export interface RecipeCostData {
  totalCostUsd: number;
  costPerServingUsd: number;
  linkedSalePrice?: number;
  marginPct?: number;
  suggestedSalePrice?: number;
  ingredients: CostIngredient[];
}

/** A single version snapshot row. */
export interface VersionRow {
  id: string;
  versionNumber: number;
  title: string;
  yieldCount: number;
  yieldUnit: string;
  createdAt: string;
}

/** An inventory item result from search. */
export interface InventoryItem {
  id: string;
  name: string;
}

/** Wastage reason codes. */
export type WastageReason =
  "TRIM" | "SPOILAGE" | "OVERPRODUCTION" | "SPILL" | "OTHER";
