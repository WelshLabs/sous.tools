import React from "react";
import { RecipeBuilder } from "../../../../../components/recipes/recipe-builder";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  return (
    <div className="py-6 px-4">
      <RecipeBuilder recipeId={id} />
    </div>
  );
}
