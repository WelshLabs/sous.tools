"use client";

import React, { useState, useEffect } from "react";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { Button, calculateRecipeScale } from "@soustools/ui";
import { ArrowLeft, Play, Info, Scale, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { RecipeScalingPanel } from "./recipe-scaling-panel";
import { RecipeNutritionPanel } from "./recipe-nutrition-panel";
import { RecipeIngredientsTable } from "./recipe-ingredients-table";
import { RecipeCostPanel } from "./recipe-cost-panel";
import { WastageEntryModal } from "./wastage-entry-modal";
import { VersionHistoryDrawer } from "./version-history-drawer";

interface RecipeViewerProps {
  recipeId: string;
}

export const RecipeViewer: React.FC<RecipeViewerProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [vessels, setVessels] = useState<VesselProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiplier, setMultiplier] = useState(1.0);
  const [customWeights, setCustomWeights] = useState<Record<string, { amount: number; unit: string }>>({});
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/recipes/vessels")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setVessels(payload.data || []);
      });

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
      const { multiplier: m } = calculateRecipeScale(recipe.recipeIngredients || [], recipe.yieldCount, {
        targetTotalWeight: customOpts.weight
      });
      setMultiplier(m);
    } else {
      setMultiplier(mult);
    }
    setCustomWeights({});
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-zinc-900 dark:text-slate-100 max-w-6xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Link href="/recipes" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
            <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-slate-100 font-brand">{recipe.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setIsHistoryOpen(true)} className="bg-zinc-800 hover:bg-zinc-750 text-slate-300 font-bold flex items-center gap-1.5 shadow-lg border border-black/10 dark:border-white/10">
              <History className="w-4 h-4" /> History
            </Button>
            <Link href={`/recipes/${recipeId}/kitchen`}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-lg">
                <Play className="w-4 h-4 fill-current" /> Active Kitchen Mode
              </Button>
            </Link>
          </div>
        </header>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-300">Ingredients Checklist</h3>
          <RecipeIngredientsTable ingredients={scaledIngredients} onWeightChange={handleIngredientWeightChange} />
        </div>

        {recipe.instructions && recipe.instructions.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-300">Instructions</h3>
            <div className="space-y-3">
              {recipe.instructions.map((step, idx) => {
                const stepText = typeof step === "string" ? step : (step as any).text;
                return (
                  <div key={idx} className="flex gap-4 p-4 bg-zinc-900/50 rounded-xl border border-black/5 dark:border-white/5">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </div>
                    <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {stepText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RecipeScalingPanel recipe={recipe} vessels={vessels} onScaleChange={handleScaleChange} currentMultiplier={finalMultiplier} />
        <RecipeCostPanel recipeId={recipeId} />
        <RecipeNutritionPanel recipeId={recipeId} />

        <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1">
            <Info className="w-4 h-4 text-sky-400" /> Batch Summary
          </h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2"><span>Target Yield:</span><span className="font-bold text-zinc-900 dark:text-slate-100">{(recipe.yieldCount * finalMultiplier).toFixed(1)} {recipe.yieldUnit}</span></div>
            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2"><span>Total Batch Weight:</span><span className="font-bold text-zinc-900 dark:text-slate-100">{scaledIngredients.reduce((acc, item) => acc + item.weightInGrams, 0).toFixed(0)} g</span></div>
            <div className="flex justify-between border-b border-black/5 dark:border-white/5 pb-2"><span>Target Pan/Vessel:</span><span className="font-bold text-zinc-900 dark:text-slate-100">{recipe.vessel?.name || "Standard Yield"}</span></div>
          </div>
          <Button size="sm" onClick={() => setIsWastageOpen(true)} className="w-full bg-red-950/40 hover:bg-red-900/40 border border-red-900/30 text-red-400 font-bold flex items-center justify-center gap-1.5">
            <Trash2 className="w-4 h-4" /> Log Food Waste
          </Button>
        </div>
      </div>

      <WastageEntryModal isOpen={isWastageOpen} onClose={() => setIsWastageOpen(false)} />
      <VersionHistoryDrawer recipeId={recipeId} isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
};
