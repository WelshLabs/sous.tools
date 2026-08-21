import { clientConfig as config } from "@soustools/config/client";
import { RecipeBuilderContainer } from "@soustools/domain-recipes";

export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  const baseUrl = config.NEXT_PUBLIC_API_URL;

  let vessels = [];
  let masterIngredients = [];

  try {
    const [vesselsRes, ingRes] = await Promise.all([
      fetch(`${baseUrl}/recipes/vessels`, { cache: "no-store" }),
      fetch(`${baseUrl}/recipes/ingredients`, { cache: "no-store" }),
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
    <div className="px-4 py-6">
      <RecipeBuilderContainer
        vessels={vessels}
        masterIngredients={masterIngredients}
      />
    </div>
  );
}
