"use client";

import { Loader2 } from "lucide-react";

export interface NutritionMacros {
  calories?: number;
  protein_g?: number;
  total_carbohydrate_g?: number;
  total_fat_g?: number;
  [key: string]: number | undefined;
}

export interface ItemFormData {
  name: string;
  category: string;
  purchase_unit: string;
  density_g_ml: number;
  allergens: string[];
  is_animal_product: boolean;
  nutrition_macros: NutritionMacros;
  fdc_id: number | null;
  force_usda_sync: boolean;
  usda_query: string;
}

interface FieldsProps {
  formData: ItemFormData;
  loading: boolean;
  onClose: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onMacroChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAllergensChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ItemEditorFormFields({
  formData,
  loading,
  onClose,
  onChange,
  onMacroChange,
  onAllergensChange,
}: FieldsProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Item Name
          </label>
          <input
            required
            type="text"
            name="name"
            value={formData.name}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none"
          >
            <option value="INGREDIENT">INGREDIENT</option>
            <option value="PACKAGING">PACKAGING</option>
            <option value="CLEANING">CLEANING</option>
            <option value="SMALLWARES">SMALLWARES</option>
            <option value="OTHER">OTHER</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Default Purchase Unit
          </label>
          <select
            name="purchase_unit"
            value={formData.purchase_unit}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none"
          >
            <option value="LB">LB</option>
            <option value="KG">KG</option>
            <option value="CASE">CASE</option>
            <option value="EACH">EACH</option>
            <option value="GAL">GAL</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Density (g/mL)
          </label>
          <input
            required
            type="number"
            step="0.001"
            name="density_g_ml"
            value={formData.density_g_ml}
            onChange={onChange}
            className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
          Allergens (comma separated)
        </label>
        <input
          type="text"
          value={formData.allergens.join(", ")}
          onChange={onAllergensChange}
          placeholder="Dairy, Nuts, Wheat"
          className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none"
        />
      </div>
      <div className="pt-4 border-t border-border dark:border-white/5">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-muted-foreground mb-4">
          Nutritional Macros (per 100g)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              { key: "calories", label: "Calories (kcal)" },
              { key: "protein_g", label: "Protein (g)" },
              { key: "total_carbohydrate_g", label: "Carbs (g)" },
              { key: "total_fat_g", label: "Fat (g)" },
            ] as const
          ).map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs text-zinc-400 dark:text-zinc-500">
                {label}
              </label>
              <input
                type="number"
                step="0.1"
                name={key}
                disabled={!!formData.fdc_id}
                value={formData.nutrition_macros[key] ?? ""}
                onChange={onMacroChange}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:border-sky-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          ))}
        </div>
      </div>
      <div className="pt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-foreground transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-foreground font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />} Save Item
        </button>
      </div>
    </>
  );
}
