import {
  Controller,
  Get,
  Param,
  Query,
  Header,
  NotFoundException,
} from "@nestjs/common";
import { NutritionService } from "./nutrition.service";
import { LabelRendererService } from "./label-renderer.service";
import { createAdminClient } from "@soustools/supabase";
// import { Recipe } from "@soustools/api-types";

@Controller("recipes")
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly labelRenderer: LabelRendererService,
  ) {}

  @Get(":id/nutrition-label")
  @Header("Content-Type", "image/svg+xml")
  async getNutritionLabel(
    @Param("id") recipeId: string,
    @Query("format") format: "svg" | "png" | "pdf" = "svg",
    // @Query("servings") servings?: string,
  ): Promise<string> {
    const supabase = createAdminClient();

    // Try to get from cache first
    let { data: cache } = await supabase
      .from("recipe_nutrition_cache")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    // If no cache, compute it on the fly
    if (!cache || !cache.computed_at) {
      // Get full recipe
      const { data: recipeData } = await supabase
        .from("recipes")
        .select(
          `
          *,
          recipe_ingredients(
            amount,
            unit,
            master_ingredient:master_ingredients(
              id,
              name,
              nutrition_macros,
              allergens,
              is_animal_product,
              is_meat,
              is_seafood,
              is_dairy,
              is_egg,
              is_gluten_source
            )
          )
        `,
        )
        .eq("id", recipeId)
        .single();

      if (!recipeData) {
        throw new NotFoundException(`Recipe ${recipeId} not found`);
      }

      // Compute nutrition
      const computedCache =
        await this.nutritionService.aggregateRecipeNutrition(recipeData as any);

      // Save cache asynchronously (don't block response)
      supabase
        .from("recipe_nutrition_cache")
        .upsert(computedCache as any)
        .then();

      cache = computedCache as any;
    }

    if (format === "svg") {
      return this.labelRenderer.renderSvg(cache as any);
    } else {
      throw new Error(`Format ${format} not supported yet in renderer`);
    }
  }

  @Get(":id/nutrition")
  async getNutrition(@Param("id") recipeId: string): Promise<any> {
    const supabase = createAdminClient();

    // Try to get from cache first
    let { data: cache } = await supabase
      .from("recipe_nutrition_cache")
      .select("*")
      .eq("recipe_id", recipeId)
      .single();

    // If no cache, compute it on the fly
    if (!cache || !cache.computed_at) {
      const { data: recipeData } = await supabase
        .from("recipes")
        .select(
          `
          *,
          recipe_ingredients(
            amount,
            unit,
            master_ingredient:master_ingredients(
              id,
              name,
              nutrition_macros,
              allergens,
              is_animal_product,
              is_meat,
              is_seafood,
              is_dairy,
              is_egg,
              is_gluten_source
            )
          )
        `,
        )
        .eq("id", recipeId)
        .single();

      if (!recipeData) {
        throw new NotFoundException(`Recipe ${recipeId} not found`);
      }

      const computedCache =
        await this.nutritionService.aggregateRecipeNutrition(recipeData as any);
      supabase
        .from("recipe_nutrition_cache")
        .upsert(computedCache as any)
        .then();

      cache = computedCache as any;
    }

    // Map DB snake_case structure back to camelCase properties for frontend if needed,
    // or just return the object.
    return {
      success: true,
      data: {
        recipeId: cache.recipe_id || cache.recipeId,
        servings: Number(cache.servings),
        perServingNutrition:
          cache.per_serving_nutrition || cache.perServingNutrition,
        per100gNutrition: cache.per_100g_nutrition || cache.per100gNutrition,
        dietaryFlags: cache.dietary_flags || cache.dietaryFlags,
        computedAt: cache.computed_at || cache.computedAt,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
