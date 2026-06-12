"use client";

import React, { useState, useEffect } from "react";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/ui";

import { ArrowLeft, Play, Info, Scale } from "lucide-react";
import Link from "next/link";
import { RecipeScalingPanel } from "./recipe-scaling-panel";
import { calculateRecipeScale } from "@soustools/ui";

interface RecipeViewerProps {
  recipeId: string;
}

export const RecipeViewer: React.FC<RecipeViewerProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [vessels, setVessels] = useState<VesselProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiplier, setMultiplier] = useState(1.0);
  const [customWeights, setCustomWeights] = useState<Record<string, { amount: number; unit: string }>>({});

  useEffect(() => {
    // Fetch vessels
    fetch("/api/recipes/vessels")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setVessels(payload.data || []);
      });

    // Fetch recipe details
    fetch(`/api/recipes/${recipeId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setRecipe(payload.data);
      })
      .finally(() => setLoading(false));
  }, [recipeId]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Scale className="w-8 h-8 animate-spin text-primary" /></div>;
  }
  if (!recipe) {
    return <div className="text-center py-12 text-slate-400">Recipe not found.</div>;
  }

  // Calculate scaled output using utility
  const scalingOptions: any = {};
  if (Object.keys(customWeights).length > 0) {
    scalingOptions.customIngredientWeights = customWeights;
  } else if (multiplier !== 1.0) {
    scalingOptions.targetYield = recipe.yieldCount * multiplier;
  }
  
  const { multiplier: finalMultiplier, items: scaledIngredients } = calculateRecipeScale(
    recipe.recipeIngredients || [],
    recipe.yieldCount,
    scalingOptions
  );

  const handleScaleChange = (mult: number, customOpts?: any) => {
    if (customOpts && customOpts.mode === "weight") {
      // Calculate multiplier by total weight
      const { multiplier: m } = calculateRecipeScale(recipe.recipeIngredients || [], recipe.yieldCount, {
        targetTotalWeight: customOpts.weight
      });
      setMultiplier(m);
      setCustomWeights({});
    } else {
      setMultiplier(mult);
      setCustomWeights({});
    }
  };

  const handleIngredientWeightChange = (ingId: string, amount: number, unit: string) => {
    if (amount > 0) {
      setCustomWeights({ [ingId]: { amount, unit } });
    } else {
      setCustomWeights({});
      setMultiplier(1.0);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/recipes" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h2 className="text-2xl font-extrabold text-slate-100 font-brand">{recipe.title}</h2>
          </div>
          <Link href={`/recipes/${recipeId}/kitchen`}>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-lg">
              <Play className="w-4 h-4 fill-current" /> Active Kitchen Mode
            </Button>
          </Link>
        </header>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Ingredients Checklist</h3>
          <div className="overflow-hidden border border-white/5 rounded-xl bg-zinc-900/50">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-900 border-b border-white/5 text-slate-400 uppercase font-semibold tracking-wider">
                  <th className="p-3">Ingredient</th>
                  <th className="p-3 w-32">Scaled Weight</th>
                  <th className="p-3 w-24">Unit</th>
                  <th className="p-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {scaledIngredients.map((ing) => (
                  <tr key={ing.ingredientId} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-slate-200">{ing.name}</td>
                    <td className="p-3">
                      <input type="number" step="any" value={Number(ing.scaledAmount.toFixed(1))} onChange={(e) => handleIngredientWeightChange(ing.ingredientId, parseFloat(e.target.value) || 0, ing.scaledUnit)} className="w-24 bg-zinc-800 border border-white/5 rounded px-2 py-1 focus:border-sky-500 focus:outline-none text-slate-200 text-xs font-bold" />
                    </td>
                    <td className="p-3 text-slate-400 font-medium">{ing.scaledUnit}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${ing.baseCalculationGroup ? "bg-amber-950/40 border border-amber-900/30 text-amber-400" : ing.calculationType === "bakers_percentage" ? "bg-sky-950/40 border border-sky-900/30 text-sky-400" : "bg-slate-800 text-slate-400"}`}>
                        {ing.baseCalculationGroup ? "Base Flour" : ing.calculationType === "bakers_percentage" ? `${ing.percentageOfBase}% Baker's` : "Fixed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <RecipeScalingPanel recipe={recipe} vessels={vessels} onScaleChange={handleScaleChange} currentMultiplier={finalMultiplier} />

        <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1">
            <Info className="w-4 h-4 text-sky-400" /> Batch Summary
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between border-b border-white/5 pb-2"><span>Target Yield:</span><span className="font-bold text-slate-100">{(recipe.yieldCount * finalMultiplier).toFixed(1)} {recipe.yieldUnit}</span></div>
            <div className="flex justify-between border-b border-white/5 pb-2"><span>Total Batch Weight:</span><span className="font-bold text-slate-100">{scaledIngredients.reduce((acc, item) => acc + item.weightInGrams, 0).toFixed(0)} g</span></div>
            <div className="flex justify-between pb-1"><span>Target Pan/Vessel:</span><span className="font-bold text-slate-100">{recipe.vessel?.name || "Standard Yield"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
