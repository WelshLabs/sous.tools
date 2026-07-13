import { config } from "@soustools/config";
import { RecipeViewerClient } from "./RecipeViewerClient";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL;
  
  let recipe = null;
  let vessels = [];
  let costData = null;
  let nutritionData = null;
  let versionHistory = [];

  try {
    const [recipeRes, vesselsRes, costRes, nutritionRes, historyRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/${id}/cost`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/recipes/${id}/nutrition`, { cache: "no-store" }).catch(() => null),
      fetch(`${baseUrl}/recipes/${id}/versions`, { cache: "no-store" }).catch(() => null)
    ]);
    
    if (recipeRes.ok) {
      const payload = await recipeRes.json();
      recipe = payload.data;
    }
    if (vesselsRes.ok) {
      const payload = await vesselsRes.json();
      vessels = payload.data || [];
    }
    if (costRes && costRes.ok) {
      const payload = await costRes.json();
      costData = payload.data || null;
    }
    if (nutritionRes && nutritionRes.ok) {
      const payload = await nutritionRes.json();
      nutritionData = payload.data || null;
    }
    if (historyRes && historyRes.ok) {
      const payload = await historyRes.json();
      versionHistory = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch initial recipe viewer data:", err);
  }

  if (!recipe) {
    return <div className="p-12 text-center text-muted-foreground">Recipe not found.</div>;
  }

  return (
    <div className="py-6 px-4">
      <RecipeViewerClient 
        recipe={recipe}
        vessels={vessels}
        costData={costData}
        nutritionData={nutritionData}
        versionHistory={versionHistory}
      />
    </div>
  );
}
