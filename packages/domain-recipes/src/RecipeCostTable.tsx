"use client";

import type React from "react";
import type { RecipeCostData } from "./types";

export interface RecipeCostTableProps {
  ingredients: RecipeCostData["ingredients"];
}

export function RecipeCostTable({ ingredients }: RecipeCostTableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full text-xs text-left"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <th className="py-1">Ingredient</th>
            <th className="py-1 text-right">Weight (g)</th>
            <th className="py-1 text-right">Cost ($)</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr
              key={ing.ingredientId}
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <td className="py-1.5">{ing.name}</td>
              <td className="py-1.5 text-right">{ing.weightG.toFixed(0)}</td>
              <td className="py-1.5 text-right">${ing.costUsd.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
