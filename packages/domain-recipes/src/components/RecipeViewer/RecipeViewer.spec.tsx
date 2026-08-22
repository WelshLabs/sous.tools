"use client";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeViewerView } from "./RecipeViewer.view";
import type { Recipe } from "@soustools/api-types";

describe("RecipeViewerView", () => {
  const mockRecipe: Recipe = {
    id: "rec-1",
    organizationId: "org-1",
    title: "Sourdough Bread",
    yieldCount: 2,
    yieldUnit: "loaves",
    vesselId: null,
    instructions: [
      { stepNumber: 1, text: "Mix and bake.", timerDurationSeconds: null },
    ],
    createdAt: new Date().toISOString(),
  };

  const defaultProps = {
    recipe: mockRecipe,
    vessels: [],
    masterIngredients: [],
    scaledIngredients: [],
    bakersSummary: {
      totalFlourWeightG: 1000,
      totalLiquidWeightG: 680,
      hydrationPercentage: 68,
      totalFormulaPercentage: 170,
      isBakersRecipe: true,
    },
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
    isBakersMode: false,
    setIsBakersMode: vi.fn(),
    scaleMode: "yield" as const,
    setScaleMode: vi.fn(),
    targetYield: 2,
    setTargetYield: vi.fn(),
    targetWeight: "",
    handleWeightChange: vi.fn(),
    targetBakersFlour: "",
    handleBakersFlourChange: vi.fn(),
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

  it("renders the recipe title and navigation action buttons", () => {
    render(<RecipeViewerView {...defaultProps} />);
    expect(screen.getByText("Sourdough Bread")).toBeDefined();
    expect(screen.getByText("Edit Recipe")).toBeDefined();
    expect(screen.getByText("Active Kitchen Mode")).toBeDefined();
    expect(screen.getByText("History")).toBeDefined();
  });

  it("renders Baker's % Formula banner and hydration stats", () => {
    render(<RecipeViewerView {...defaultProps} />);
    expect(screen.getByText("Baker's Formula Stats:")).toBeDefined();
    expect(screen.getAllByText("68%").length).toBeGreaterThan(0);
    expect(screen.getByText("1000g (100%)")).toBeDefined();
  });

  it("renders count unit items with encyclopedia estimates", () => {
    const propsWithEgg = {
      ...defaultProps,
      scaledIngredients: [
        {
          ingredientId: "ing-egg",
          name: "Large Egg",
          originalAmount: 2,
          originalUnit: "ea",
          scaledAmount: 2,
          scaledUnit: "ea",
          weightInGrams: 100,
          baseCalculationGroup: false,
          calculationType: "fixed_weight",
          isCountUnit: true,
          estimateText: "(~100g)",
          subBreakdown: "~50g edible (~20g yolk, ~30g white)",
        },
      ],
    };

    render(<RecipeViewerView {...propsWithEgg} />);
    expect(screen.getByText("Large Egg")).toBeDefined();
    expect(screen.getByText("(~100g)")).toBeDefined();
    expect(screen.getAllByDisplayValue("2").length).toBeGreaterThan(0);
  });

  it("renders history drawer with interactive backdrop that triggers setIsHistoryOpen(false)", () => {
    const setIsHistoryOpen = vi.fn();
    render(
      <RecipeViewerView
        {...defaultProps}
        isHistoryOpen={true}
        setIsHistoryOpen={setIsHistoryOpen}
      />,
    );

    expect(screen.getByText("Version History")).toBeDefined();
    const closeBtn = screen.getByLabelText("Close version history");
    fireEvent.click(closeBtn);
    expect(setIsHistoryOpen).toHaveBeenCalledWith(false);
  });
});
