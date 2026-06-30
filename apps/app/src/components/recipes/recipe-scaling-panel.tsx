"use client";

import React, { useState, useEffect } from "react";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { Scale } from "lucide-react";

interface RecipeScalingPanelProps {
  recipe: Recipe;
  vessels: VesselProfile[];
  onScaleChange: (multiplier: number, customWeights?: any) => void;
  currentMultiplier: number;
}

export const RecipeScalingPanel: React.FC<RecipeScalingPanelProps> = ({
  recipe,
  vessels,
  onScaleChange,
  currentMultiplier,
}) => {
  const [scaleMode, setScaleMode] = useState<"yield" | "weight" | "vessel">("yield");
  const [targetYield, setTargetYield] = useState(recipe.yieldCount);
  const [targetWeight, setTargetWeight] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(recipe.vesselId || "");

  useEffect(() => {
    if (scaleMode === "yield") {
      onScaleChange(targetYield / recipe.yieldCount);
    }
  }, [targetYield, scaleMode]);

  useEffect(() => {
    if (scaleMode === "vessel" && selectedVesselId) {
      const currentVessel = vessels.find((v) => v.id === recipe.vesselId);
      const targetVessel = vessels.find((v) => v.id === selectedVesselId);
      if (currentVessel && targetVessel) {
        onScaleChange(targetVessel.volumeMl / currentVessel.volumeMl);
      }
    }
  }, [selectedVesselId, scaleMode]);

  const handleWeightChange = (val: string) => {
    setTargetWeight(val);
    const weightNum = parseFloat(val) || 0;
    if (weightNum > 0) {
      onScaleChange(0, { mode: "weight", weight: weightNum });
    } else {
      onScaleChange(1.0);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-black/5 dark:border-white/5 space-y-4">
      <h3 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
        <Scale className="w-4 h-4 text-primary" /> Hybrid Scaling Tool
      </h3>

      <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg text-xs">
        {(["yield", "weight", "vessel"] as const).map((mode) => (
          <button key={mode} type="button" onClick={() => setScaleMode(mode)} className={`flex-1 py-1.5 rounded-md capitalize font-bold transition-all cursor-pointer ${scaleMode === mode ? "bg-sky-500 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}>
            {mode}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {scaleMode === "yield" && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Target Yield</label>
              <input type="number" step="any" min="0.01" value={targetYield} onChange={(e) => setTargetYield(parseFloat(e.target.value) || 1)} className="w-full bg-zinc-800 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" />
            </div>
            <div className="text-xs text-slate-400 pt-4 font-semibold">
              Multiplier: {currentMultiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {scaleMode === "weight" && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Target Total Batch Weight (g)</label>
              <input type="number" step="any" min="0" value={targetWeight} onChange={(e) => handleWeightChange(e.target.value)} placeholder="Enter target grams..." className="w-full bg-zinc-800 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" />
            </div>
            <div className="text-xs text-slate-400 pt-4 font-semibold">
              Multiplier: {currentMultiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {scaleMode === "vessel" && (
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Swap Vessel Profile</label>
              <select value={selectedVesselId} onChange={(e) => setSelectedVesselId(e.target.value)} className="w-full bg-zinc-800 border border-black/5 dark:border-white/5 rounded-lg px-3 py-2 text-sm focus:border-sky-500 focus:outline-none text-slate-200" disabled={!recipe.vesselId}>
                <option value="">Select Target Pan...</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.volumeMl} ml)</option>
                ))}
              </select>
              {!recipe.vesselId && (
                <p className="text-[10px] text-yellow-500 mt-1 font-semibold">
                  * First select a default vessel in the recipe builder.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
