"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { RecipeViewerView } from "./RecipeViewer.view";
import type { Recipe } from "@soustools/api-types";

const meta: Meta<typeof RecipeViewerView> = {
  title: "domain-recipes/RecipeViewer",
  component: RecipeViewerView,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RecipeViewerView>;

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

export const Default: Story = {
  args: {
    recipe: mockRecipe,
    vessels: [],
    masterIngredients: [],
    scaledIngredients: [],
    finalMultiplier: 1,
    costData: {
      totalCostUsd: 2.5,
      costPerServingUsd: 1.25,
      suggestedSalePrice: 6.0,
      linkedSalePrice: 5.5,
      marginPct: 77.2,
      ingredients: [],
    },
    nutritionData: null,
    versionHistory: [],
    onIngredientWeightChange: () => {},
    onRestoreVersion: () => {},
    onDownloadLabel: () => {},
    isWastageOpen: false,
    setIsWastageOpen: () => {},
    isHistoryOpen: false,
    setIsHistoryOpen: () => {},
    scaleMode: "yield",
    setScaleMode: () => {},
    targetYield: 2,
    setTargetYield: () => {},
    targetWeight: "",
    handleWeightChange: () => {},
    selectedVesselId: "",
    setSelectedVesselId: () => {},
    savedFlash: false,
    handleSaveCost: () => {},
    wastePct: 0,
    portions: 1,
    handleCostFactorsChange: () => {},
    wastageSearchQuery: "",
    setWastageSearchQuery: () => {},
    wastageItems: [],
    setWastageItems: () => {},
    wastageSelectedItem: null,
    setWastageSelectedItem: () => {},
    wastageAmount: "",
    setWastageAmount: () => {},
    wastageUnit: "g",
    setWastageUnit: () => {},
    wastageReason: "TRIM",
    setWastageReason: () => {},
    wastageSubmitting: false,
    handleWastageSubmit: () => {},
  },
};
