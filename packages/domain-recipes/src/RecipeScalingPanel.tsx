"use client";

import React from "react";
import { useState, useEffect } from "react";
import { type Recipe, type VesselProfile } from "@soustools/api-types";
import { Scale } from "lucide-react";

/** Scale mode options. */
export type ScaleMode = "yield" | "weight" | "vessel";

/** Custom weight override options for the "weight" scale mode. */
export interface CustomWeightOpts {
  mode: "weight";
  weight: number;
}

/**
 * Props for the RecipeScalingPanel component.
 */
export interface RecipeScalingPanelProps {
  /** The recipe to scale. Used to read yieldCount and vesselId. */
  recipe: Recipe;
  /** Available vessel profiles for vessel-based scaling. */
  vessels: VesselProfile[];
  /**
   * Called whenever the scale mode/target changes.
   * - `multiplier` is a simple linear scale factor (1.0 = no change).
   * - `customOpts` is passed for weight-mode scaling with a target grams value.
   */
  onScaleChange: (multiplier: number, customOpts?: CustomWeightOpts) => void;
  /** The currently applied multiplier, displayed as feedback. */
  currentMultiplier: number;
}

/**
 * RecipeScalingPanel — a tri-mode scaling control for the recipe viewer.
 *
 * Modes:
 * - **Yield**: target a specific yield count, derives multiplier proportionally.
 * - **Weight**: target a total batch weight in grams.
 * - **Vessel**: swap to a different vessel profile, scales by volume ratio.
 *
 * Uses the Neon-Glass `--color-card` surface with `--color-input` form fields.
 * The active mode tab uses `--color-primary` (cyan #4cc9f0).
 *
 * **Presentation boundary**: No data-fetching. All data arrives via props.
 *
 * @tenant-docs-export
 * # RecipeScalingPanel
 * ```tsx
 * import { RecipeScalingPanel } from "@soustools/domain-recipes";
 *
 * <RecipeScalingPanel
 *   recipe={recipe}
 *   vessels={vessels}
 *   onScaleChange={handleScaleChange}
 *   currentMultiplier={multiplier}
 * />
 * ```
 */
export function RecipeScalingPanel({
  recipe,
  vessels,
  onScaleChange,
  currentMultiplier,
}: RecipeScalingPanelProps) {
  const [scaleMode, setScaleMode] = useState<ScaleMode>("yield");
  const [targetYield, setTargetYield] = useState(recipe.yieldCount);
  const [targetWeight, setTargetWeight] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    recipe.vesselId || "",
  );

  useEffect(() => {
    if (scaleMode === "yield") {
      onScaleChange(targetYield / recipe.yieldCount);
    }
  }, [scaleMode, targetYield, recipe.yieldCount, onScaleChange]);

  useEffect(() => {
    if (scaleMode === "vessel" && selectedVesselId) {
      const currentVessel = vessels.find((v) => v.id === recipe.vesselId);
      const targetVessel = vessels.find((v) => v.id === selectedVesselId);
      if (currentVessel && targetVessel) {
        onScaleChange(targetVessel.volumeMl / currentVessel.volumeMl);
      }
    }
  }, [scaleMode, selectedVesselId, vessels, recipe.vesselId, onScaleChange]);

  const handleWeightChange = (val: string) => {
    setTargetWeight(val);
    const weightNum = parseFloat(val) || 0;
    if (weightNum > 0) {
      onScaleChange(0, { mode: "weight", weight: weightNum });
    } else {
      onScaleChange(1.0);
    }
  };

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none";
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  return (
    <div
      className="p-4 rounded-2xl space-y-4"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3
        className="text-sm font-bold flex items-center gap-1.5"
        style={{ color: "var(--color-foreground)" }}
      >
        <Scale className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
        Hybrid Scaling Tool
      </h3>

      {/* Mode toggle tabs */}
      <div
        className="flex gap-2 p-1 rounded-lg text-xs"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        {(["yield", "weight", "vessel"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setScaleMode(mode)}
            className="flex-1 py-1.5 rounded-md capitalize font-bold transition-all cursor-pointer"
            style={
              scaleMode === mode
                ? {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                    boxShadow: "0 1px 4px rgb(0 0 0 / 0.2)",
                  }
                : { color: "var(--color-muted-foreground)" }
            }
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {scaleMode === "yield" && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                className="block text-[10px] font-bold uppercase mb-1"
                style={labelStyle}
              >
                Target Yield
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={targetYield}
                onChange={(e) =>
                  setTargetYield(parseFloat(e.target.value) || 1)
                }
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div
              className="text-xs pt-4 font-semibold"
              style={labelStyle}
            >
              Multiplier: {currentMultiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {scaleMode === "weight" && (
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                className="block text-[10px] font-bold uppercase mb-1"
                style={labelStyle}
              >
                Target Total Batch Weight (g)
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={targetWeight}
                onChange={(e) => handleWeightChange(e.target.value)}
                placeholder="Enter target grams..."
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div className="text-xs pt-4 font-semibold" style={labelStyle}>
              Multiplier: {currentMultiplier.toFixed(2)}x
            </div>
          </div>
        )}

        {scaleMode === "vessel" && (
          <div className="space-y-2">
            <div>
              <label
                className="block text-[10px] font-bold uppercase mb-1"
                style={labelStyle}
              >
                Swap Vessel Profile
              </label>
              <select
                value={selectedVesselId}
                onChange={(e) => setSelectedVesselId(e.target.value)}
                className={inputClass}
                style={inputStyle}
                disabled={!recipe.vesselId}
              >
                <option value="">Select Target Pan...</option>
                {vessels.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.volumeMl} ml)
                  </option>
                ))}
              </select>
              {!recipe.vesselId && (
                <p
                  className="text-[10px] mt-1 font-semibold"
                  style={{ color: "#f59e0b" }}
                >
                  * First select a default vessel in the recipe builder.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
