/* eslint-disable max-lines */
import { z } from "zod";

export type CalculationType =
  "fixed_weight" | "fixed_volume" | "each" | "bakers_percentage";

export interface BakersFormulaSummary {
  totalFlourWeightG: number;
  totalLiquidWeightG: number;
  hydrationPercentage: number;
  totalFormulaPercentage: number;
  isBakersRecipe: boolean;
}

export interface SubComponentBreakdown {
  name: string;
  weightG: number;
}

export interface CulinaryEncyclopediaEntry {
  id: string;
  name: string;
  aliases: string[];
  category:
    | "egg"
    | "produce"
    | "dairy"
    | "meat"
    | "poultry"
    | "seafood"
    | "baking"
    | "seasoning"
    | "liquid"
    | "pantry";
  standardPieceWeightG?: number;
  standardBunchWeightG?: number;
  pieceBreakdown?: {
    summary: string;
    subComponents?: SubComponentBreakdown[];
  };
  densityGMl?: number;
  typicalUnits: string[];
}

export interface EstimatedWeightResult {
  totalWeightG: number;
  unitWeightG?: number;
  breakdownSummary?: string;
  subComponents?: SubComponentBreakdown[];
  confidence: "exact" | "high" | "estimated";
}

export interface VesselProfile {
  id: string;
  organizationId: string;
  name: string;
  shape: "ROUND" | "RECTANGULAR";
  length: number | null;
  width: number | null;
  height: number | null;
  diameter: number | null;
  volumeMl: number;
  createdAt: string;
}

export interface NutritionMacros {
  calories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
}

export interface MasterIngredient {
  id: string;
  organizationId: string;
  name: string;
  densityGMl: number;
  nutritionMacros: NutritionMacros | Record<string, unknown>; // USDA FDC JSONB format
  allergens: string[];
  ingredientType?: string | null;
  isAnimalProduct?: boolean;
  isMeat?: boolean;
  isSeafood?: boolean;
  isDairy?: boolean;
  isEgg?: boolean;
  isGlutenSource?: boolean;
  fdcId?: number | null;
  nutritionVerifiedAt?: string | null;
  currentCostPerG?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PerServingNutrition {
  calories?: number;
  total_fat_g?: number;
  total_carbohydrate_g?: number;
  protein_g?: number;
  [key: string]: unknown;
}

export interface RecipeNutritionCache {
  recipeId: string;
  servings: number;
  perServingNutrition: PerServingNutrition;
  per100gNutrition: Record<string, unknown>;
  dietaryFlags: Record<string, boolean>;
  computedAt: string | null;
}

export interface RecipeInstruction {
  stepNumber: number;
  text: string;
  timerDurationSeconds: number | null;
}

export interface RecipeCategory {
  id: string;
  organizationId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
}

export interface RecipeTag {
  id: string;
  organizationId: string;
  name: string;
  createdAt: string;
}

export interface FormulaVersion {
  id: string;
  recipeId: string;
  versionNumber: number;
  title: string;
  yieldCount: number;
  yieldUnit: string;
  vesselId: string | null;
  instructions: RecipeInstruction[];
  ingredients: RecipeIngredient[];
  createdAt: string;
}

export interface Recipe {
  id: string;
  organizationId: string;
  title: string;
  yieldCount: number;
  yieldUnit: string;
  vesselId: string | null;
  instructions: RecipeInstruction[];
  createdAt: string;
  categoryId?: string | null;
  status?: "PENDING_REVIEW" | "APPROVED" | "ARCHIVED" | "REFERENCE";
  sourceBook?: string | null;
  sourceAuthor?: string | null;
  sourcePageStart?: number | null;
  sourcePageEnd?: number | null;
  vessel?: VesselProfile;
  recipeIngredients?: RecipeIngredient[];
  tagIds?: string[];
  posItemId?: string | null;
  suggestedSalePrice?: string | null;
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  masterIngredientId: string | null;
  subRecipeId: string | null;
  calculationType: "fixed_weight" | "bakers_percentage";
  baseCalculationGroup: boolean;
  isReference?: boolean;
  bakersPercentage?: number | null;
  originalInputString?: string | null;
  standardWeightG?: number | null;
  amount: number;
  unit: string;
  component?: string | null;
  rawName?: string | null;
  prepNotes: string | null;
  createdAt: string;
  masterIngredient?: MasterIngredient;
  subRecipe?: Recipe;
}

export interface KitchenTimerState {
  id: string;
  stepIndex: number;
  durationSeconds: number;
  startedAt: string | null;
  pausedAt: string | null;
  elapsedSeconds: number;
  isActive: boolean;
}

export const IngredientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  macros: z
    .object({
      calories: z.number().nullable(),
      proteinG: z.number().nullable(),
      carbsG: z.number().nullable(),
      fatG: z.number().nullable(),
    })
    .optional(),
  allergens: z.array(z.string()).optional(),
  vendorMappings: z
    .array(
      z.object({
        vendorId: z.string(),
        vendorItemCode: z.string(),
        vendorItemName: z.string().optional(),
      }),
    )
    .optional(),
});

export const RecipeIngredientSchema = z.object({
  ingredientId: z.string(),
  amount: z.number(),
  unit: z.string(),
  preparationNote: z.string().optional().nullable(),
});

export const RecipeVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  ingredients: z.array(RecipeIngredientSchema).optional(),
});

export const RecipeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  description: z.string().optional(),
  yield_amount: z.number(),
  yield_unit: z.string(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  dietary_restrictions: z.array(z.string()).optional(),
  ingredients: z.array(RecipeIngredientSchema),
  variants: z.array(RecipeVariantSchema).optional(),
});

export type ZodIngredient = z.infer<typeof IngredientSchema>;
export type ZodRecipe = z.infer<typeof RecipeSchema>;
