import { type Recipe, type VesselProfile, type RecipeIngredient, type MasterIngredient, type NutritionMacros } from "@soustools/api-types";

/**
 * Maps database row to Recipe API type.
 * @tenant-docs-export
 */
export function mapRecipeRow(row: Record<string, unknown>): Recipe {
  const vesselRaw = row.vessel as Record<string, unknown> | null;
  const ingredientsRaw = row.recipe_ingredients as Record<string, unknown>[] | null;

  const vessel: VesselProfile | undefined = vesselRaw ? {
    id: String(vesselRaw.id),
    organizationId: String(vesselRaw.organization_id),
    name: String(vesselRaw.name),
    shape: vesselRaw.shape as "ROUND" | "RECTANGULAR",
    length: vesselRaw.length !== null ? Number(vesselRaw.length) : null,
    width: vesselRaw.width !== null ? Number(vesselRaw.width) : null,
    height: vesselRaw.height !== null ? Number(vesselRaw.height) : null,
    diameter: vesselRaw.diameter !== null ? Number(vesselRaw.diameter) : null,
    volumeMl: Number(vesselRaw.volume_ml),
    createdAt: String(vesselRaw.created_at),
  } : undefined;

  const recipeIngredients: RecipeIngredient[] = ingredientsRaw ? ingredientsRaw.map((ri) => {
    const mi = ri.items as Record<string, unknown> | null;
    const macros = (mi?.nutrition_macros || {}) as Record<string, unknown>;
    const nutritionMacros: NutritionMacros = {
      calories: macros.calories !== undefined && macros.calories !== null ? Number(macros.calories) : null,
      proteinG: macros.proteinG !== undefined && macros.proteinG !== null ? Number(macros.proteinG) : null,
      carbsG: macros.carbsG !== undefined && macros.carbsG !== null ? Number(macros.carbsG) : null,
      fatG: macros.fatG !== undefined && macros.fatG !== null ? Number(macros.fatG) : null,
    };

    const masterIngredient: MasterIngredient | undefined = mi ? {
      id: String(mi.id),
      organizationId: String(mi.organization_id),
      name: String(mi.name),
      densityGMl: Number(mi.density_g_ml),
      nutritionMacros,
      allergens: Array.isArray(mi.allergens) ? (mi.allergens as string[]) : [],
      ingredientType: mi.ingredient_type ? String(mi.ingredient_type) : null,
      isAnimalProduct: Boolean(mi.is_animal_product),
      isMeat: Boolean(mi.is_meat),
      isSeafood: Boolean(mi.is_seafood),
      isDairy: Boolean(mi.is_dairy),
      isEgg: Boolean(mi.is_egg),
      isGlutenSource: Boolean(mi.is_gluten_source),
      fdcId: mi.fdc_id !== null && mi.fdc_id !== undefined ? Number(mi.fdc_id) : null,
      nutritionVerifiedAt: mi.nutrition_verified_at ? String(mi.nutrition_verified_at) : null,
      createdAt: String(mi.created_at),
      updatedAt: String(mi.updated_at),
    } : undefined;

    return {
      id: String(ri.id),
      recipeId: String(ri.recipe_id),
      masterIngredientId: ri.item_id ? String(ri.item_id) : null,
      subRecipeId: ri.sub_recipe_id ? String(ri.sub_recipe_id) : null,
      calculationType: ri.calculation_type as "fixed_weight" | "bakers_percentage",
      baseCalculationGroup: Boolean(ri.base_calculation_group),
      amount: Number(ri.amount),
      unit: String(ri.unit),
      prepNotes: ri.prep_notes ? String(ri.prep_notes) : null,
      rawName: ri.raw_name ? String(ri.raw_name) : null,
      component: ri.component ? String(ri.component) : null,
      createdAt: String(ri.created_at),
      masterIngredient,
    };
  }) : [];

  const tagsRaw = row.recipe_tag_assignments as Record<string, unknown>[] | null;
  const tagIds = tagsRaw ? tagsRaw.map((t) => String(t.tag_id)) : [];

  return {
    id: String(row.id),
    organizationId: String(row.organization_id),
    title: String(row.title),
    yieldCount: Number(row.yield_count),
    yieldUnit: String(row.yield_unit),
    vesselId: row.vessel_id ? String(row.vessel_id) : null,
    instructions: (row.instructions || []) as Recipe["instructions"],
    createdAt: String(row.created_at),
    categoryId: row.category_id ? String(row.category_id) : null,
    status: (row.status || "PENDING_REVIEW") as Recipe["status"],
    sourceBook: row.source_book ? String(row.source_book) : null,
    sourceAuthor: row.source_author ? String(row.source_author) : null,
    sourcePageStart: row.source_page_start !== null && row.source_page_start !== undefined ? Number(row.source_page_start) : null,
    sourcePageEnd: row.source_page_end !== null && row.source_page_end !== undefined ? Number(row.source_page_end) : null,
    vessel,
    recipeIngredients,
    tagIds,
  };
}
