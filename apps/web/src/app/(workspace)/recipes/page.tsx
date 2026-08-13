import { clientConfig as config } from "@soustools/config/client";
import { RecipesClientPage } from "./RecipesClientPage";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;

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
