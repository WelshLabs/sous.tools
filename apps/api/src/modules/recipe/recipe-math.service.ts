import { Injectable } from "@nestjs/common";
import {
  BakersFormulaSummary,
  CalculationType,
  CulinaryEncyclopediaEntry,
  EstimatedWeightResult,
} from "@soustools/api-types";
import {
  CULINARY_ENCYCLOPEDIA,
  normalizeEncyclopediaName,
} from "./culinary-encyclopedia.data";

export const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1.0,
  gram: 1.0,
  grams: 1.0,
  kg: 1000.0,
  kilogram: 1000.0,
  kilograms: 1000.0,
  oz: 28.349523125,
  ounce: 28.349523125,
  ounces: 28.349523125,
  lb: 453.59237,
  lbs: 453.59237,
  pound: 453.59237,
  pounds: 453.59237,
  mg: 0.001,
  milligram: 0.001,
  milligrams: 0.001,
};

export const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1.0,
  milliliter: 1.0,
  milliliters: 1.0,
  l: 1000.0,
  liter: 1000.0,
  liters: 1000.0,
  litre: 1000.0,
  litres: 1000.0,
  tsp: 4.92892,
  teaspoon: 4.92892,
  teaspoons: 4.92892,
  tbsp: 14.7868,
  tablespoon: 14.7868,
  tablespoons: 14.7868,
  "fl oz": 29.5735,
  fl_oz: 29.5735,
  floz: 29.5735,
  "fluid ounce": 29.5735,
  "fluid ounces": 29.5735,
  cup: 236.588,
  cups: 236.588,
  pt: 473.176,
  pint: 473.176,
  pints: 473.176,
  qt: 946.353,
  quart: 946.353,
  quarts: 946.353,
  gal: 3785.41,
  gallon: 3785.41,
  gallons: 3785.41,
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
  "pkg",
  "pkgs",
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
  "cases",
]);

export const BUNCH_UNITS = new Set(["bunch", "bunches", "head", "heads"]);

export const PERCENTAGE_UNITS = new Set([
  "%",
  "percent",
  "percentage",
  "pct",
  "bakers_percentage",
]);

const LIQUID_KEYWORDS = [
  "water",
  "milk",
  "juice",
  "liquid",
  "beer",
  "cider",
  "wine",
  "stock",
  "broth",
  "cream",
  "buttermilk",
  "whey",
  "oil",
];

const FLOUR_KEYWORDS = [
  "flour",
  "meal",
  "farina",
  "semolina",
  "rye",
  "spelt",
  "masa",
];

export interface StandardWeightCalculationParams {
  name: string;
  amount: number;
  unit: string;
  densityGMl?: number | null;
  eachWeightG?: number | null;
  unitsPerCase?: number | null;
}

export interface NormalizedIngredientMath {
  id?: string | null;
  rawName: string;
  originalInputString: string;
  amount: number;
  unit: string;
  standardAmount: number;
  standardUnit: string;
  standardWeightG: number;
  calculationType: "fixed_weight" | "bakers_percentage";
  isReference: boolean;
  baseCalculationGroup: boolean;
  bakersPercentage: number | null;
  component?: string | null;
  masterIngredientId?: string | null;
  prepNotes?: string | null;
}

@Injectable()
export class RecipeMathService {
  /**
   * Maps a string unit representation to its canonical CalculationType:
   * "fixed_weight" | "fixed_volume" | "each" | "bakers_percentage"
   */
  determineCalculationType(unit: string): CalculationType {
    if (!unit) return "fixed_weight";
    const cleanUnit = unit.toLowerCase().trim().replace(/\./g, "");

    if (PERCENTAGE_UNITS.has(cleanUnit)) {
      return "bakers_percentage";
    }

    if (cleanUnit in WEIGHT_CONVERSIONS) {
      return "fixed_weight";
    }

    if (cleanUnit in VOLUME_CONVERSIONS) {
      return "fixed_volume";
    }

    if (COUNT_UNITS.has(cleanUnit)) {
      return "each";
    }

    return "fixed_weight";
  }

  /**
   * Looks up an entry in the Culinary Encyclopedia by name or alias.
   */
  lookupEncyclopedia(nameOrRaw: string): CulinaryEncyclopediaEntry | null {
    if (!nameOrRaw) return null;
    const clean = normalizeEncyclopediaName(nameOrRaw);
    if (!clean) return null;

    // 1. Exact alias match
    for (const entry of CULINARY_ENCYCLOPEDIA) {
      if (
        entry.aliases.some(
          (alias) => normalizeEncyclopediaName(alias) === clean,
        )
      ) {
        return entry;
      }
    }

    // 2. Substring matching (e.g. "large brown eggs" -> "egg-large", "scallions green onions" -> "scallion")
    for (const entry of CULINARY_ENCYCLOPEDIA) {
      for (const alias of entry.aliases) {
        const normAlias = normalizeEncyclopediaName(alias);
        if (clean.includes(normAlias) || normAlias.includes(clean)) {
          return entry;
        }
      }
    }

    return null;
  }

  /**
   * Calculates estimated weight in grams and culinary breakdown for any ingredient amount & unit.
   */
  getEstimatedWeight(
    ingredientName: string,
    amount: number,
    unit: string,
    customDensityGMl?: number | null,
  ): EstimatedWeightResult | null {
    if (amount <= 0) return null;

    const normalizedUnit = (unit || "").toLowerCase().trim().replace(/\./g, "");
    const entry = this.lookupEncyclopedia(ingredientName);

    // If unit is a bunch unit and encyclopedia has bunch weight
    if (BUNCH_UNITS.has(normalizedUnit) && entry?.standardBunchWeightG) {
      const totalWeight = amount * entry.standardBunchWeightG;
      return {
        totalWeightG: Number(totalWeight.toFixed(1)),
        unitWeightG: entry.standardBunchWeightG,
        breakdownSummary: entry.pieceBreakdown?.summary,
        subComponents: entry.pieceBreakdown?.subComponents,
        confidence: "high",
      };
    }

    // If unit is count / piece / clove / stalk / sprig / etc.
    if (COUNT_UNITS.has(normalizedUnit) && entry?.standardPieceWeightG) {
      const totalWeight = amount * entry.standardPieceWeightG;
      return {
        totalWeightG: Number(totalWeight.toFixed(1)),
        unitWeightG: entry.standardPieceWeightG,
        breakdownSummary: entry.pieceBreakdown?.summary,
        subComponents: entry.pieceBreakdown?.subComponents,
        confidence: "high",
      };
    }

    // Volumetric weight if volume unit
    if (normalizedUnit in VOLUME_CONVERSIONS) {
      const density = customDensityGMl || entry?.densityGMl || 1.0;
      const volumeMl = amount * VOLUME_CONVERSIONS[normalizedUnit];
      const totalWeight = volumeMl * density;
      return {
        totalWeightG: Number(totalWeight.toFixed(1)),
        unitWeightG: Number(
          (VOLUME_CONVERSIONS[normalizedUnit] * density).toFixed(1),
        ),
        confidence: entry?.densityGMl ? "high" : "estimated",
      };
    }

    // Direct mass conversion
    if (normalizedUnit in WEIGHT_CONVERSIONS) {
      const totalWeight = amount * WEIGHT_CONVERSIONS[normalizedUnit];
      return {
        totalWeightG: Number(totalWeight.toFixed(1)),
        unitWeightG: WEIGHT_CONVERSIONS[normalizedUnit],
        confidence: "exact",
      };
    }

    return null;
  }

  /**
   * Converts a given amount and unit of an ingredient into standardized weight in grams.
   */
  calculateStandardWeightG(params: StandardWeightCalculationParams): number {
    const { name, amount, unit, densityGMl, eachWeightG, unitsPerCase } =
      params;
    if (amount <= 0) return 0;

    const cleanUnit = (unit || "").toLowerCase().trim().replace(/\./g, "");
    const calcType = this.determineCalculationType(cleanUnit);

    if (calcType === "fixed_weight") {
      const factor = WEIGHT_CONVERSIONS[cleanUnit] || 1.0;
      return Number((amount * factor).toFixed(2));
    }

    if (calcType === "fixed_volume") {
      const volumeMl = amount * (VOLUME_CONVERSIONS[cleanUnit] || 1.0);
      const density =
        densityGMl && densityGMl > 0
          ? densityGMl
          : this.lookupEncyclopedia(name)?.densityGMl || 1.0;
      return Number((volumeMl * density).toFixed(2));
    }

    if (calcType === "each") {
      // 1. Explicit override if provided
      if (eachWeightG && eachWeightG > 0) {
        const multiplier =
          cleanUnit === "case" || cleanUnit === "cases" ? unitsPerCase || 1 : 1;
        return Number((amount * multiplier * eachWeightG).toFixed(2));
      }

      // 2. Culinary Encyclopedia lookup
      const est = this.getEstimatedWeight(name, amount, cleanUnit, densityGMl);
      if (est && est.totalWeightG > 0) {
        return est.totalWeightG;
      }

      // 3. Fallback: if no piece weight is known, assume unit weight is 1g or return raw amount
      return amount;
    }

    return 0;
  }

  /**
   * Converts an amount between arbitrary culinary units.
   */
  convertUnit(
    amount: number,
    fromUnit: string,
    toUnit: string,
    densityGMl: number = 1.0,
    eachWeightG?: number | null,
    unitsPerCase?: number | null,
    ingredientName?: string,
  ): number {
    const from = (fromUnit || "").toLowerCase().trim().replace(/\./g, "");
    const to = (toUnit || "").toLowerCase().trim().replace(/\./g, "");

    if (from === to) return amount;

    // Convert from -> grams first
    const weightG = this.calculateStandardWeightG({
      name: ingredientName || "",
      amount,
      unit: from,
      densityGMl,
      eachWeightG,
      unitsPerCase,
    });

    if (to === "g" || to === "gram" || to === "grams") {
      return weightG;
    }

    if (to in WEIGHT_CONVERSIONS) {
      return weightG / WEIGHT_CONVERSIONS[to];
    }

    if (to in VOLUME_CONVERSIONS) {
      const volumeMl = weightG / (densityGMl || 1.0);
      return volumeMl / VOLUME_CONVERSIONS[to];
    }

    return amount;
  }

  /**
   * Calculates Baker's formula metrics across a set of recipe ingredients.
   */
  calculateBakersFormula(
    ingredients: Array<{
      id?: string | null;
      name: string;
      amount: number;
      unit: string;
      densityGMl?: number | null;
      calculationType?: string | null;
      isReference?: boolean | null;
      baseCalculationGroup?: boolean | null;
      component?: string | null;
      prepNotes?: string | null;
    }>,
  ): {
    items: Array<{
      id?: string | null;
      name: string;
      originalAmount: number;
      originalUnit: string;
      standardWeightG: number;
      calculationType: "fixed_weight" | "bakers_percentage";
      isReference: boolean;
      baseCalculationGroup: boolean;
      bakersPercentage: number | null;
      component?: string | null;
    }>;
    summary: BakersFormulaSummary;
  } {
    if (!ingredients || ingredients.length === 0) {
      return {
        items: [],
        summary: {
          totalFlourWeightG: 0,
          totalLiquidWeightG: 0,
          hydrationPercentage: 0,
          totalFormulaPercentage: 0,
          isBakersRecipe: false,
        },
      };
    }

    // 1. Calculate standard weight in grams for every ingredient
    const calculatedWeights: Array<{
      ing: (typeof ingredients)[0];
      weightG: number;
      isExplicitRef: boolean;
      isFlour: boolean;
      isLiquid: boolean;
    }> = ingredients.map((ing) => {
      const weightG = this.calculateStandardWeightG({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit,
        densityGMl: ing.densityGMl,
      });

      const lowerName = (ing.name || "").toLowerCase();
      const isExplicitRef = Boolean(
        ing.isReference || ing.baseCalculationGroup,
      );
      const isFlour = FLOUR_KEYWORDS.some((kw) => lowerName.includes(kw));
      const isLiquid = LIQUID_KEYWORDS.some((kw) => lowerName.includes(kw));

      return { ing, weightG, isExplicitRef, isFlour, isLiquid };
    });

    // 2. Identify base reference ingredient (flour / base calculation group)
    const hasExplicitRef = calculatedWeights.some((item) => item.isExplicitRef);
    const hasFlourRef = calculatedWeights.some(
      (item) => item.isFlour && item.weightG > 0,
    );

    let totalFlourWeightG = 0;
    let totalLiquidWeightG = 0;

    calculatedWeights.forEach((item) => {
      let isRef = false;
      if (hasExplicitRef) {
        isRef = item.isExplicitRef;
      } else if (hasFlourRef) {
        isRef = item.isFlour;
      }

      if (isRef) {
        totalFlourWeightG += item.weightG;
      }
      if (item.isLiquid) {
        totalLiquidWeightG += item.weightG;
      }
    });

    // Fallback: If no explicit ref or flour, and there are ingredients, use first ingredient if bakers percentage requested
    if (totalFlourWeightG === 0 && calculatedWeights.length > 0) {
      const anyBakers = ingredients.some(
        (i) => i.calculationType === "bakers_percentage" || i.unit === "%",
      );
      if (anyBakers && calculatedWeights[0].weightG > 0) {
        totalFlourWeightG = calculatedWeights[0].weightG;
      }
    }

    // 3. Map to final normalized items with Baker's %
    let totalFormulaWeightG = 0;

    const items = calculatedWeights.map(
      ({ ing, weightG, isExplicitRef, isFlour }) => {
        let isReference = false;
        if (hasExplicitRef) {
          isReference = isExplicitRef;
        } else if (hasFlourRef) {
          isReference = isFlour;
        } else if (totalFlourWeightG > 0 && ing === ingredients[0]) {
          isReference = true;
        }

        let bakersPercentage: number | null = null;
        if (isReference) {
          bakersPercentage = 100.0;
        } else if (totalFlourWeightG > 0) {
          bakersPercentage = Number(
            ((weightG / totalFlourWeightG) * 100).toFixed(2),
          );
        }

        totalFormulaWeightG += weightG;

        return {
          id: ing.id,
          name: ing.name,
          originalAmount: ing.amount,
          originalUnit: ing.unit,
          standardWeightG: weightG,
          calculationType: (isReference ||
          ing.calculationType === "bakers_percentage"
            ? "bakers_percentage"
            : "fixed_weight") as "fixed_weight" | "bakers_percentage",
          isReference,
          baseCalculationGroup: isReference,
          bakersPercentage,
          component: ing.component || null,
        };
      },
    );

    const isBakersRecipe =
      totalFlourWeightG > 0 ||
      ingredients.some((i) => i.calculationType === "bakers_percentage");
    const hydrationPercentage =
      totalFlourWeightG > 0
        ? Number(((totalLiquidWeightG / totalFlourWeightG) * 100).toFixed(1))
        : 0;
    const totalFormulaPercentage =
      totalFlourWeightG > 0
        ? Number(((totalFormulaWeightG / totalFlourWeightG) * 100).toFixed(1))
        : 100;

    return {
      items,
      summary: {
        totalFlourWeightG: Math.round(totalFlourWeightG),
        totalLiquidWeightG: Math.round(totalLiquidWeightG),
        hydrationPercentage,
        totalFormulaPercentage,
        isBakersRecipe,
      },
    };
  }

  /**
   * Normalizes a batch of recipe ingredients for database ingestion / persistence.
   * Converts raw pieces/bunches into standardized gram weights during database insertion.
   */
  normalizeRecipeIngredients<
    T extends {
      id?: string | null;
      rawName?: string | null;
      name?: string | null;
      amount?: number | null;
      quantity?: number | null;
      unit?: string | null;
      rawString?: string | null;
      originalInputString?: string | null;
      isReference?: boolean | null;
      baseCalculationGroup?: boolean | null;
      calculationType?: string | null;
      densityGMl?: number | null;
      component?: string | null;
      masterIngredientId?: string | null;
      selectedTenantId?: string | null;
      prepNotes?: string | null;
    },
  >(rawIngredients: T[]): NormalizedIngredientMath[] {
    if (!rawIngredients || rawIngredients.length === 0) return [];

    const preparedList = rawIngredients.map((raw) => {
      const name = (raw.name || raw.rawName || "Ingredient").trim();
      const amount = Number(raw.amount ?? raw.quantity ?? 1);
      const unit = (raw.unit || "g").trim();

      const originalInputString =
        raw.originalInputString ||
        raw.rawString ||
        `${amount} ${unit} ${name}`.trim();

      return {
        ...raw,
        name,
        amount,
        unit,
        originalInputString,
      };
    });

    const { items } = this.calculateBakersFormula(
      preparedList.map((p) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        unit: p.unit,
        densityGMl: p.densityGMl,
        calculationType: p.calculationType,
        isReference: p.isReference,
        baseCalculationGroup: p.baseCalculationGroup,
        component: p.component,
      })),
    );

    return preparedList.map((p, idx) => {
      const mathItem = items[idx];
      const calcType = this.determineCalculationType(p.unit);

      // If unit is count or piece or bunch or volume, convert to standardized grams
      const isCountOrVolume =
        calcType === "each" || calcType === "fixed_volume";
      const standardAmount =
        isCountOrVolume && mathItem.standardWeightG > 0
          ? mathItem.standardWeightG
          : p.amount;
      const standardUnit =
        isCountOrVolume && mathItem.standardWeightG > 0 ? "g" : p.unit;

      return {
        id: p.id,
        rawName: p.name,
        originalInputString: p.originalInputString,
        amount: p.amount,
        unit: p.unit,
        standardAmount,
        standardUnit,
        standardWeightG: mathItem.standardWeightG,
        calculationType: mathItem.calculationType,
        isReference: mathItem.isReference,
        baseCalculationGroup: mathItem.baseCalculationGroup,
        bakersPercentage: mathItem.bakersPercentage,
        component: p.component || null,
        masterIngredientId: p.masterIngredientId || p.selectedTenantId || null,
        prepNotes: p.prepNotes || null,
      };
    });
  }
}
