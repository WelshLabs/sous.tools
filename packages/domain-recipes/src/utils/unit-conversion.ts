import { lookupEncyclopedia } from "./culinary-encyclopedia";

// Standard conversion rates to base units:
// Weight base unit: g (grams)
// Volume base unit: ml (milliliters)
export const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1.0,
  kg: 1000.0,
  oz: 28.349523125,
  lb: 453.59237,
};

export const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1.0,
  l: 1000.0,
  tsp: 4.92892,
  tbsp: 14.7868,
  "fl oz": 29.5735,
  fl_oz: 29.5735,
  cup: 236.588,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,
};

export const COUNT_UNITS = new Set([
  "ea",
  "each",
  "count",
  "piece",
  "pieces",
  "pcs",
  "pc",
  "clove",
  "cloves",
  "head",
  "heads",
  "stalk",
  "stalks",
  "slice",
  "slices",
  "sprig",
  "sprigs",
  "leaf",
  "leaves",
  "bunch",
  "bunches",
  "can",
  "cans",
  "package",
  "packages",
  "bottle",
  "bottles",
  "stick",
  "sticks",
  "pinch",
  "pinches",
  "dash",
  "dashes",
  "drop",
  "drops",
  "pod",
  "pods",
  "case",
]);

/**
 * Converts a numeric amount from one unit of measurement to another.
 * Automatically handles mass-to-volume and volume-to-mass transitions using the ingredient density.
 * Also seamlessly handles count-to-weight conversions using the culinary encyclopedia when applicable.
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  densityGMl: number = 1.0,
  eachWeightG?: number,
  unitsPerCase?: number,
  ingredientName?: string,
): number {
  const from = fromUnit.toLowerCase().trim();
  const to = toUnit.toLowerCase().trim();

  if (from === to) {
    return amount;
  }

  // Handle count units (each, ea, case, clove, etc.) → grams / weight / volume conversion
  if (COUNT_UNITS.has(from)) {
    let resolvedWeightG = eachWeightG;
    if (
      (resolvedWeightG === undefined || resolvedWeightG <= 0) &&
      ingredientName
    ) {
      const entry = lookupEncyclopedia(ingredientName);
      if (entry?.standardPieceWeightG) {
        resolvedWeightG = entry.standardPieceWeightG;
      }
    }

    if (resolvedWeightG !== undefined && resolvedWeightG > 0) {
      const totalG =
        from === "case"
          ? amount * (unitsPerCase ?? 1) * resolvedWeightG
          : amount * resolvedWeightG;
      if (to === "g") return totalG;
      if (WEIGHT_CONVERSIONS[to] !== undefined)
        return totalG / WEIGHT_CONVERSIONS[to];
      if (VOLUME_CONVERSIONS[to] !== undefined)
        return totalG / densityGMl / VOLUME_CONVERSIONS[to];
      return totalG;
    }

    // Fallback if no piece weight is known
    return amount;
  }

  // Count/percentage units do not support conversion to mass/volume directly without piece weight
  if (from === "%" || to === "%") {
    return amount;
  }

  const isFromWeight = from in WEIGHT_CONVERSIONS;
  const isFromVolume = from in VOLUME_CONVERSIONS;
  const isToWeight = to in WEIGHT_CONVERSIONS;
  const isToVolume = to in VOLUME_CONVERSIONS;

  if (!((isFromWeight || isFromVolume) && (isToWeight || isToVolume))) {
    return amount;
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
    baseAmount = baseAmount / densityGMl;
    isBaseWeight = false;
  } else if (!isBaseWeight && isToWeight) {
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
