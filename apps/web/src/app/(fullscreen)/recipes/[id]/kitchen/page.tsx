import { clientConfig as config } from "@soustools/config/client";
import { KitchenClientPage } from "./KitchenClientPage";

interface KitchenPageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { id } = await params;
  const baseUrl = config.NEXT_PUBLIC_API_URL;

  let recipe = null;
  try {
    const res = await fetch(`${baseUrl}/recipes/${id}`, { cache: "no-store" });
    if (res.ok) {
      const payload = await res.json();
      recipe = payload.data;
    }
  } catch (err) {
    console.error("Failed to fetch recipe for kitchen mode:", err);
  }

  if (!recipe) {
    return (
      <div className="text-muted-foreground p-12 text-center">
        Recipe not found.
      </div>
    );
  }

  return (
    <div className="bg-card min-h-screen">
      <KitchenClientPage recipe={recipe} />
    </div>
  );
}
