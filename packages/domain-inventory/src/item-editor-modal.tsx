"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ItemEditorUsdaBox } from "./item-editor-usda-box";
import {
  ItemEditorFormFields,
  type ItemFormData,
  type NutritionMacros,
} from "./item-editor-form-fields";

/** Shape of a ledger item passed in for editing. */
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

/** USDA search result payload. */
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

export interface ItemEditorModalProps {
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

/** Container: Item editor modal orchestrating USDA search + form field editing. */
export function ItemEditorModal({
  item,
  onClose,
  onSave,
  onSearchUSDA,
}: ItemEditorModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-900 z-10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {item ? "Edit Ledger Item" : "New Ledger Item"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <ItemEditorUsdaBox
            usdaQuery={usdaQuery}
            usdaLoading={usdaLoading}
            fdcId={formData.fdc_id}
            hasSearchHandler={!!onSearchUSDA}
            onQueryChange={setUsdaQuery}
            onSearch={searchUSDA}
          />
          <ItemEditorFormFields
            formData={formData}
            loading={loading}
            onClose={onClose}
            onChange={handleChange}
            onMacroChange={handleMacroChange}
            onAllergensChange={handleAllergensChange}
          />
        </form>
      </div>
    </div>
  );
}
