import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeBuilderView } from "./RecipeBuilder.view";
import React from "react";

describe("RecipeBuilderView", () => {
  it("renders correctly with basic props", () => {
    render(
      <RecipeBuilderView
        title="My Recipe"
        setTitle={vi.fn()}
        yieldCount={1}
        setYieldCount={vi.fn()}
        yieldUnit="Portion"
        setYieldUnit={vi.fn()}
        vesselId=""
        setVesselId={vi.fn()}
        status="APPROVED"
        setStatus={vi.fn()}
        isBakersPercentage={false}
        setIsBakersPercentage={vi.fn()}
        ingredients={[]}
        onAddIngredientLine={vi.fn()}
        onRemoveIngredientLine={vi.fn()}
        onUpdateIngredientLine={vi.fn()}
        steps={[]}
        onAddInstructionStep={vi.fn()}
        onRemoveInstructionStep={vi.fn()}
        onUpdateInstructionStep={vi.fn()}
        vessels={[]}
        masterIngredients={[]}
        loading={false}
        saving={false}
        onSubmit={(e) => e.preventDefault()}
        backHref="#"
        isEditing={false}
      />,
    );
    expect(screen.getByText("Create Recipe")).toBeDefined();
    expect(screen.getByDisplayValue("My Recipe")).toBeDefined();
    expect(screen.getByText("Save Recipe")).toBeDefined();
  });

  it("displays Baker's Formula Overview when isBakersPercentage is true", () => {
    render(
      <RecipeBuilderView
        title="Sourdough Bread"
        setTitle={vi.fn()}
        yieldCount={2}
        setYieldCount={vi.fn()}
        yieldUnit="loaves"
        setYieldUnit={vi.fn()}
        vesselId=""
        setVesselId={vi.fn()}
        status="APPROVED"
        setStatus={vi.fn()}
        isBakersPercentage={true}
        setIsBakersPercentage={vi.fn()}
        ingredients={[
          {
            masterIngredientId: "flour-1",
            amount: 1000,
            unit: "g",
            calculationType: "fixed_weight",
            baseCalculationGroup: true,
            prepNotes: "",
          },
        ]}
        onAddIngredientLine={vi.fn()}
        onRemoveIngredientLine={vi.fn()}
        onUpdateIngredientLine={vi.fn()}
        steps={[]}
        onAddInstructionStep={vi.fn()}
        onRemoveInstructionStep={vi.fn()}
        onUpdateInstructionStep={vi.fn()}
        vessels={[]}
        masterIngredients={[{ id: "flour-1", name: "Bread Flour" } as any]}
        loading={false}
        saving={false}
        onSubmit={(e) => e.preventDefault()}
        backHref="#"
        isEditing={true}
      />,
    );
    expect(screen.getByText("Baker's Formula Overview:")).toBeDefined();
    expect(screen.getByText("1000g (100%)")).toBeDefined();
  });
});
