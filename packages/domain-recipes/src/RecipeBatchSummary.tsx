"use client";

import type React from "react";
import { Info, Trash2 } from "lucide-react";
import { Button } from "@soustools/design-system";
import type { Recipe } from "@soustools/api-types";
import type { ScaledIngredient } from "./types";

export interface RecipeBatchSummaryProps {
  recipe: Recipe;
  finalMultiplier: number;
  scaledIngredients: ScaledIngredient[];
  onOpenWastage: () => void;
}

export function RecipeBatchSummary({
  recipe,
  finalMultiplier,
  scaledIngredients,
  onOpenWastage,
}: RecipeBatchSummaryProps) {
  return (
    <div
      className="p-4 rounded-2xl space-y-4 shadow-xl"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h3
        className="text-sm font-bold flex items-center gap-1"
        style={{ color: "var(--color-foreground)" }}
      >
        <Info className="w-4 h-4" style={{ color: "var(--color-primary)" }} />{" "}
        Batch Summary
      </h3>
      <div
        className="space-y-2 text-xs"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        <div
          className="flex justify-between pb-2"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span>Target Yield:</span>
          <span className="font-bold" style={{ color: "var(--color-foreground)" }}>
            {(recipe.yieldCount * finalMultiplier).toFixed(1)}{" "}
            {recipe.yieldUnit}
          </span>
        </div>
        <div
          className="flex justify-between pb-2"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span>Total Batch Weight:</span>
          <span className="font-bold" style={{ color: "var(--color-foreground)" }}>
            {scaledIngredients
              .reduce((acc, item) => acc + item.weightInGrams, 0)
              .toFixed(0)}{" "}
            g
          </span>
        </div>
        <div
          className="flex justify-between pb-2"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <span>Target Pan/Vessel:</span>
          <span className="font-bold" style={{ color: "var(--color-foreground)" }}>
            {recipe.vessel?.name || "Standard Yield"}
          </span>
        </div>
      </div>
      <Button
        size="sm"
        onClick={onOpenWastage}
        className="w-full font-bold flex items-center justify-center gap-1.5"
        style={{
          backgroundColor: "rgb(244 63 94 / 0.15)",
          color: "var(--color-destructive)",
          borderColor: "rgb(244 63 94 / 0.3)",
        }}
      >
        <Trash2 className="w-4 h-4" /> Log Food Waste
      </Button>
    </div>
  );
}
