import React from "react";
import { CatalogView } from "./CatalogView";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function CatalogPage() {
  let catalogData = {
    items: [],
    categories: [],
    modifierGroups: [],
    discounts: [],
  };

  try {
    const { data, error } = await (api.GET as any)("/pos/catalog", {
      cache: "no-store",
    });
    if (!error && data) {
      catalogData = data.data || catalogData;
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
