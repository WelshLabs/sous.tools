import { config } from "@soustools/config";
import { RecipesClientPage } from "./RecipesClientPage";

export default async function RecipesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
  let recipes = [];
  try {
    const res = await fetch(`${baseUrl}/recipes`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      recipes = payload.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch recipes:", err);
  }

  return (
    <div className="py-6 px-4">
      <RecipesClientPage initialRecipes={recipes} />
    </div>
  );
}
