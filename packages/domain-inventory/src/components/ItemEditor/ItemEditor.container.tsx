"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ItemEditorView } from "./ItemEditor.view";
import type { ItemFormData, NutritionMacros } from "./ItemEditorFormFields";

export interface InventoryItem {
  id?: string;
  name?: string;
  category?: string;
  purchase_unit?: string;
  density_g_ml?: number;
  allergens?: string[];
  is_animal_product?: boolean;
  nutrition_macros?: NutritionMacros;
  fdc_id?: number | null;
}

export interface UsdaSearchResult {
  success: boolean;
  data?: {
    fdc_id: number;
    fdc_food_name: string;
    calories?: number;
    protein_g?: number;
    total_carbohydrate_g?: number;
    total_fat_g?: number;
  };
}

export interface ItemEditorProps {
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (data: ItemFormData) => Promise<void>;
  onSearchUSDA?: (query: string) => Promise<UsdaSearchResult>;
}

const defaultFormData = (): ItemFormData => ({
  name: "",
  category: "INGREDIENT",
  purchase_unit: "LB",
  density_g_ml: 1.0,
  allergens: [],
  is_animal_product: false,
  nutrition_macros: {},
  fdc_id: null,
  force_usda_sync: false,
  usda_query: "",
});

export function ItemEditor({
  item,
  onClose,
  onSave,
  onSearchUSDA,
}: ItemEditorProps) {
  const [loading, setLoading] = useState(false);
  const [usdaQuery, setUsdaQuery] = useState("");
  const [usdaLoading, setUsdaLoading] = useState(false);
  const [formData, setFormData] = useState<ItemFormData>(defaultFormData);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name ?? "",
        category: item.category ?? "INGREDIENT",
        purchase_unit: item.purchase_unit ?? "LB",
        density_g_ml: item.density_g_ml ?? 1.0,
        allergens: item.allergens ?? [],
        is_animal_product: item.is_animal_product ?? false,
        nutrition_macros: item.nutrition_macros ?? {},
        fdc_id: item.fdc_id ?? null,
        force_usda_sync: false,
        usda_query: "",
      });
    }
  }, [item]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      nutrition_macros: {
        ...prev.nutrition_macros,
        [name]: parseFloat(value) || 0,
      },
    }));
  };

  const handleAllergensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const algs = e.target.value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, allergens: algs }));
  };

  const searchUSDA = async () => {
    if (!usdaQuery || !onSearchUSDA) return;
    setUsdaLoading(true);
    try {
      const payload = await onSearchUSDA(usdaQuery);
      if (payload.success && payload.data) {
        toast.success("Found match! Backend will calculate allergens on save.");
        setFormData((prev) => ({
          ...prev,
          name: prev.name || payload.data!.fdc_food_name,
          fdc_id: payload.data!.fdc_id,
          force_usda_sync: true,
          usda_query: usdaQuery,
          nutrition_macros: {
            calories: payload.data!.calories,
            protein_g: payload.data!.protein_g,
            total_carbohydrate_g: payload.data!.total_carbohydrate_g,
            total_fat_g: payload.data!.total_fat_g,
          },
        }));
      } else {
        toast.error("No matches found in USDA DB.");
      }
    } catch {
      toast.error("Error searching USDA DB");
    } finally {
      setUsdaLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <ItemEditorView
      item={item}
      formData={formData}
      loading={loading}
      usdaQuery={usdaQuery}
      usdaLoading={usdaLoading}
      hasSearchHandler={!!onSearchUSDA}
      onClose={onClose}
      onQueryChange={setUsdaQuery}
      onSearch={searchUSDA}
      handleSubmit={handleSubmit}
      handleChange={handleChange}
      handleMacroChange={handleMacroChange}
      handleAllergensChange={handleAllergensChange}
    />
  );
}
