"use client";

import React from "react";

interface ScaledIngredient {
  ingredientId: string;
  name: string;
  scaledAmount: number;
  scaledUnit: string;
  weightInGrams: number;
  baseCalculationGroup: boolean;
  calculationType: string;
  percentageOfBase?: number;
}

interface RecipeIngredientsTableProps {
  ingredients: ScaledIngredient[];
  onWeightChange: (ingId: string, amount: number, unit: string) => void;
}

export const RecipeIngredientsTable: React.FC<RecipeIngredientsTableProps> = ({
  ingredients,
  onWeightChange,
}) => {
  return (
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
          {ingredients.map((ing) => (
            <tr key={ing.ingredientId} className="hover:bg-white/5 transition-colors">
              <td className="p-3 font-semibold text-slate-200">{ing.name}</td>
              <td className="p-3">
                <input
                  type="number"
                  step="any"
                  value={Number(ing.scaledAmount.toFixed(1))}
                  onChange={(e) =>
                    onWeightChange(ing.ingredientId, parseFloat(e.target.value) || 0, ing.scaledUnit)
                  }
                  className="w-24 bg-zinc-800 border border-white/5 rounded px-2 py-1 focus:border-sky-500 focus:outline-none text-slate-200 text-xs font-bold"
                />
              </td>
              <td className="p-3 text-slate-400 font-medium">{ing.scaledUnit}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    ing.baseCalculationGroup
                      ? "bg-amber-950/40 border border-amber-900/30 text-amber-400"
                      : ing.calculationType === "bakers_percentage"
                      ? "bg-sky-950/40 border border-sky-900/30 text-sky-400"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {ing.baseCalculationGroup
                    ? "Base Flour"
                    : ing.calculationType === "bakers_percentage"
                    ? `${ing.percentageOfBase}% Baker's`
                    : "Fixed"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
