"use client";

import React, { useState, useEffect } from "react";
import { MasterIngredient } from "@soustools/api-types";
import { Plus, Trash2 } from "lucide-react";

interface RecipeBuilderIngredientsProps {
  lines: any[];
  onChange: (lines: any[]) => void;
}

export const RecipeBuilderIngredients: React.FC<RecipeBuilderIngredientsProps> = ({
  lines,
  onChange,
}) => {
  const [masterIngredients, setMasterIngredients] = useState<MasterIngredient[]>([]);

  useEffect(() => {
    fetch("/api/recipes/ingredients")
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setMasterIngredients(payload.data || []);
      })
      .catch((err) => console.error("Failed to load ingredients", err));
  }, []);

  const handleAddLine = () => {
    onChange([
      ...lines,
      {
        masterIngredientId: masterIngredients[0]?.id || "",
        amount: 100,
        unit: "g",
        calculationType: "fixed_weight",
        baseCalculationGroup: false,
        prepNotes: "",
      },
    ]);
  };

  const handleRemoveLine = (idx: number) => {
    onChange(lines.filter((_, i) => i !== idx));
  };

  const handleUpdateLine = (idx: number, fields: any) => {
    onChange(lines.map((line, i) => (i === idx ? { ...line, ...fields } : line)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-300">Recipe Ingredients</h4>
        <button type="button" onClick={handleAddLine} className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add Ingredient
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-800 rounded-lg">
          No ingredients added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-zinc-900 border border-white/5 flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="flex-1 w-full">
                <select value={line.masterIngredientId || ""} onChange={(e) => handleUpdateLine(idx, { masterIngredientId: e.target.value || null })} className="w-full bg-zinc-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200">
                  <option value="">-- Unmapped Item {line.rawName ? `(${line.rawName})` : ""} --</option>
                  {masterIngredients.map((mi) => (
                    <option key={mi.id} value={mi.id}>{mi.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <input type="number" step="any" value={line.amount} onChange={(e) => handleUpdateLine(idx, { amount: parseFloat(e.target.value) || 0 })} placeholder="Amt" className="w-20 bg-zinc-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200" required />
                <select value={line.unit} onChange={(e) => handleUpdateLine(idx, { unit: e.target.value })} className="w-20 bg-zinc-800 border border-white/5 rounded-lg px-2 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="oz">oz</option>
                  <option value="lb">lb</option>
                  <option value="ml">ml</option>
                  <option value="l">l</option>
                  <option value="tsp">tsp</option>
                  <option value="tbsp">tbsp</option>
                  <option value="cup">cup</option>
                  <option value="count">count</option>
                  <option value="%">%</option>
                </select>
              </div>

              <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-start">
                <select value={line.calculationType} onChange={(e) => handleUpdateLine(idx, { calculationType: e.target.value })} className="bg-zinc-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200">
                  <option value="fixed_weight">Fixed Weight</option>
                  <option value="bakers_percentage">Baker's %</option>
                </select>

                <label className="flex items-center gap-1.5 text-xs text-slate-400 select-none cursor-pointer">
                  <input type="checkbox" checked={line.baseCalculationGroup} onChange={(e) => handleUpdateLine(idx, { baseCalculationGroup: e.target.checked })} className="rounded bg-zinc-850 border-white/10 text-sky-500 focus:ring-0 focus:ring-offset-0" />
                  Base Flour
                </label>
              </div>

              <input type="text" value={line.prepNotes} onChange={(e) => handleUpdateLine(idx, { prepNotes: e.target.value })} placeholder="Prep Notes (e.g. sifted, ice cold)" className="flex-1 min-w-[150px] w-full bg-zinc-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200" />

              <button type="button" onClick={() => handleRemoveLine(idx)} className="p-1.5 bg-red-950/10 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors cursor-pointer self-end md:self-auto">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
