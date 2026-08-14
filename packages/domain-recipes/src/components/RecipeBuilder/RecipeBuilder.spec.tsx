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
});
