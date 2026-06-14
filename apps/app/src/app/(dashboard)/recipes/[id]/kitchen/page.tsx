import React from "react";
import { ActiveKitchen } from "../../../../../components/recipes/active-kitchen";

interface KitchenPageProps {
  params: Promise<{ id: string }>;
}

export default async function KitchenPage({ params }: KitchenPageProps) {
  const { id } = await params;
  return (
    <div className="bg-black min-h-screen">
      <ActiveKitchen recipeId={id} />
    </div>
  );
}
