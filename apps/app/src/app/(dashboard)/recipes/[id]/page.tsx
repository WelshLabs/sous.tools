import React from "react";
import { RecipeViewer } from "../../../../components/recipes/recipe-viewer";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  return (
    <div className="py-6 px-4">
      <RecipeViewer recipeId={id} />
    </div>
  );
}
