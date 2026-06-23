import React, { useState, useEffect } from "react";
import { Button } from "@soustools/ui";
import { Download, Activity, ShieldAlert } from "lucide-react";
import { RecipeNutritionCache } from "@soustools/api-types";
import { RecipeDietaryBadges } from "./recipe-dietary-badges";

interface RecipeNutritionPanelProps {
  recipeId: string;
}

export const RecipeNutritionPanel: React.FC<RecipeNutritionPanelProps> = ({ recipeId }) => {
  const [nutrition, setNutrition] = useState<RecipeNutritionCache | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${recipeId}/nutrition`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) {
          setNutrition(payload.data);
        }
      })
      .catch((err) => console.error("Failed to fetch nutrition", err))
      .finally(() => setLoading(false));
  }, [recipeId]);

  const handleDownloadLabel = async () => {
    try {
      const res = await fetch(`/api/recipes/${recipeId}/nutrition-label?format=svg`);
      if (!res.ok) throw new Error("Failed to generate label");
      const svgText = await res.text();
      
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recipe-${recipeId}-nutrition-label.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download nutrition label.");
    }
  };

  if (loading) {
    return <div className="text-xs text-slate-400 animate-pulse">Calculating nutrition profiles...</div>;
  }

  if (!nutrition || !nutrition.perServingNutrition) {
    return (
      <div className="p-4 rounded-xl border border-white/5 bg-zinc-950/20 text-xs text-slate-400 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        No nutrition facts resolved for this recipe. Ensure ingredients are matched with USDA profiles.
      </div>
    );
  }

  const macros = nutrition.perServingNutrition;

  return (
    <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-4 shadow-xl glass-panel">
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" /> Nutrition & Diets
        </h3>
        <Button size="sm" onClick={handleDownloadLabel} className="bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-white/5 flex items-center gap-1">
          <Download className="w-3.5 h-3.5" /> FDA Label
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="p-2 bg-zinc-950/40 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Calories</div>
          <div className="text-sm font-bold text-slate-100">{Math.round(macros.calories || 0)}</div>
        </div>
        <div className="p-2 bg-zinc-950/40 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Fat</div>
          <div className="text-sm font-bold text-slate-100">{Math.round(macros.total_fat_g || 0)}g</div>
        </div>
        <div className="p-2 bg-zinc-950/40 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Carbs</div>
          <div className="text-sm font-bold text-slate-100">{Math.round(macros.total_carbohydrate_g || 0)}g</div>
        </div>
        <div className="p-2 bg-zinc-950/40 rounded-lg border border-white/5">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Protein</div>
          <div className="text-sm font-bold text-slate-100">{Math.round(macros.protein_g || 0)}g</div>
        </div>
      </div>

      <RecipeDietaryBadges dietaryFlags={nutrition.dietaryFlags} />
    </div>
  );
};
