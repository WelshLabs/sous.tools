import { describe, it, expect } from "vitest";
import {
  lookupEncyclopedia,
  getIngredientEstimatedWeight,
  formatIngredientAmountWithEstimate,
} from "./culinary-encyclopedia";

describe("Culinary Encyclopedia", () => {
  it("looks up large eggs and resolves standard piece weight and subcomponents", () => {
    const entry = lookupEncyclopedia("Large Eggs");
    expect(entry).not.toBeNull();
    expect(entry?.standardPieceWeightG).toBe(50);
    expect(entry?.pieceBreakdown?.subComponents).toEqual([
      { name: "Egg Yolk", weightG: 20 },
      { name: "Egg White", weightG: 30 },
    ]);
  });

  it("calculates estimated weight for 2 large eggs as ~100g", () => {
    const est = getIngredientEstimatedWeight("Large Egg", 2, "ea");
    expect(est).not.toBeNull();
    expect(est?.totalWeightG).toBe(100);
    expect(est?.unitWeightG).toBe(50);
    expect(est?.breakdownSummary).toContain("20g yolk, ~30g white");
  });

  it("formats ingredient amount with estimate badge text for eggs and garlic", () => {
    const eggFormatted = formatIngredientAmountWithEstimate(
      2,
      "ea",
      "Large Egg",
    );
    expect(eggFormatted.displayAmount).toBe("2 ea");
    expect(eggFormatted.estimateText).toBe("(~100g)");
    expect(eggFormatted.subBreakdown).toContain("~50g edible");

    const garlicFormatted = formatIngredientAmountWithEstimate(
      3,
      "clove",
      "Garlic Clove",
    );
    expect(garlicFormatted.displayAmount).toBe("3 clove");
    expect(garlicFormatted.estimateText).toBe("(~12g)");
  });

  it("safely handles non-count units without crashing", () => {
    const est = getIngredientEstimatedWeight("Butter", 100, "g");
    expect(est).toBeNull();
  });
});
