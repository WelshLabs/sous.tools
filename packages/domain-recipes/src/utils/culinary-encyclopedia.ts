/* eslint-disable max-lines */
/**
 * Culinary Encyclopedia & Unit Estimation SSOT
 *
 * Provides standardized culinary knowledge for ingredient weights, sub-component breakdowns,
 * volumetric densities, and piece-to-weight conversions (e.g., eggs, garlic cloves, lemons, onions).
 */

export interface SubComponentBreakdown {
  name: string;
  weightG: number;
}

export interface CulinaryEncyclopediaEntry {
  id: string;
  name: string;
  aliases: string[];
  category:
    | "egg"
    | "produce"
    | "dairy"
    | "meat"
    | "poultry"
    | "seafood"
    | "baking"
    | "seasoning"
    | "liquid"
    | "pantry";
  standardPieceWeightG?: number; // Average edible piece weight in grams
  pieceBreakdown?: {
    summary: string;
    subComponents?: SubComponentBreakdown[];
  };
  densityGMl?: number;
  typicalUnits: string[];
}

export const CULINARY_ENCYCLOPEDIA: CulinaryEncyclopediaEntry[] = [
  // --- EGGS & POULTRY ---
  {
    id: "egg-large",
    name: "Large Egg",
    aliases: [
      "egg",
      "eggs",
      "large egg",
      "large eggs",
      "whole egg",
      "whole eggs",
      "lg egg",
      "lg eggs",
      "fresh egg",
      "fresh eggs",
    ],
    category: "egg",
    standardPieceWeightG: 50,
    pieceBreakdown: {
      summary: "~50g edible (~20g yolk, ~30g white)",
      subComponents: [
        { name: "Egg Yolk", weightG: 20 },
        { name: "Egg White", weightG: 30 },
      ],
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "egg-medium",
    name: "Medium Egg",
    aliases: ["medium egg", "medium eggs", "med egg", "med eggs"],
    category: "egg",
    standardPieceWeightG: 44,
    pieceBreakdown: {
      summary: "~44g edible (~18g yolk, ~26g white)",
      subComponents: [
        { name: "Egg Yolk", weightG: 18 },
        { name: "Egg White", weightG: 26 },
      ],
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "egg-extra-large",
    name: "Extra Large Egg",
    aliases: [
      "extra large egg",
      "extra large eggs",
      "xl egg",
      "xl eggs",
      "jumbo egg",
      "jumbo eggs",
    ],
    category: "egg",
    standardPieceWeightG: 56,
    pieceBreakdown: {
      summary: "~56g edible (~22g yolk, ~34g white)",
      subComponents: [
        { name: "Egg Yolk", weightG: 22 },
        { name: "Egg White", weightG: 34 },
      ],
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "egg-yolk",
    name: "Egg Yolk",
    aliases: ["egg yolk", "egg yolks", "yolk", "yolks"],
    category: "egg",
    standardPieceWeightG: 20,
    pieceBreakdown: {
      summary: "~20g per yolk",
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "egg-white",
    name: "Egg White",
    aliases: ["egg white", "egg whites", "white", "whites"],
    category: "egg",
    standardPieceWeightG: 30,
    pieceBreakdown: {
      summary: "~30g per white",
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "g"],
  },

  // --- ALLIUMS & AROMATICS ---
  {
    id: "garlic-clove",
    name: "Garlic Clove",
    aliases: [
      "garlic clove",
      "garlic cloves",
      "clove garlic",
      "cloves garlic",
      "garlic",
    ],
    category: "produce",
    standardPieceWeightG: 4,
    pieceBreakdown: {
      summary: "~4g per peeled clove (range 3-5g)",
    },
    densityGMl: 0.95,
    typicalUnits: ["clove", "cloves", "ea", "each", "g"],
  },
  {
    id: "garlic-head",
    name: "Garlic Head / Bulb",
    aliases: ["garlic head", "garlic bulb", "head of garlic", "bulb of garlic"],
    category: "produce",
    standardPieceWeightG: 45,
    pieceBreakdown: {
      summary: "~45g (~10-12 cloves)",
    },
    typicalUnits: ["head", "heads", "ea", "each", "g"],
  },
  {
    id: "onion-medium",
    name: "Yellow / White Onion (Medium)",
    aliases: [
      "onion",
      "onions",
      "medium onion",
      "yellow onion",
      "white onion",
      "med onion",
    ],
    category: "produce",
    standardPieceWeightG: 150,
    pieceBreakdown: {
      summary: "~150g whole (~110g chopped / ~1 cup)",
    },
    densityGMl: 0.95,
    typicalUnits: ["ea", "each", "count", "g", "cup"],
  },
  {
    id: "onion-large",
    name: "Large Onion",
    aliases: [
      "large onion",
      "lg onion",
      "large yellow onion",
      "large white onion",
    ],
    category: "produce",
    standardPieceWeightG: 250,
    pieceBreakdown: {
      summary: "~250g whole (~190g chopped / ~1.5 cups)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "onion-red",
    name: "Red Onion (Medium)",
    aliases: ["red onion", "red onions", "medium red onion"],
    category: "produce",
    standardPieceWeightG: 160,
    pieceBreakdown: {
      summary: "~160g whole (~120g chopped)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "shallot",
    name: "Shallot",
    aliases: ["shallot", "shallots", "medium shallot"],
    category: "produce",
    standardPieceWeightG: 25,
    pieceBreakdown: {
      summary: "~25g per peeled shallot (~2 tbsp minced)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "scallion",
    name: "Scallion / Green Onion",
    aliases: [
      "scallion",
      "scallions",
      "green onion",
      "green onions",
      "spring onion",
    ],
    category: "produce",
    standardPieceWeightG: 15,
    pieceBreakdown: {
      summary: "~15g per stalk (~2 tbsp sliced)",
    },
    typicalUnits: ["stalk", "stalks", "ea", "each", "bunch", "g"],
  },

  // --- CITRUS & FRUITS ---
  {
    id: "lemon",
    name: "Lemon (Medium)",
    aliases: ["lemon", "lemons", "medium lemon", "fresh lemon"],
    category: "produce",
    standardPieceWeightG: 100,
    pieceBreakdown: {
      summary: "~100g whole (~45g / 3 tbsp juice, ~6g zest)",
      subComponents: [
        { name: "Lemon Juice", weightG: 45 },
        { name: "Lemon Zest", weightG: 6 },
      ],
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "tbsp", "g"],
  },
  {
    id: "lime",
    name: "Lime (Medium)",
    aliases: ["lime", "limes", "medium lime", "fresh lime"],
    category: "produce",
    standardPieceWeightG: 67,
    pieceBreakdown: {
      summary: "~67g whole (~30g / 2 tbsp juice, ~4g zest)",
      subComponents: [
        { name: "Lime Juice", weightG: 30 },
        { name: "Lime Zest", weightG: 4 },
      ],
    },
    densityGMl: 1.03,
    typicalUnits: ["ea", "each", "count", "tbsp", "g"],
  },
  {
    id: "orange",
    name: "Orange (Medium)",
    aliases: ["orange", "oranges", "medium orange", "navel orange"],
    category: "produce",
    standardPieceWeightG: 140,
    pieceBreakdown: {
      summary: "~140g whole (~75g juice / 1/3 cup, ~10g zest)",
      subComponents: [
        { name: "Orange Juice", weightG: 75 },
        { name: "Orange Zest", weightG: 10 },
      ],
    },
    densityGMl: 1.04,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "avocado",
    name: "Avocado (Medium Hass)",
    aliases: ["avocado", "avocados", "hass avocado", "medium avocado"],
    category: "produce",
    standardPieceWeightG: 150,
    pieceBreakdown: {
      summary: "~150g edible flesh (~200g whole with pit/skin)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "banana",
    name: "Banana (Medium)",
    aliases: ["banana", "bananas", "medium banana"],
    category: "produce",
    standardPieceWeightG: 118,
    pieceBreakdown: {
      summary: "~118g peeled flesh (~150g whole)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "apple",
    name: "Apple (Medium)",
    aliases: [
      "apple",
      "apples",
      "medium apple",
      "honeycrisp apple",
      "granny smith apple",
    ],
    category: "produce",
    standardPieceWeightG: 180,
    pieceBreakdown: {
      summary: "~180g whole (~150g cored/peeled)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },

  // --- VEGETABLES ---
  {
    id: "potato-medium",
    name: "Russet / Yukon Potato (Medium)",
    aliases: [
      "potato",
      "potatoes",
      "medium potato",
      "russet potato",
      "yukon gold potato",
    ],
    category: "produce",
    standardPieceWeightG: 213,
    pieceBreakdown: {
      summary: "~213g whole (~170g peeled/diced / ~1 cup)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "carrot-medium",
    name: "Carrot (Medium)",
    aliases: ["carrot", "carrots", "medium carrot"],
    category: "produce",
    standardPieceWeightG: 61,
    pieceBreakdown: {
      summary: "~61g whole (~50g peeled/chopped / ~1/2 cup)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "celery-stalk",
    name: "Celery (Stalk / Rib)",
    aliases: [
      "celery",
      "celery stalk",
      "celery rib",
      "rib of celery",
      "stalk of celery",
    ],
    category: "produce",
    standardPieceWeightG: 40,
    pieceBreakdown: {
      summary: "~40g per medium stalk (~1/3 cup chopped)",
    },
    typicalUnits: ["stalk", "stalks", "ea", "each", "g"],
  },
  {
    id: "tomato-medium",
    name: "Tomato (Medium)",
    aliases: [
      "tomato",
      "tomatoes",
      "medium tomato",
      "vine tomato",
      "roma tomato",
    ],
    category: "produce",
    standardPieceWeightG: 123,
    pieceBreakdown: {
      summary: "~123g whole (~1 cup chopped)",
    },
    densityGMl: 0.98,
    typicalUnits: ["ea", "each", "count", "g"],
  },
  {
    id: "bell-pepper",
    name: "Bell Pepper (Medium)",
    aliases: [
      "bell pepper",
      "bell peppers",
      "red bell pepper",
      "green bell pepper",
      "yellow bell pepper",
    ],
    category: "produce",
    standardPieceWeightG: 120,
    pieceBreakdown: {
      summary: "~120g seeded/stemmed (~1 cup chopped)",
    },
    typicalUnits: ["ea", "each", "count", "g"],
  },

  // --- HERBS, SPICES & AROMATICS ---
  {
    id: "bay-leaf",
    name: "Bay Leaf (Dried)",
    aliases: ["bay leaf", "bay leaves", "dried bay leaf", "dried bay leaves"],
    category: "seasoning",
    standardPieceWeightG: 0.2,
    pieceBreakdown: {
      summary: "~0.2g per dried leaf",
    },
    typicalUnits: ["leaf", "leaves", "ea", "each", "count"],
  },
  {
    id: "vanilla-bean",
    name: "Vanilla Bean Pod",
    aliases: [
      "vanilla bean",
      "vanilla beans",
      "vanilla pod",
      "vanilla bean pod",
    ],
    category: "seasoning",
    standardPieceWeightG: 3.5,
    pieceBreakdown: {
      summary: "~3.5g per pod (~1-1.5g seeds / caviar)",
    },
    typicalUnits: ["pod", "pods", "ea", "each", "g"],
  },
  {
    id: "thyme-sprig",
    name: "Fresh Thyme Sprig",
    aliases: ["thyme sprig", "sprig of thyme", "thyme sprigs", "fresh thyme"],
    category: "seasoning",
    standardPieceWeightG: 0.5,
    pieceBreakdown: {
      summary: "~0.5g per sprig (~0.2g picked leaves)",
    },
    typicalUnits: ["sprig", "sprigs", "ea", "each", "g"],
  },
  {
    id: "rosemary-sprig",
    name: "Fresh Rosemary Sprig",
    aliases: [
      "rosemary sprig",
      "sprig of rosemary",
      "rosemary sprigs",
      "fresh rosemary",
    ],
    category: "seasoning",
    standardPieceWeightG: 1.5,
    pieceBreakdown: {
      summary: "~1.5g per sprig (~0.6g picked leaves)",
    },
    typicalUnits: ["sprig", "sprigs", "ea", "each", "g"],
  },

  // --- DAIRY, FATS & PANTRY ---
  {
    id: "butter-stick",
    name: "Butter (Stick)",
    aliases: ["butter stick", "stick of butter", "butter (stick)"],
    category: "dairy",
    standardPieceWeightG: 113.4,
    pieceBreakdown: {
      summary: "113.4g (4 oz / 8 tbsp / 1/2 cup)",
    },
    densityGMl: 0.96,
    typicalUnits: ["stick", "sticks", "g", "oz", "tbsp", "cup"],
  },
  {
    id: "canned-goods-standard",
    name: "Standard Can (14.5 - 15 oz)",
    aliases: [
      "can",
      "cans",
      "15 oz can",
      "14.5 oz can",
      "can of tomatoes",
      "can of beans",
      "can of chickpeas",
    ],
    category: "pantry",
    standardPieceWeightG: 425,
    pieceBreakdown: {
      summary: "~425g (15 oz net weight)",
    },
    typicalUnits: ["can", "cans", "ea", "each"],
  },
];

/**
 * Normalizes an ingredient name string for lookup.
 */
function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ");
}

/**
 * Searches the encyclopedia for a matching entry by name or alias.
 */
export function lookupEncyclopedia(
  nameOrRaw: string,
): CulinaryEncyclopediaEntry | null {
  if (!nameOrRaw) return null;
  const clean = normalizeName(nameOrRaw);
  if (!clean) return null;

  // 1. Exact match against aliases
  for (const entry of CULINARY_ENCYCLOPEDIA) {
    if (entry.aliases.some((alias) => normalizeName(alias) === clean)) {
      return entry;
    }
  }

  // 2. Substring / token matching (e.g. "large brown eggs" -> "egg-large", "fresh garlic cloves" -> "garlic-clove")
  for (const entry of CULINARY_ENCYCLOPEDIA) {
    for (const alias of entry.aliases) {
      const normAlias = normalizeName(alias);
      if (clean.includes(normAlias) || normAlias.includes(clean)) {
        return entry;
      }
    }
  }

  return null;
}

export interface EstimatedWeightResult {
  totalWeightG: number;
  unitWeightG?: number;
  breakdownSummary?: string;
  subComponents?: SubComponentBreakdown[];
  confidence: "exact" | "high" | "estimated";
}

/**
 * Calculates estimated weight in grams and culinary breakdown for any ingredient amount & unit.
 */
export function getIngredientEstimatedWeight(
  ingredientName: string,
  amount: number,
  unit: string,
  _customDensityGMl?: number,
): EstimatedWeightResult | null {
  if (amount <= 0) return null;

  const normalizedUnit = (unit || "").toLowerCase().trim();
  const entry = lookupEncyclopedia(ingredientName);

  // Check if it is a count unit
  const isCount = [
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
    "stick",
    "sticks",
    "pod",
    "pods",
  ].includes(normalizedUnit);

  if (isCount && entry?.standardPieceWeightG) {
    const totalWeight = amount * entry.standardPieceWeightG;
    return {
      totalWeightG: Number(totalWeight.toFixed(1)),
      unitWeightG: entry.standardPieceWeightG,
      breakdownSummary: entry.pieceBreakdown?.summary,
      subComponents: entry.pieceBreakdown?.subComponents,
      confidence: "high",
    };
  }

  return null;
}

/**
 * Formats display amount with encyclopedia estimated weight badge text if applicable.
 * E.g., `2 ea` -> { displayAmount: "2 ea", estimateText: "(~100g)", subBreakdown: "~50g edible (~20g yolk, ~30g white)" }
 */
export function formatIngredientAmountWithEstimate(
  amount: number,
  unit: string,
  ingredientName: string,
  customDensityGMl?: number,
): {
  displayAmount: string;
  estimateText?: string;
  subBreakdown?: string;
} {
  const displayAmount = `${Number(amount.toFixed(2))} ${unit}`;
  const estimate = getIngredientEstimatedWeight(
    ingredientName,
    amount,
    unit,
    customDensityGMl,
  );

  if (estimate && estimate.totalWeightG > 0) {
    return {
      displayAmount,
      estimateText: `(~${Math.round(estimate.totalWeightG)}g)`,
      subBreakdown: estimate.breakdownSummary,
    };
  }

  return { displayAmount };
}
