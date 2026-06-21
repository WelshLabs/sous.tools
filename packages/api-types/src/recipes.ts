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
  nutritionMacros: NutritionMacros;
  allergens: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecipeInstruction {
  stepNumber: number;
  text: string;
  timerDurationSeconds: number | null;
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
  vessel?: VesselProfile;
  recipeIngredients?: RecipeIngredient[];
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
