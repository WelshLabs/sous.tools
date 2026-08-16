import { type RecipeIngredient } from "@soustools/api-types";
import { convertUnit } from "./unit-conversion";

export {
  convertUnit,
  WEIGHT_CONVERSIONS,
  VOLUME_CONVERSIONS,
  COUNT_UNITS,
} from "./unit-conversion";

export interface ScaledIngredientResult {
  ingredientId: string;
  name: string;
  originalAmount: number;
  originalUnit: string;
  scaledAmount: number;
  scaledUnit: string;
  calculationType: "fixed_weight" | "bakers_percentage";
  baseCalculationGroup: boolean;
  percentageOfBase?: number; // Baker's percentage if applicable
  weightInGrams: number; // Calculated final weight in grams
}

/**
 * Calculates scaled values for all recipe ingredients based on scaling inputs.
 */
export function calculateRecipeScale(
  ingredients: RecipeIngredient[],
  baseYield: number,
  options: {
    targetYield?: number;
    targetTotalWeight?: number;
    targetVesselVolume?: number;
    defaultVesselVolume?: number;
    customIngredientWeights?: Record<string, { amount: number; unit: string }>; // anchor overrides
  },
): { multiplier: number; items: ScaledIngredientResult[] } {
  if (ingredients.length === 0) {
    return { multiplier: 1, items: [] };
  }

  // 1. Calculate the weight of each ingredient in grams to find base total/flour weights
  const ingredientBaseWeightsG: Record<string, number> = {};
  const componentBaseFlourWeightsG: Record<string, number> = {};

  // Resolve fixed weight values first
  ingredients.forEach((ing) => {
    const density = ing.masterIngredient?.densityGMl ?? 1.0;
    if (ing.calculationType === "fixed_weight" || ing.baseCalculationGroup) {
      const weightG = convertUnit(ing.amount, ing.unit, "g", density);
      ingredientBaseWeightsG[ing.id] = weightG;
      if (ing.baseCalculationGroup) {
        const comp = ing.component || "Base Recipe";
        componentBaseFlourWeightsG[comp] =
          (componentBaseFlourWeightsG[comp] || 0) + weightG;
      }
    }
  });

  // Resolve baker's percentage values based on base flour weight
  ingredients.forEach((ing) => {
    if (
      ing.calculationType === "bakers_percentage" &&
      !ing.baseCalculationGroup
    ) {
      const comp = ing.component || "Base Recipe";
      const baseWeightG = componentBaseFlourWeightsG[comp] || 0;
      // Amount represents percentage (e.g. 60%)
      const weightG = baseWeightG * (ing.amount / 100);
      ingredientBaseWeightsG[ing.id] = weightG;
    }
  });

  // Calculate base total weight of the recipe
  const baseTotalWeightG = Object.values(ingredientBaseWeightsG).reduce(
    (a, b) => a + b,
    0,
  );

  // 2. Determine the scaling multiplier
  let multiplier = 1.0;

  if (
    options.customIngredientWeights &&
    Object.keys(options.customIngredientWeights).length > 0
  ) {
    // Scaled relative to a specific ingredient weight override (anchoring)
    const [anchorId, targetWeight] = Object.entries(
      options.customIngredientWeights,
    )[0];
    const anchorIng = ingredients.find((ing) => ing.id === anchorId);
    if (anchorIng) {
      const density = anchorIng.masterIngredient?.densityGMl ?? 1.0;
      const targetWeightG = convertUnit(
        targetWeight.amount,
        targetWeight.unit,
        "g",
        density,
      );
      const baseWeightG = ingredientBaseWeightsG[anchorId] ?? 0;

      if (baseWeightG > 0) {
        multiplier = targetWeightG / baseWeightG;
      }
    }
  } else if (options.targetVesselVolume && options.defaultVesselVolume) {
    // Scaled relative to vessel volumes
    multiplier = options.targetVesselVolume / options.defaultVesselVolume;
  } else if (options.targetTotalWeight && baseTotalWeightG > 0) {
    // Scaled relative to total weight
    multiplier = options.targetTotalWeight / baseTotalWeightG;
  } else if (options.targetYield) {
    // Scaled relative to portions
    multiplier = options.targetYield / baseYield;
  }

  // Prevent divide-by-zero or negative multiplier issues
  if (isNaN(multiplier) || !isFinite(multiplier) || multiplier <= 0) {
    multiplier = 1.0;
  }

  // 3. Map ingredients to scaled outputs
  const items = ingredients.map((ing): ScaledIngredientResult => {
    const density = ing.masterIngredient?.densityGMl ?? 1.0;
    const name =
      ing.masterIngredient?.name ?? ing.rawName ?? "Unknown Ingredient";

    let scaledAmount = 0;
    let scaledUnit = ing.unit;
    let weightInGrams = 0;
    let percentageOfBase: number | undefined;

    if (ing.baseCalculationGroup || ing.calculationType === "fixed_weight") {
      scaledAmount = ing.amount * multiplier;
      weightInGrams = (ingredientBaseWeightsG[ing.id] ?? 0) * multiplier;
    } else {
      // bakers_percentage
      percentageOfBase = ing.amount; // Percentage stays constant
      const comp = ing.component || "Base Recipe";
      const targetFlourG = (componentBaseFlourWeightsG[comp] || 0) * multiplier;
      weightInGrams = targetFlourG * (ing.amount / 100);

      // Baker's percentage units in DB is '%'. For display, we can either return weight in grams or %
      if (ing.unit === "%") {
        // Output calculated target weight in grams
        scaledAmount = weightInGrams;
        scaledUnit = "g";
      } else {
        // If they had a specific unit, convert from grams
        scaledAmount = convertUnit(weightInGrams, "g", ing.unit, density);
      }
    }

    return {
      ingredientId: ing.id,
      name,
      originalAmount: ing.amount,
      originalUnit: ing.unit,
      scaledAmount,
      scaledUnit,
      calculationType: ing.calculationType as
        "fixed_weight" | "bakers_percentage",
      baseCalculationGroup: ing.baseCalculationGroup,
      percentageOfBase,
      weightInGrams,
    };
  });

  return { multiplier, items };
}
