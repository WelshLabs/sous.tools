import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { Recipe } from "@soustools/api-types";

@Injectable()
export class RecipesService {
  async findAll(orgId: string): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, vessel:vessel_profiles(*)")
      .eq("organization_id", orgId)
      .order("title", { ascending: true });

    if (error) throw new Error(error.message);
    return (data || []).map((row) => this.mapRecipeRow(row));
  }

  async findOne(id: string): Promise<Recipe> {
    const { data, error } = await supabase
      .from("recipes")
      .select(`
        *,
        vessel:vessel_profiles(*),
        recipe_ingredients (
          *,
          master_ingredients (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return this.mapRecipeRow(data);
  }

  async create(
    orgId: string,
    recipePayload: Omit<Recipe, "id" | "organizationId" | "createdAt" | "recipeIngredients" | "vessel">,
    ingredientsPayload: any[]
  ): Promise<Recipe> {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .insert([
        {
          organization_id: orgId,
          title: recipePayload.title,
          yield_count: recipePayload.yieldCount,
          yield_unit: recipePayload.yieldUnit,
          vessel_id: recipePayload.vesselId,
          instructions: recipePayload.instructions,
        },
      ])
      .select()
      .single();

    if (recipeError) throw new Error(recipeError.message);

    if (ingredientsPayload && ingredientsPayload.length > 0) {
      const dbIngredients = ingredientsPayload.map((ing) => ({
        recipe_id: recipe.id,
        master_ingredient_id: ing.masterIngredientId,
        calculation_type: ing.calculationType,
        base_calculation_group: ing.baseCalculationGroup || false,
        amount: ing.amount,
        unit: ing.unit,
        prep_notes: ing.prepNotes || null,
      }));

      const { error: ingError } = await supabase
        .from("recipe_ingredients")
        .insert(dbIngredients);

      if (ingError) {
        // Cleanup created recipe to mimic transactional rollback
        await supabase.from("recipes").delete().eq("id", recipe.id);
        throw new Error(ingError.message);
      }
    }

    return this.findOne(recipe.id);
  }

  async update(
    id: string,
    recipePayload: Partial<Recipe>,
    ingredientsPayload?: any[]
  ): Promise<Recipe> {
    const updateData: Record<string, any> = {};
    if (recipePayload.title !== undefined) updateData.title = recipePayload.title;
    if (recipePayload.yieldCount !== undefined) updateData.yield_count = recipePayload.yieldCount;
    if (recipePayload.yieldUnit !== undefined) updateData.yield_unit = recipePayload.yieldUnit;
    if (recipePayload.vesselId !== undefined) updateData.vessel_id = recipePayload.vesselId;
    if (recipePayload.instructions !== undefined) updateData.instructions = recipePayload.instructions;

    const { error: recipeError } = await supabase
      .from("recipes")
      .update(updateData)
      .eq("id", id);

    if (recipeError) throw new Error(recipeError.message);

    if (ingredientsPayload !== undefined) {
      // Clear old ingredients
      const { error: clearError } = await supabase
        .from("recipe_ingredients")
        .delete()
        .eq("recipe_id", id);

      if (clearError) throw new Error(clearError.message);

      // Re-insert new ones
      if (ingredientsPayload.length > 0) {
        const dbIngredients = ingredientsPayload.map((ing) => ({
          recipe_id: id,
          master_ingredient_id: ing.masterIngredientId,
          calculation_type: ing.calculationType,
          base_calculation_group: ing.baseCalculationGroup || false,
          amount: ing.amount,
          unit: ing.unit,
          prep_notes: ing.prepNotes || null,
        }));

        const { error: ingError } = await supabase
          .from("recipe_ingredients")
          .insert(dbIngredients);

        if (ingError) throw new Error(ingError.message);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<Recipe> {
    const recipe = await this.findOne(id);
    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    return recipe;
  }

  private mapRecipeRow(row: any): Recipe {
    return {
      id: row.id,
      organizationId: row.organization_id,
      title: row.title,
      yieldCount: Number(row.yield_count),
      yieldUnit: row.yield_unit,
      vesselId: row.vessel_id,
      instructions: row.instructions || [],
      createdAt: row.created_at,
      vessel: row.vessel ? {
        id: row.vessel.id,
        organizationId: row.vessel.organization_id,
        name: row.vessel.name,
        shape: row.vessel.shape,
        length: row.vessel.length !== null ? Number(row.vessel.length) : null,
        width: row.vessel.width !== null ? Number(row.vessel.width) : null,
        height: row.vessel.height !== null ? Number(row.vessel.height) : null,
        diameter: row.vessel.diameter !== null ? Number(row.vessel.diameter) : null,
        volumeMl: Number(row.vessel.volume_ml),
        createdAt: row.vessel.created_at,
      } : undefined,
      recipeIngredients: row.recipe_ingredients ? row.recipe_ingredients.map((ri: any) => ({
        id: ri.id,
        recipeId: ri.recipe_id,
        masterIngredientId: ri.master_ingredient_id,
        calculationType: ri.calculation_type,
        baseCalculationGroup: ri.base_calculation_group,
        amount: Number(ri.amount),
        unit: ri.unit,
        prepNotes: ri.prep_notes,
        createdAt: ri.created_at,
        masterIngredient: ri.master_ingredients ? {
          id: ri.master_ingredients.id,
          organizationId: ri.master_ingredients.organization_id,
          name: ri.master_ingredients.name,
          densityGMl: Number(ri.master_ingredients.density_g_ml),
          nutritionMacros: ri.master_ingredients.nutrition_macros,
          allergens: ri.master_ingredients.allergens,
          createdAt: ri.master_ingredients.created_at,
          updatedAt: ri.master_ingredients.updated_at,
        } : undefined,
      })) : [],
    };
  }
}
