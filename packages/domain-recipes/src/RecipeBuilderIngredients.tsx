"use client";

import React from "react";
import { type MasterIngredient } from "@soustools/api-types";
import { Plus } from "lucide-react";
import { RecipeBuilderIngredientRow } from "./RecipeBuilderIngredientRow";
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
            <RecipeBuilderIngredientRow
              key={idx}
              line={line}
              idx={idx}
              masterIngredients={masterIngredients}
              handleUpdateLine={handleUpdateLine}
              handleRemoveLine={handleRemoveLine}
            />
          ))}
        </div>
      )}
    </div>
  );
}
