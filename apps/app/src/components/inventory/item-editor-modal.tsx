"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface ItemEditorModalProps {
  item: any;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ItemEditorModal({ item, onClose, onSave }: ItemEditorModalProps) {
  const [loading, setLoading] = useState(false);
  const [usdaQuery, setUsdaQuery] = useState("");
  const [usdaLoading, setUsdaLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "INGREDIENT",
    purchase_unit: "LB",
    density_g_ml: 1.0,
    allergens: [] as string[],
    is_animal_product: false,
    nutrition_macros: {} as Record<string, any>,
    fdc_id: null as number | null,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "INGREDIENT",
        purchase_unit: item.purchase_unit || "LB",
        density_g_ml: item.density_g_ml ?? 1.0,
        allergens: item.allergens || [],
        is_animal_product: item.is_animal_product || false,
        nutrition_macros: item.nutrition_macros || {},
        fdc_id: item.fdc_id || null,
      });
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value
    }));
  };

  const handleMacroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nutrition_macros: {
        ...prev.nutrition_macros,
        [name]: parseFloat(value) || 0
      }
    }));
  };

  const handleAllergensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const algs = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, allergens: algs }));
  };

  const searchUSDA = async () => {
    if (!usdaQuery) return;
    setUsdaLoading(true);
    try {
      const res = await fetch(`/api/recipes/usda/search?query=${encodeURIComponent(usdaQuery)}`);
      const payload = await res.json();
      if (payload.success && payload.data) {
        toast.success("Found match in USDA Database!");
        setFormData(prev => ({
          ...prev,
          name: prev.name || payload.data.fdc_food_name,
          fdc_id: payload.data.fdc_id,
          nutrition_macros: {
            ...payload.data
          }
        }));
      } else {
        toast.error("No matches found in USDA DB.");
      }
    } catch (err) {
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
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-black/10 dark:border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center sticky top-0 bg-zinc-900/90 backdrop-blur z-10">
          <h2 className="text-xl font-bold text-white">
            {item ? "Edit Ledger Item" : "New Ledger Item"}
          </h2>
          <button onClick={onClose} className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-white rounded-full hover:bg-black/10 dark:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* USDA Integrator Box */}
          <div className="p-4 bg-sky-950/30 border border-sky-500/20 rounded-xl space-y-3">
            <h3 className="text-sm font-semibold text-sky-400 flex items-center gap-2">
              <Search size={16} /> USDA Database Auto-Fill
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search USDA (e.g. 'All Purpose Flour')"
                className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
                value={usdaQuery}
                onChange={e => setUsdaQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), searchUSDA())}
              />
              <button
                type="button"
                onClick={searchUSDA}
                disabled={usdaLoading}
                className="px-4 py-2 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-medium rounded-lg transition-colors flex items-center"
              >
                {usdaLoading ? <Loader2 size={16} className="animate-spin" /> : "Search"}
              </button>
            </div>
            {formData.fdc_id && (
              <p className="text-xs text-emerald-400">Linked to FDC ID: {formData.fdc_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Item Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none">
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
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Default Purchase Unit</label>
              <select name="purchase_unit" value={formData.purchase_unit} onChange={handleChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none">
                <option value="LB">LB</option>
                <option value="KG">KG</option>
                <option value="CASE">CASE</option>
                <option value="EACH">EACH</option>
                <option value="GAL">GAL</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Density (g/mL)</label>
              <input required type="number" step="0.001" name="density_g_ml" value={formData.density_g_ml} onChange={handleChange} className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Allergens (comma separated)</label>
            <input type="text" value={formData.allergens.join(", ")} onChange={handleAllergensChange} placeholder="Dairy, Nuts, Wheat" className="w-full bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-white focus:border-sky-500 outline-none" />
          </div>

          <div className="pt-4 border-t border-black/5 dark:border-white/5">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Nutritional Macros (per 100g)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 dark:text-zinc-500">Calories (kcal)</label>
                <input type="number" step="0.1" name="calories" value={formData.nutrition_macros.calories || ""} onChange={handleMacroChange} className="w-full bg-black/20 border border-black/5 dark:border-white/5 rounded-lg px-2 py-1 text-sm text-white focus:border-sky-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 dark:text-zinc-500">Protein (g)</label>
                <input type="number" step="0.1" name="protein_g" value={formData.nutrition_macros.protein_g || ""} onChange={handleMacroChange} className="w-full bg-black/20 border border-black/5 dark:border-white/5 rounded-lg px-2 py-1 text-sm text-white focus:border-sky-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 dark:text-zinc-500">Carbs (g)</label>
                <input type="number" step="0.1" name="total_carbohydrate_g" value={formData.nutrition_macros.total_carbohydrate_g || ""} onChange={handleMacroChange} className="w-full bg-black/20 border border-black/5 dark:border-white/5 rounded-lg px-2 py-1 text-sm text-white focus:border-sky-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 dark:text-zinc-500">Fat (g)</label>
                <input type="number" step="0.1" name="total_fat_g" value={formData.nutrition_macros.total_fat_g || ""} onChange={handleMacroChange} className="w-full bg-black/20 border border-black/5 dark:border-white/5 rounded-lg px-2 py-1 text-sm text-white focus:border-sky-500 outline-none" />
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-zinc-500 dark:text-zinc-400 hover:text-white transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-lg transition-colors shadow-lg shadow-sky-500/20 flex items-center gap-2">
              {loading && <Loader2 size={16} className="animate-spin" />}
              Save Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
