/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import type { Meta, StoryObj } from "@storybook/react";
import { RecipeListView } from "./RecipeList.view";
import type { Recipe } from "@soustools/api-types";

const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Classic Burger",
    status: "APPROVED",
    yieldCount: 4,
    yieldUnit: "servings",
    instructions: [{ id: "i1", text: "Grill the patty" }, { id: "i2", text: "Toast the bun" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    costPerServing: 2.5,
    totalCost: 10,
    ingredients: [],
  },
  {
    id: "2",
    title: "Mushroom Risotto",
    status: "PENDING_REVIEW",
    yieldCount: 2,
    yieldUnit: "servings",
    instructions: [{ id: "i3", text: "Stir constantly" }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    costPerServing: 3.5,
    totalCost: 7,
    ingredients: [],
  },
] as any;

const meta: Meta<typeof RecipeListView> = {
  title: "Domain Recipes/RecipeList",
  component: RecipeListView,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof RecipeListView>;

export const Default: Story = {
  args: {
    recipes: mockRecipes,
    onDelete: (id: string) => console.log("Delete", id),
  },
};

export const Loading: Story = {
  args: {
    recipes: [],
    loading: true,
    onDelete: () => {},
  },
};

export const Empty: Story = {
  args: {
    recipes: [],
    onDelete: () => {},
  },
};

export const WithFilter: Story = {
  args: {
    recipes: mockRecipes,
    showFilter: true,
    categories: [],
    tags: [],
    selectedCategory: null,
    onSelectCategory: () => {},
    selectedTag: null,
    onSelectTag: () => {},
    selectedStatus: "ALL",
    onSelectStatus: () => {},
    searchQuery: "",
    onSearchQueryChange: () => {},
    onDelete: () => {},
  },
};
