import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecipeListView } from "./RecipeList.view";
import type { Recipe } from "@soustools/api-types";

describe("RecipeListView", () => {
  const mockRecipes: Recipe[] = [
    {
      id: "1",
      title: "Test Recipe",
      status: "APPROVED",
      yieldCount: 4,
      yieldUnit: "servings",
      instructions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      costPerServing: 2,
      totalCost: 8,
      ingredients: [],
    } as any,
  ];

  it("renders a list of recipes", () => {
    render(<RecipeListView recipes={mockRecipes} onDelete={vi.fn()} />);
    expect(screen.getByText("Test Recipe")).toBeInTheDocument();
  });

  it("renders a loading state", () => {
    const { container } = render(
      <RecipeListView recipes={[]} loading onDelete={vi.fn()} />,
    );
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("renders empty state when no recipes match", () => {
    render(<RecipeListView recipes={[]} onDelete={vi.fn()} />);
    expect(
      screen.getByText("No recipes found matching your criteria."),
    ).toBeInTheDocument();
  });
});
