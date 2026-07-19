import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeViewerView } from "./RecipeViewer.view";
import type { Recipe } from "@soustools/api-types";

describe("RecipeViewerView", () => {
  const mockRecipe: Recipe = {
    id: "rec-1",
    title: "Sourdough Bread",
    type: "prep",
    yieldCount: 2,
    yieldUnit: "loaves",
    instructions: [{ id: "inst-1", text: "Mix and bake." }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProps = {
    recipe: mockRecipe,
    vessels: [],
    masterIngredients: [],
    scaledIngredients: [],
    finalMultiplier: 1,
    costData: null,
    nutritionData: null,
    versionHistory: [],
    onIngredientWeightChange: vi.fn(),
    onRestoreVersion: vi.fn(),
    onDownloadLabel: vi.fn(),
    isWastageOpen: false,
    setIsWastageOpen: vi.fn(),
    isHistoryOpen: false,
    setIsHistoryOpen: vi.fn(),
    scaleMode: "yield" as const,
    setScaleMode: vi.fn(),
    targetYield: 2,
    setTargetYield: vi.fn(),
    targetWeight: "",
    handleWeightChange: vi.fn(),
    selectedVesselId: "",
    setSelectedVesselId: vi.fn(),
    savedFlash: false,
    handleSaveCost: vi.fn(),
    wastePct: 0,
    portions: 1,
    handleCostFactorsChange: vi.fn(),
    wastageSearchQuery: "",
    setWastageSearchQuery: vi.fn(),
    wastageItems: [],
    setWastageItems: vi.fn(),
    wastageSelectedItem: null,
    setWastageSelectedItem: vi.fn(),
    wastageAmount: "",
    setWastageAmount: vi.fn(),
    wastageUnit: "g",
    setWastageUnit: vi.fn(),
    wastageReason: "TRIM" as const,
    setWastageReason: vi.fn(),
    wastageSubmitting: false,
    handleWastageSubmit: vi.fn(),
  };

  it("renders the recipe title", () => {
    render(<RecipeViewerView {...defaultProps} />);
    expect(screen.getByText("Sourdough Bread")).toBeDefined();
  });

  it("renders the instructions", () => {
    render(<RecipeViewerView {...defaultProps} />);
    expect(screen.getByText("Mix and bake.")).toBeDefined();
  });
});
