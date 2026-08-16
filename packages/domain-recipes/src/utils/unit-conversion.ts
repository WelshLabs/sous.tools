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
  cup: 236.588,
  gal: 3785.41,
  qt: 946.353,
};

export const COUNT_UNITS = new Set(["each", "case"]);

/**
 * Converts a numeric amount from one unit of measurement to another.
 * Automatically handles mass-to-volume and volume-to-mass transitions using the ingredient density.
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  densityGMl: number = 1.0,
  eachWeightG?: number,
  unitsPerCase?: number,
): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  // Handle count units (each, case) → grams conversion
  if (COUNT_UNITS.has(from)) {
    if (eachWeightG === undefined || eachWeightG <= 0) {
      console.warn(
        `Unit "${fromUnit}" requires eachWeightG to convert to mass/volume. Using fallback.`,
      );
      return amount;
    }
    const totalG =
      from === "case"
        ? amount * (unitsPerCase ?? 1) * eachWeightG
        : amount * eachWeightG;
    if (to === "g") return totalG;
    if (WEIGHT_CONVERSIONS[to] !== undefined)
      return totalG / WEIGHT_CONVERSIONS[to];
    if (VOLUME_CONVERSIONS[to] !== undefined)
      return totalG / densityGMl / VOLUME_CONVERSIONS[to];
    return totalG;
  }

  if (from === to) {
    return amount;
  }

  // Count/percentage units do not support conversion to mass/volume directly
  if (from === "count" || to === "count" || from === "%" || to === "%") {
    if (from === "count" && to === "count") return amount;
    if (from === "%" && to === "%") return amount;
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
