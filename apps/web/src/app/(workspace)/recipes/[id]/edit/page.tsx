import { config } from "@soustools/config";
import { RecipeBuilderClient } from "@/app/(workspace)/recipes/RecipeBuilderClient";

interface EditRecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRecipePage({ params }: EditRecipePageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipe = null;
  let vessels = [];
  let masterIngredients = [];

  try {
    const [recipeRes, vesselsRes, ingRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
    ]);
    
    if (recipeRes.ok) {
      const payload = await recipeRes.json();
      recipe = payload.data;
    }
    if (vesselsRes.ok) {
      const payload = await vesselsRes.json();
      vessels = payload.data || [];
    }
    if (ingRes.ok) {
      const payload = await ingRes.json();
      masterIngredients = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch initial builder data:", err);
  }

  if (!recipe) {
    return <div className="p-12 text-center text-muted-foreground">Recipe not found.</div>;
  }

  return (
    <div className="py-6 px-4">
      <RecipeBuilderClient 
        initialData={recipe}
        vessels={vessels} 
        masterIngredients={masterIngredients} 
      />
    </div>
  );
}
