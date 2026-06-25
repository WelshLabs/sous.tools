export interface CostIngredient {
  ingredientId: string;
  name: string;
  weightG: number;
  costUsd: number;
}

export interface RecipeCostData {
  totalCostUsd: number;
  costPerServingUsd: number;
  linkedSalePrice?: number;
  marginPct?: number;
  ingredients: CostIngredient[];
}

export async function fetchRecipeCost(recipeId: string): Promise<RecipeCostData | null> {
  try {
    const res = await fetch(`/api/recipes/${recipeId}/cost`);
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function saveRecipeVersion(recipeId: string): Promise<{ versionNumber: number } | null> {
  try {
    const res = await fetch(`/api/recipes/${recipeId}/versions`, {
      method: "POST",
    });
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    console.error(err);
    return null;
  }
}
