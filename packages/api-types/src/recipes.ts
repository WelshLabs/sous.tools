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
  nutritionMacros: NutritionMacros | Record<string, any>; // USDA FDC JSONB format
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
  createdAt: string;
  updatedAt: string;
}

export interface RecipeNutritionCache {
  recipeId: string;
  servings: number;
  perServingNutrition: Record<string, any>;
  per100gNutrition: Record<string, any>;
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
  status?: "PENDING_REVIEW" | "APPROVED" | "ARCHIVED";
  sourceBook?: string | null;
  sourceAuthor?: string | null;
  sourcePageStart?: number | null;
  sourcePageEnd?: number | null;
  vessel?: VesselProfile;
  recipeIngredients?: RecipeIngredient[];
  tagIds?: string[];
}

export interface RecipeIngredient {
  id: string;
  recipeId: string;
  masterIngredientId: string | null;
  subRecipeId: string | null;
  calculationType: "fixed_weight" | "bakers_percentage";
  baseCalculationGroup: boolean;
  amount: number;
  unit: string;
  component?: string | null;
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
