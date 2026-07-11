import React from "react";
import { CatalogView } from "./CatalogView";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let catalogData = { items: [], categories: [], modifierGroups: [], discounts: [] };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/catalog`, { cache: 'no-store' });
    if (res.ok) {
      catalogData = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch catalog:", err);
  }

  return (
    <CatalogView
      initialItems={catalogData.items}
      categories={catalogData.categories}
      modifierGroups={catalogData.modifierGroups}
      discounts={catalogData.discounts}
    />
  );
}

