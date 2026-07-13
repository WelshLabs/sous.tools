import { config } from "@soustools/config";
import { RecipeBuilderClient } from "@/app/(workspace)/recipes/RecipeBuilderClient";

export const dynamic = 'force-dynamic';

export default async function NewRecipePage() {
  const baseUrl = config.API_BASE_URL;
  
  let vessels = [];
  let masterIngredients = [];

  try {
    const [vesselsRes, ingRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" })
    ]);
    
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

  return (
    <div className="py-6 px-4">
      <RecipeBuilderClient 
        vessels={vessels} 
        masterIngredients={masterIngredients} 
      />
    </div>
  );
}
