"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { RecipeBuilderView } from "./RecipeBuilder.view";

const meta: Meta<typeof RecipeBuilderView> = {
  title: "Domain/Recipes/RecipeBuilder",
  component: RecipeBuilderView,
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof RecipeBuilderView>;

export const Default: Story = {
  args: {
    title: "Sourdough Loaf",
    setTitle: () => {},
    yieldCount: 1,
    setYieldCount: () => {},
    yieldUnit: "Loaf",
    setYieldUnit: () => {},
    vesselId: "",
    setVesselId: () => {},
    status: "APPROVED",
    setStatus: () => {},
    ingredients: [],
    onAddIngredientLine: () => {},
    onRemoveIngredientLine: () => {},
    onUpdateIngredientLine: () => {},
    steps: [],
    onAddInstructionStep: () => {},
    onRemoveInstructionStep: () => {},
    onUpdateInstructionStep: () => {},
    vessels: [],
    masterIngredients: [],
    loading: false,
    saving: false,
    onSubmit: (e) => e.preventDefault(),
    backHref: "#",
    isEditing: false,
  },
};
