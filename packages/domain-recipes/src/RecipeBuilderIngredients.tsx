"use client";

import React from "react";
import { type MasterIngredient } from "@soustools/api-types";
import { Plus, Trash2 } from "lucide-react";
import { type RecipeIngredientLine } from "./types";

/**
 * Props for the RecipeBuilderIngredients component.
 */
export interface RecipeBuilderIngredientsProps {
  /** The list of ingredient lines currently in the form. */
  lines: RecipeIngredientLine[];
  /** Callback fired when the lines array changes. */
  onChange: (lines: RecipeIngredientLine[]) => void;
  /** Available master ingredients to select from. Passed in from the app layer. */
  masterIngredients: MasterIngredient[];
}

/**
 * RecipeBuilderIngredients — A dynamic form array for adding ingredients to a recipe.
 *
 * Uses the Neon-Glass `--color-card` surface and `--color-input` inputs.
 * Base flour gets the `--color-primary` (cyan) toggle.
 *
 * **Presentation boundary**: No data fetching. Receives `masterIngredients` from props.
 *
 * @tenant-docs-export
 * # RecipeBuilderIngredients
 * ```tsx
 * import { RecipeBuilderIngredients } from "@soustools/domain-recipes";
 *
 * <RecipeBuilderIngredients
 *   lines={ingredients}
 *   onChange={setIngredients}
 *   masterIngredients={masterIngredients}
 * />
 * ```
 */
export function RecipeBuilderIngredients({
  lines,
  onChange,
  masterIngredients,
}: RecipeBuilderIngredientsProps) {
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

  const handleUpdateLine = (idx: number, fields: Partial<RecipeIngredientLine>) => {
    onChange(
      lines.map((line, i) => (i === idx ? { ...line, ...fields } : line))
    );
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4
          className="text-sm font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Recipe Ingredients
        </h4>
        <button
          type="button"
          onClick={handleAddLine}
          className="text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          style={{ color: "var(--color-primary)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Ingredient
        </button>
      </div>

      {lines.length === 0 ? (
        <div
          className="text-xs py-4 text-center border border-dashed rounded-lg"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          No ingredients added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl flex flex-col md:flex-row gap-3 items-start md:items-center"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              {/* Ingredient Select */}
              <div className="flex-1 w-full">
                <select
                  value={line.masterIngredientId || ""}
                  onChange={(e) =>
                    handleUpdateLine(idx, {
                      masterIngredientId: e.target.value || null,
                    })
                  }
                  className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  style={inputStyle}
                >
                  <option value="">
                    -- Unmapped Item {line.rawName ? `(${line.rawName})` : ""}{" "}
                    --
                  </option>
                  {masterIngredients.map((mi) => (
                    <option key={mi.id} value={mi.id}>
                      {mi.name} {mi.currentCostPerG ? `($${mi.currentCostPerG.toFixed(3)}/g)` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount and Unit */}
              <div className="flex gap-2 w-full md:w-auto">
                <input
                  type="number"
                  step="any"
                  value={line.amount}
                  onChange={(e) =>
                    handleUpdateLine(idx, {
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="Amt"
                  className="w-20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  style={inputStyle}
                  required
                />
                <select
                  value={line.unit}
                  onChange={(e) =>
                    handleUpdateLine(idx, { unit: e.target.value })
                  }
                  className="w-20 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                  style={inputStyle}
                >
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

              {/* Type and Base Flour Toggle */}
              <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-start">
                <select
                  value={line.calculationType}
                  onChange={(e) =>
                    handleUpdateLine(idx, {
                      calculationType: e.target.value as any,
                    })
                  }
                  className="rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  style={inputStyle}
                >
                  <option value="fixed_weight">Fixed Weight</option>
                  <option value="bakers_percentage">Baker's %</option>
                </select>

                <label
                  className="flex items-center gap-1.5 text-xs select-none cursor-pointer"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <input
                    type="checkbox"
                    checked={line.baseCalculationGroup}
                    onChange={(e) =>
                      handleUpdateLine(idx, {
                        baseCalculationGroup: e.target.checked,
                      })
                    }
                    className="rounded focus:ring-0 focus:ring-offset-0"
                    style={{
                      accentColor: "var(--color-primary)",
                      backgroundColor: "var(--color-input)",
                      borderColor: "var(--color-border)",
                    }}
                  />
                  Base Flour
                </label>
              </div>

              {/* Prep Notes */}
              <input
                type="text"
                value={line.prepNotes}
                onChange={(e) =>
                  handleUpdateLine(idx, { prepNotes: e.target.value })
                }
                placeholder="Prep Notes (e.g. sifted, ice cold)"
                className="flex-1 min-w-[150px] w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                style={inputStyle}
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveLine(idx)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer self-end md:self-auto"
                style={{
                  backgroundColor: "rgb(244 63 94 / 0.10)",
                  color: "var(--color-destructive)",
                }}
                aria-label="Remove ingredient"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
