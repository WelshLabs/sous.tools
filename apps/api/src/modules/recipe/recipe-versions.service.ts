import {
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import { FormulaVersion, Recipe } from "@soustools/api-types";
import { mapRecipeRow } from "./recipes.mapper";
import { Neo4jSyncService } from "../neo4j-sync/neo4j-sync.service";

@Injectable()
export class RecipeVersionsService {
  private readonly logger = new Logger(RecipeVersionsService.name);

  constructor(@Optional() private readonly neo4jSync?: Neo4jSyncService) {}

  /**
   * Creates an immutable snapshot checkpoint of a recipe and its ingredients in formula_versions.
   */
  async createSnapshot(
    recipeId: string,
    options?: { title?: string; note?: string },
  ): Promise<FormulaVersion> {
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select(
        `
        *,
        recipe_ingredients (
          *,
          items (*)
        )
      `,
      )
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      throw new NotFoundException(`Recipe with ID ${recipeId} not found`);
    }

    const { data: versions, error: verError } = await supabase
      .from("formula_versions")
      .select("version_number")
      .eq("recipe_id", recipeId)
      .order("version_number", { ascending: false })
      .limit(1);

    if (verError) {
      throw new Error(verError.message);
    }

    const nextVersion =
      versions && versions.length > 0 ? versions[0].version_number + 1 : 1;

    const snapshotIngredients = (recipe.recipe_ingredients || []).map(
      (ri: any) => ({
        id: ri.id,
        recipeId: ri.recipe_id,
        masterIngredientId: ri.item_id || ri.master_item_id || null,
        subRecipeId: ri.sub_recipe_id || null,
        calculationType: ri.calculation_type,
        baseCalculationGroup: Boolean(ri.base_calculation_group),
        isReference: Boolean(ri.is_reference),
        bakersPercentage:
          ri.bakers_percentage !== null && ri.bakers_percentage !== undefined
            ? Number(ri.bakers_percentage)
            : null,
        originalInputString: ri.original_input_string || null,
        standardWeightG:
          ri.standard_weight_g !== null && ri.standard_weight_g !== undefined
            ? Number(ri.standard_weight_g)
            : null,
        amount: Number(ri.amount),
        unit: ri.unit,
        prepNotes: ri.prep_notes || null,
        rawName: ri.raw_name || null,
        component: ri.component || null,
        createdAt: ri.created_at,
      }),
    );

    const { data: inserted, error: insertError } = await supabase
      .from("formula_versions")
      .insert([
        {
          recipe_id: recipeId,
          version_number: nextVersion,
          title: options?.title || recipe.title,
          yield_count: recipe.yield_count,
          yield_unit: recipe.yield_unit,
          vessel_id: recipe.vessel_id,
          instructions: recipe.instructions || [],
          ingredients: snapshotIngredients,
        },
      ])
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(
        insertError?.message || "Failed to create recipe version snapshot",
      );
    }

    if (this.neo4jSync) {
      try {
        await this.neo4jSync.handleWebhook({
          type: "INSERT",
          table: "formula_versions",
          schema: "public",
          record: inserted,
          old_record: null,
        });
      } catch (err) {
        this.logger.warn("Failed to sync formula_version to Neo4j:", err);
      }
    }

    return this.mapVersionRow(inserted);
  }

  /**
   * Retrieves all snapshot versions for a recipe.
   */
  async getVersions(recipeId: string): Promise<FormulaVersion[]> {
    const { data, error } = await supabase
      .from("formula_versions")
      .select("*")
      .eq("recipe_id", recipeId)
      .order("version_number", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row) => this.mapVersionRow(row));
  }

  /**
   * Retrieves a single snapshot version by recipe ID and version number.
   */
  async getVersion(
    recipeId: string,
    versionNumber: number,
  ): Promise<FormulaVersion> {
    const { data, error } = await supabase
      .from("formula_versions")
      .select("*")
      .eq("recipe_id", recipeId)
      .eq("version_number", versionNumber)
      .single();

    if (error || !data) {
      throw new NotFoundException(
        `Version ${versionNumber} for Recipe ${recipeId} not found`,
      );
    }

    return this.mapVersionRow(data);
  }

  /**
   * Restores a recipe and its ingredients from a historical snapshot version.
   */
  async restoreVersion(
    recipeId: string,
    versionNumber: number,
  ): Promise<Recipe> {
    const versionSnapshot = await this.getVersion(recipeId, versionNumber);

    // 1. Update the recipe metadata from snapshot
    const { error: recipeUpdateError } = await supabase
      .from("recipes")
      .update({
        title: versionSnapshot.title,
        yield_count: versionSnapshot.yieldCount,
        yield_unit: versionSnapshot.yieldUnit,
        vessel_id: versionSnapshot.vesselId,
        instructions: versionSnapshot.instructions,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId);

    if (recipeUpdateError) {
      throw new Error(recipeUpdateError.message);
    }

    // 2. Clear current ingredients
    const { error: deleteError } = await supabase
      .from("recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    // 3. Re-insert ingredients from snapshot
    if (versionSnapshot.ingredients && versionSnapshot.ingredients.length > 0) {
      const dbIngredients = versionSnapshot.ingredients.map((ing) => ({
        recipe_id: recipeId,
        item_id: ing.masterIngredientId || null,
        sub_recipe_id: ing.subRecipeId || null,
        calculation_type: ing.calculationType || "fixed_weight",
        base_calculation_group: Boolean(
          ing.baseCalculationGroup || ing.isReference,
        ),
        is_reference: Boolean(ing.isReference),
        bakers_percentage: ing.bakersPercentage ?? null,
        original_input_string: ing.originalInputString || null,
        standard_weight_g: ing.standardWeightG ?? null,
        amount: ing.amount,
        unit: ing.unit,
        prep_notes: ing.prepNotes || null,
        raw_name: ing.rawName || null,
        component: ing.component || null,
      }));

      const { error: insertError } = await supabase
        .from("recipe_ingredients")
        .insert(dbIngredients);

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // 4. Return updated recipe
    const { data: updatedRecipe, error: fetchError } = await supabase
      .from("recipes")
      .select(
        `
        *,
        vessel:vessel_profiles(*),
        recipe_ingredients (
          *,
          items (*)
        ),
        recipe_tag_assignments(tag_id)
      `,
      )
      .eq("id", recipeId)
      .single();

    if (fetchError || !updatedRecipe) {
      throw new Error(fetchError?.message || "Failed to fetch restored recipe");
    }

    return mapRecipeRow(updatedRecipe as Record<string, unknown>);
  }

  private mapVersionRow(row: Record<string, any>): FormulaVersion {
    return {
      id: String(row.id),
      recipeId: String(row.recipe_id),
      versionNumber: Number(row.version_number),
      title: String(row.title),
      yieldCount: Number(row.yield_count),
      yieldUnit: String(row.yield_unit),
      vesselId: row.vessel_id ? String(row.vessel_id) : null,
      instructions: Array.isArray(row.instructions) ? row.instructions : [],
      ingredients: Array.isArray(row.ingredients) ? row.ingredients : [],
      createdAt: String(row.created_at),
    };
  }
}
