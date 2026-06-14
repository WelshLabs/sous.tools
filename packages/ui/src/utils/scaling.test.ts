import { describe, it, expect } from "vitest";
import { convertUnit, calculateRecipeScale } from "./scaling";
import { RecipeIngredient } from "@soustools/api-types";

describe("convertUnit", () => {
  it("converts within the same unit", () => {
    expect(convertUnit(10, "g", "g")).toBe(10);
    expect(convertUnit(500, "ml", "ml")).toBe(500);
  });

  it("converts weight to weight", () => {
    expect(convertUnit(1.5, "kg", "g")).toBe(1500);
    expect(convertUnit(16, "oz", "lb")).toBeCloseTo(1.0, 4);
    expect(convertUnit(1, "lb", "g")).toBeCloseTo(453.592, 2);
  });

  it("converts volume to volume", () => {
    expect(convertUnit(1, "l", "ml")).toBe(1000);
    expect(convertUnit(3, "tsp", "tbsp")).toBeCloseTo(1.0, 4);
    expect(convertUnit(1, "cup", "ml")).toBeCloseTo(236.588, 2);
  });

  it("converts volume to weight using density", () => {
    // Water (density = 1.0): 1 cup of water = 236.588 ml = 236.588 g
    expect(convertUnit(1, "cup", "g", 1.0)).toBeCloseTo(236.588, 2);

    // Honey (density = 1.4): 100ml honey = 140g
    expect(convertUnit(100, "ml", "g", 1.4)).toBe(140);
  });

  it("converts weight to volume using density", () => {
    // Olive Oil (density = 0.92): 92g olive oil = 100ml
    expect(convertUnit(92, "g", "ml", 0.92)).toBeCloseTo(100, 2);
  });

  it("safely returns amount for count and percentage units", () => {
    expect(convertUnit(12, "count", "count")).toBe(12);
    expect(convertUnit(65, "%", "%")).toBe(65);
    expect(convertUnit(5, "count", "g")).toBe(5);
  });
});

describe("calculateRecipeScale", () => {
  const dummyIngredients: RecipeIngredient[] = [
    {
      id: "ing-1",
      recipeId: "rec-1",
      masterIngredientId: "flour-id",
      calculationType: "fixed_weight",
      baseCalculationGroup: true,
      amount: 500,
      unit: "g",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "flour-id",
        organizationId: "org-1",
        name: "Bread Flour",
        densityGMl: 0.57,
        nutritionMacros: { calories: 364, proteinG: 12, carbsG: 76, fatG: 1.5 },
        allergens: ["wheat"],
        createdAt: "",
        updatedAt: "",
      },
    },
    {
      id: "ing-2",
      recipeId: "rec-1",
      masterIngredientId: "water-id",
      calculationType: "bakers_percentage",
      baseCalculationGroup: false,
      amount: 60, // 60% hydration
      unit: "%",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "water-id",
        organizationId: "org-1",
        name: "Water",
        densityGMl: 1.0,
        nutritionMacros: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        allergens: [],
        createdAt: "",
        updatedAt: "",
      },
    },
    {
      id: "ing-3",
      recipeId: "rec-1",
      masterIngredientId: "butter-id",
      calculationType: "fixed_weight",
      baseCalculationGroup: false,
      amount: 50,
      unit: "g",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "butter-id",
        organizationId: "org-1",
        name: "Butter",
        densityGMl: 0.96,
        nutritionMacros: { calories: 717, proteinG: 1, carbsG: 0, fatG: 81 },
        allergens: ["dairy"],
        createdAt: "",
        updatedAt: "",
      },
    },
  ];

  it("scales recipe linearly by portion yield", () => {
    // Scaling from 10 portions to 20 portions (multiplier = 2.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetYield: 20,
    });

    expect(multiplier).toBe(2.0);

    // Flour (base group): 500g * 2 = 1000g
    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1000);
    expect(flourResult?.weightInGrams).toBe(1000);

    // Water (bakers_percentage, 60% of flour): 1000g flour * 0.60 = 600g water
    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(600);
    expect(waterResult?.scaledUnit).toBe("g");
    expect(waterResult?.weightInGrams).toBe(600);

    // Butter (fixed_weight): 50g * 2 = 100g
    const butterResult = items.find((i) => i.ingredientId === "ing-3");
    expect(butterResult?.scaledAmount).toBe(100);
    expect(butterResult?.weightInGrams).toBe(100);
  });

  it("scales recipe by vessel volumes", () => {
    // Default vessel is 2300ml, target vessel is 3300ml
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetVesselVolume: 3300,
      defaultVesselVolume: 2300,
    });

    expect(multiplier).toBeCloseTo(3300 / 2300, 4);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBeCloseTo(500 * (3300 / 2300), 2);
  });

  it("scales recipe by total target weight", () => {
    // Base total weight in grams:
    // Flour: 500g
    // Water: 500g * 0.60 = 300g
    // Butter: 50g
    // Total base weight: 850g
    // Target total weight: 1700g (multiplier = 2.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetTotalWeight: 1700,
    });

    expect(multiplier).toBe(2.0);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1000);

    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(600);

    const butterResult = items.find((i) => i.ingredientId === "ing-3");
    expect(butterResult?.scaledAmount).toBe(100);
  });

  it("scales recipe using custom anchor ingredient override", () => {
    // User overrides Flour (ing-1) to be 1500g (multiplier = 3.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      customIngredientWeights: {
        "ing-1": { amount: 1500, unit: "g" },
      },
    });

    expect(multiplier).toBe(3.0);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1500);

    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(900); // 1500 * 0.60 = 900g
  });
});
