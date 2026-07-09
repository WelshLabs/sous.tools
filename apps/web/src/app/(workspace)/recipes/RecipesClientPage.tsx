"use client";

import React, { useState } from "react";
import { RecipeList } from "@soustools/domain-recipes";
import { type Recipe } from "@soustools/api-types";
import { toast } from "sonner";

export function RecipesClientPage({ initialRecipes }: { initialRecipes: Recipe[] }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (res.ok) {
        setRecipes((prev) => prev.filter((r) => r.id !== id));
        toast.success("Recipe deleted");
      } else {
        toast.error("Failed to delete recipe");
      }
    } catch (_err) {
      toast.error("Error deleting recipe");
    }
  };

  return <RecipeList recipes={recipes} onDelete={handleDelete} />;
}
