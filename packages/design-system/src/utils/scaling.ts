import { RecipeIngredient } from "@soustools/api-types";

// Standard conversion rates to base units:
// Weight base unit: g (grams)
// Volume base unit: ml (milliliters)
const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1.0,
  kg: 1000.0,
  oz: 28.349523125,
  lb: 453.59237,
};

const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1.0,
  l: 1000.0,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  gal: 3785.41,
  qt: 946.353,
};

const COUNT_UNITS = new Set(['each', 'case']);

/**
 * Converts a numeric amount from one unit of measurement to another.
 * Automatically handles mass-to-volume and volume-to-mass transitions using the ingredient density.
 *
 * @param amount The numerical value to convert
 * @param fromUnit The unit of the input amount
 * @param toUnit The target unit to convert to
 * @param densityGMl The density coefficient in grams per milliliter (default 1.0)
 * @param eachWeightG Optional weight in grams per single each unit
 * @param unitsPerCase Optional units per case for case conversion
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  densityGMl: number = 1.0,
  eachWeightG?: number,
  unitsPerCase?: number
): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  // Handle count units (each, case) → grams conversion
  if (COUNT_UNITS.has(from)) {
    if (eachWeightG === undefined || eachWeightG <= 0) {
      throw new Error(`Unit "${fromUnit}" requires eachWeightG to convert to mass/volume`);
    }
    const totalG =
      from === 'case'
        ? amount * (unitsPerCase ?? 1) * eachWeightG
        : amount * eachWeightG;
    if (to === 'g') return totalG;
    if (WEIGHT_CONVERSIONS[to] !== undefined) return totalG / WEIGHT_CONVERSIONS[to];
    if (VOLUME_CONVERSIONS[to] !== undefined) return (totalG / densityGMl) / VOLUME_CONVERSIONS[to];
    return totalG;
  }

  if (from === to) {
    return amount;
  }

  // Count/percentage units do not support conversion to mass/volume directly
  if (from === "count" || to === "count" || from === "%" || to === "%") {
    if (from === "count" && to === "count") return amount;
    if (from === "%" && to === "%") return amount;
    // Fallback if trying to convert incompatible units
    return amount;
  }

  const isFromWeight = from in WEIGHT_CONVERSIONS;
  const isFromVolume = from in VOLUME_CONVERSIONS;
  const isToWeight = to in WEIGHT_CONVERSIONS;
  const isToVolume = to in VOLUME_CONVERSIONS;

  if (!((isFromWeight || isFromVolume) && (isToWeight || isToVolume))) {
    return amount; // Unsupported units
  }

  // 1. Convert source to its base unit
  let baseAmount = amount;
  let isBaseWeight = isFromWeight;

  if (isFromWeight) {
    baseAmount = amount * WEIGHT_CONVERSIONS[from];
  } else {
    baseAmount = amount * VOLUME_CONVERSIONS[from];
  }

  // 2. Convert base unit if cross-dimension (weight <-> volume)
  if (isBaseWeight && isToVolume) {
    // Grams to Milliliters: ml = g / density
    baseAmount = baseAmount / densityGMl;
    isBaseWeight = false;
  } else if (!isBaseWeight && isToWeight) {
    // Milliliters to Grams: g = ml * density
    baseAmount = baseAmount * densityGMl;
    isBaseWeight = true;
  }

  // 3. Convert base unit to target unit
  if (isBaseWeight) {
    return baseAmount / WEIGHT_CONVERSIONS[to];
  } else {
    return baseAmount / VOLUME_CONVERSIONS[to];
  }
}

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
  weightInGrams: number;      // Calculated final weight in grams
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
  }
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
        componentBaseFlourWeightsG[comp] = (componentBaseFlourWeightsG[comp] || 0) + weightG;
      }
    }
  });

  // Resolve baker's percentage values based on base flour weight
  ingredients.forEach((ing) => {
    if (ing.calculationType === "bakers_percentage" && !ing.baseCalculationGroup) {
      const comp = ing.component || "Base Recipe";
      const baseWeightG = componentBaseFlourWeightsG[comp] || 0;
      // Amount represents percentage (e.g. 60%)
      const weightG = baseWeightG * (ing.amount / 100);
      ingredientBaseWeightsG[ing.id] = weightG;
    }
  });

  // Calculate base total weight of the recipe
  const baseTotalWeightG = Object.values(ingredientBaseWeightsG).reduce((a, b) => a + b, 0);

  // 2. Determine the scaling multiplier
  let multiplier = 1.0;

  if (options.customIngredientWeights && Object.keys(options.customIngredientWeights).length > 0) {
    // Scaled relative to a specific ingredient weight override (anchoring)
    const [anchorId, targetWeight] = Object.entries(options.customIngredientWeights)[0];
    const anchorIng = ingredients.find((ing) => ing.id === anchorId);
    if (anchorIng) {
      const density = anchorIng.masterIngredient?.densityGMl ?? 1.0;
      const targetWeightG = convertUnit(targetWeight.amount, targetWeight.unit, "g", density);
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
    const name = ing.masterIngredient?.name ?? ing.rawName ?? "Unknown Ingredient";

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
      calculationType: ing.calculationType,
      baseCalculationGroup: ing.baseCalculationGroup,
      percentageOfBase,
      weightInGrams,
    };
  });

  return { multiplier, items };
}
