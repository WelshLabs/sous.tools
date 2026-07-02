"use client";

import React from "react";
import { RecipeCard } from "./RecipeCard";
import { Recipe } from "@soustools/api-types";
import { Loader2 } from "lucide-react";

/**
 * Props for the RecipeList component.
 */
export interface RecipeListProps {
  /** The list of recipes to display. */
  recipes: Recipe[];
  /** Whether the list is loading. */
  loading?: boolean;
  /** Called when a recipe's delete button is clicked. */
  onDelete: (id: string) => void;
}

/**
 * RecipeList — a responsive grid displaying `RecipeCard` components.
 *
 * **Presentation boundary**: Pure UI.
 *
 * @tenant-docs-export
 * # RecipeList
 * ```tsx
 * import { RecipeList } from "@soustools/domain-recipes";
 *
 * <RecipeList
 *   recipes={filteredRecipes}
 *   loading={isLoading}
 *   onDelete={handleDelete}
 * />
 * ```
 */
export function RecipeList({ recipes, loading = false, onDelete }: RecipeListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2
          className="w-8 h-8 animate-spin"
          style={{ color: "var(--color-primary)" }}
        />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div
        className="text-center py-20 text-sm"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        No recipes found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} onDelete={onDelete} />
      ))}
    </div>
  );
}
