"use client";

import React from "react";
import { ScaledIngredient } from "./types";

/**
 * Props for the RecipeIngredientsTable component.
 */
export interface RecipeIngredientsTableProps {
  /** Scaled ingredient rows to display in the table. */
  ingredients: ScaledIngredient[];
  /**
   * Called when the user manually edits an ingredient's weight.
   * The app layer recalculates scaling when this fires.
   */
  onWeightChange: (ingId: string, amount: number, unit: string) => void;
  /** Available master ingredients to calculate live costs. */
  masterIngredients?: import("@soustools/api-types").MasterIngredient[];
}

/**
 * RecipeIngredientsTable — a compact table of scaled ingredient rows with
 * inline editable weight inputs.
 *
 * Uses the Neon-Glass `--color-card` surface with `--color-border` dividers.
 * Baker's % type badge: `--color-primary` (cyan). Base Flour: `--color-warning`
 * (amber). Fixed: muted surface.
 *
 * @tenant-docs-export
 * # RecipeIngredientsTable
 * ```tsx
 * import { RecipeIngredientsTable } from "@soustools/domain-recipes";
 *
 * <RecipeIngredientsTable
 *   ingredients={scaledIngredients}
 *   onWeightChange={handleWeightChange}
 * />
 * ```
 */
export function RecipeIngredientsTable({
  ingredients,
  onWeightChange,
  masterIngredients,
}: RecipeIngredientsTableProps) {
  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.50)", // --color-card @ 50%
        border: "1px solid var(--color-border)",
      }}
    >
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr
            style={{
              backgroundColor: "var(--color-card)",
              borderBottom: "1px solid var(--color-border)",
              color: "var(--color-muted-foreground)",
            }}
            className="uppercase font-semibold tracking-wider"
          >
            <th className="p-3">Ingredient</th>
            <th className="p-3 w-32">Scaled Weight</th>
            <th className="p-3 w-24">Unit</th>
            <th className="p-3">Type</th>
            <th className="p-3 w-24 text-right">Cost</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr
              key={ing.ingredientId}
              className="transition-colors"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <td
                className="p-3 font-semibold"
                style={{ color: "var(--color-foreground)" }}
              >
                {ing.name}
              </td>
              <td className="p-3">
                <input
                  type="number"
                  step="any"
                  value={Number(ing.scaledAmount.toFixed(1))}
                  onChange={(e) =>
                    onWeightChange(
                      ing.ingredientId,
                      parseFloat(e.target.value) || 0,
                      ing.scaledUnit,
                    )
                  }
                  className="w-24 rounded px-2 py-1 focus:outline-none text-xs font-bold"
                  style={{
                    backgroundColor: "var(--color-input)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                />
              </td>
              <td
                className="p-3 font-medium"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {ing.scaledUnit}
              </td>
              <td className="p-3">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                  style={
                    ing.baseCalculationGroup
                      ? {
                          backgroundColor: "rgb(245 158 11 / 0.15)",
                          border: "1px solid rgb(245 158 11 / 0.25)",
                          color: "#f59e0b",
                        }
                      : ing.calculationType === "bakers_percentage"
                        ? {
                            backgroundColor: "rgb(76 201 240 / 0.10)",
                            border: "1px solid rgb(76 201 240 / 0.20)",
                            color: "var(--color-primary)",
                          }
                        : {
                            backgroundColor: "var(--color-secondary)",
                            color: "var(--color-muted-foreground)",
                          }
                  }
                >
                  {ing.baseCalculationGroup
                    ? "Base Flour"
                    : ing.calculationType === "bakers_percentage"
                      ? `${ing.percentageOfBase}% Baker's`
                      : "Fixed"}
                </span>
              </td>
              <td className="p-3 text-right font-medium text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>
                {(() => {
                  const masterIng = masterIngredients?.find(m => m.id === ing.ingredientId);
                  if (masterIng && masterIng.currentCostPerG) {
                    return `$${(masterIng.currentCostPerG * ing.weightInGrams).toFixed(2)}`;
                  }
                  return "—";
                })()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
