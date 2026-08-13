import { Injectable, Logger } from "@nestjs/common";
import { DietaryClassifierService } from "./dietary-classifier.service";
import { UsdaResolverService } from "./usda-resolver.service";
import {
  Recipe,
  MasterIngredient,
  RecipeNutritionCache,
} from "@soustools/api-types";

@Injectable()
export class NutritionService {
  private readonly logger = new Logger(NutritionService.name);

  constructor(
    private readonly dietaryClassifier: DietaryClassifierService,
    private readonly usdaResolver: UsdaResolverService,
  ) {}

  async aggregateRecipeNutrition(
    recipe: Recipe,
  ): Promise<RecipeNutritionCache> {
    this.logger.debug(`Aggregating nutrition for recipe ${recipe.id}`);

    const ingredients =
      (recipe.recipeIngredients
        ?.map((ri) => ri.masterIngredient)
        .filter(Boolean) as MasterIngredient[]) || [];

    // Simple aggregation assuming per 100g is normalized
    let totalWeightG = 0;
    const totals: Record<string, number> = {};

    for (const ri of recipe.recipeIngredients || []) {
      if (!ri.masterIngredient) continue;

      const amountG = ri.amount; // Simplify: assuming amount is in grams for this logic
      totalWeightG += amountG;

      const macros = ri.masterIngredient.nutritionMacros as Record<
        string,
        unknown
      >;
      if (!macros) continue;

      const multiplier = amountG / 100;
      for (const [key, value] of Object.entries(macros)) {
        if (typeof value === "number") {
          totals[key] = (totals[key] || 0) + value * multiplier;
        }
      }
    }

    const servings = recipe.yieldCount || 1;
    const perServingNutrition: Record<string, number> = {};
    const per100gNutrition: Record<string, number> = {};

    for (const [key, value] of Object.entries(totals)) {
      perServingNutrition[key] = value / servings;
      per100gNutrition[key] =
        totalWeightG > 0 ? (value / totalWeightG) * 100 : 0;
    }

    const dietaryFlags = this.dietaryClassifier.classifyRecipe(
      ingredients,
      perServingNutrition,
    );

    return {
      recipeId: recipe.id,
      servings,
      perServingNutrition,
      per100gNutrition,
      dietaryFlags,
      computedAt: new Date().toISOString(),
    };
  }

  async resolveAndSaveIngredientNutrition(
    ingredientQuery: string,
  ): Promise<Record<string, unknown> | null> {
    return this.usdaResolver.resolveIngredient(ingredientQuery);
  }
}
