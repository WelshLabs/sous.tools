"use client";

import { useState } from "react";
import {
  type Recipe,
  type RecipeCategory,
  type RecipeTag,
} from "@soustools/api-types";
import { RecipeListView } from "./RecipeList.view";

export interface RecipeListProps {
  recipes?: Recipe[];
  initialRecipes?: Recipe[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  categories?: RecipeCategory[];
  tags?: RecipeTag[];
  selectedCategory?: string | null;
  onSelectCategory?: (id: string | null) => void;
  selectedTag?: string | null;
  onSelectTag?: (id: string | null) => void;
  selectedStatus?: string;
  onSelectStatus?: (
    status: "ALL" | "APPROVED" | "PENDING_REVIEW" | "ARCHIVED",
  ) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
  showFilter?: boolean;
}

/**
 * RecipeList Container
 */
export const RecipeList = ({
  recipes: controlledRecipes,
  initialRecipes = [],
  onDelete: customOnDelete,
  ...props
}: RecipeListProps) => {
  const [internalRecipes, setInternalRecipes] = useState<Recipe[]>(
    controlledRecipes ?? initialRecipes,
  );

  const activeRecipes = controlledRecipes ?? internalRecipes;

  const handleDelete = async (id: string) => {
    if (customOnDelete) {
      customOnDelete(id);
      return;
    }

    if (
      typeof window !== "undefined" &&
      !confirm("Are you sure you want to delete this recipe?")
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setInternalRecipes((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error("Error deleting recipe", err);
    }
  };

  return (
    <RecipeListView
      {...props}
      recipes={activeRecipes}
      onDelete={handleDelete}
    />
  );
};

export { RecipeList as RecipeListContainer };
