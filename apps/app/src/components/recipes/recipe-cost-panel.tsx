"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Save } from "lucide-react";

interface CostIngredient {
  ingredientId: string;
  name: string;
  weightG: number;
  costUsd: number;
}

interface RecipeCost {
  totalCostUsd: number;
  costPerServingUsd: number;
  linkedSalePrice?: number;
  marginPct?: number;
  ingredients: CostIngredient[];
}

export function RecipeCostPanel({ recipeId }: { recipeId: string }) {
  const [costData, setCostData] = useState<RecipeCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedText, setSavedText] = useState(false);

  useEffect(() => {
    async function loadCost() {
      try {
        const res = await fetch(`/api/recipes/${recipeId}/cost`);
        const json = await res.json();
        if (json.success && json.data) {
          setCostData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCost();
  }, [recipeId]);

  const saveVersion = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/recipes/${recipeId}/versions`, {
        method: "POST",
      });
      const json = await res.json();
      if (json.success) {
        setSavedText(true);
        setTimeout(() => setSavedText(false), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xl glass-panel animate-pulse space-y-3">
        <div className="h-4 bg-zinc-700 rounded w-1/3"></div>
        <div className="h-10 bg-zinc-700 rounded"></div>
        <div className="h-20 bg-zinc-700 rounded"></div>
      </div>
    );
  }

  if (!costData || costData.ingredients.length === 0) {
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xl glass-panel text-amber-400 text-sm text-center">
        No cost data — add prices to ingredients via the Items ledger.
      </div>
    );
  }

  const { totalCostUsd, costPerServingUsd, linkedSalePrice, marginPct } = costData;

  const marginColor =
    marginPct === undefined
      ? "text-red-400"
      : marginPct > 30
      ? "text-emerald-400"
      : marginPct >= 10
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div className="bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-2xl p-4 shadow-xl glass-panel space-y-4 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="text-emerald-400 w-5 h-5" />
          <h3 className="font-semibold text-sm">Cost Breakdown</h3>
        </div>
        <button
          onClick={saveVersion}
          disabled={saving}
          className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-750 border border-black/10 dark:border-white/10 px-2 py-1 rounded transition"
        >
          {savedText ? "✓ Saved" : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Version</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="bg-zinc-850 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Cost</p>
          <p className="text-sm font-semibold">${totalCostUsd.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-850 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Per Serving</p>
          <p className="text-sm font-semibold">${costPerServingUsd.toFixed(2)}</p>
        </div>
        <div className="bg-zinc-850 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Sale Price</p>
          <p className="text-sm font-semibold">
            {linkedSalePrice ? `$${linkedSalePrice.toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="bg-zinc-850 p-2 rounded-lg border border-black/5 dark:border-white/5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Margin</p>
          <p className={`text-sm font-semibold ${marginColor}`}>
            {marginPct !== undefined ? `${marginPct.toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-zinc-700 dark:text-zinc-300">
          <thead>
            <tr className="border-b border-black/5 dark:border-white/5 text-zinc-500 dark:text-zinc-400">
              <th className="py-1">Ingredient</th>
              <th className="py-1 text-right">Weight (g)</th>
              <th className="py-1 text-right">Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {costData.ingredients.map((ing) => (
              <tr key={ing.ingredientId} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1.5">{ing.name}</td>
                <td className="py-1.5 text-right">{ing.weightG.toFixed(0)}</td>
                <td className="py-1.5 text-right">${ing.costUsd.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
