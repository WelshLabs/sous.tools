import { config } from "@soustools/config";
import { KitchenClientPage } from "./KitchenClientPage";

interface KitchenPageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { id } = await params;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  
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
    return <div className="p-12 text-center text-muted-foreground">Recipe not found.</div>;
  }

  return (
    <div className="bg-card min-h-screen">
      <KitchenClientPage recipe={recipe} />
    </div>
  );
}
