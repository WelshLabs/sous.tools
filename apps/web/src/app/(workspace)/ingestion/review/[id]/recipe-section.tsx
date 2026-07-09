"use client";

import React from "react";
import { RecipeIngredientRow } from "./recipe-ingredient-row";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface RecipeSectionProps {
  recipes: any[];
  expandedRecipes: Record<number, boolean>;
  toggleExpand: (index: number) => void;
  disabled: boolean;
  items: { id: string; name: string; each_weight_g: number | null }[];
  handleIngredientUpdate: (rIdx: number, ingIdx: number, field: string, value: any) => void;
  handleCreateRecipeItem: (name: string, recipeIndex: number, ingIndex: number) => void;
  handleUpdate: (recipeIndex: number, field: string, value: any) => void;
  parsed: any;
  onChange: (newData: string) => void;
}

export function RecipeSection({
  recipes,
  expandedRecipes,
  toggleExpand,
  disabled,
  items,
  handleIngredientUpdate,
  handleCreateRecipeItem,
  handleUpdate,
  parsed,
  onChange,
}: RecipeSectionProps) {


  return (
    <>
      {recipes.map((recipe: any, rIdx: number) => {
        const isExpanded = expandedRecipes[rIdx] !== false;

        // Group ingredients by component
        const components: Record<string, any[]> = {};

        (recipe.ingredients || []).forEach((ing: any, i: number) => {
          const comp = ing.component || "Base Recipe";
          if (!components[comp]) components[comp] = [];
          components[comp].push({ ...ing, originalIndex: i });
        });

        return (
          <div
            key={rIdx}
            className="border border-black/10 dark:border-white/10 rounded-xl bg-card/50 overflow-hidden shadow-sm"
          >
            <div
              className="p-3 bg-black/5 bg-card flex items-center gap-2 cursor-pointer hover:bg-black/10 dark:bg-white/10"
              onClick={() => toggleExpand(rIdx)}
            >
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
              <span className="font-bold text-sky-400">
                {recipe.title || "Untitled Recipe"}
              </span>
            </div>

            {isExpanded && (
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                      Title
                    </label>
                    <input
                      disabled={disabled}
                      type="text"
                      value={recipe.title || ""}
                      onChange={(e) =>
                        handleUpdate(rIdx, "title", e.target.value)
                      }
                      className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                        Yield
                      </label>
                      <input
                        disabled={disabled}
                        type="number"
                        value={recipe.yieldCount || 1}
                        onChange={(e) =>
                          handleUpdate(
                            rIdx,
                            "yieldCount",
                            Number(e.target.value),
                          )
                        }
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-muted-foreground font-bold uppercase tracking-wide">
                        Unit
                      </label>
                      <input
                        disabled={disabled}
                        type="text"
                        value={recipe.yieldUnit || "servings"}
                        onChange={(e) =>
                          handleUpdate(rIdx, "yieldUnit", e.target.value)
                        }
                        className="w-full bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-black/10 dark:border-white/10 pb-2">
                    <h4 className="text-sm font-semibold">Ingredients</h4>
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => {
                        // Math logic: Calculate base weights per component
                        const componentBaseWeights: Record<string, number> = {};
                        const ings = recipe.ingredients || [];
                        ings.forEach((ing: any) => {
                          if (ing.baseCalculationGroup) {
                            const comp = ing.component || "Base Recipe";
                            componentBaseWeights[comp] =
                              (componentBaseWeights[comp] || 0) +
                              Number(ing.amount || 0);
                          }
                        });

                        const hasAnyBase = Object.values(
                          componentBaseWeights,
                        ).some((w) => w > 0);
                        if (!hasAnyBase) {
                          alert(
                            "Please select at least one Base ingredient (in any component) to convert!",
                          );
                          return;
                        }

                        // Convert ingredients to percentages relative to their component's base weight
                        const newData = { ...parsed };
                        const targetRecipe = newData.recipes
                          ? newData.recipes[rIdx]
                          : newData;

                        targetRecipe.ingredients = targetRecipe.ingredients.map(
                          (ing: any) => {
                            const comp = ing.component || "Base Recipe";
                            const compBaseWeight =
                              componentBaseWeights[comp] || 0;

                            if (compBaseWeight === 0) return ing; // Skip if no base for this component

                            const originalAmount = Number(ing.amount || 0);
                            const percentage =
                              (originalAmount / compBaseWeight) * 100;
                            return {
                              ...ing,
                              amount: Number(percentage.toFixed(2)),
                              unit: "%",
                              calculationType: "BAKERS_PERCENTAGE",
                              // Keep baseCalculationGroup true for the base items
                            };
                          },
                        );

                        onChange(JSON.stringify(newData, null, 2));
                      }}
                      className="text-xs bg-amber-500/20 text-amber-400 px-3 py-1 rounded hover:bg-amber-500/30 transition-colors"
                    >
                      Convert to Baker's %
                    </button>
                  </div>

                  {Object.entries(components).map(([compName, ings]) => (
                    <div key={compName} className="space-y-3">
                      <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-1 rounded inline-block">
                        {compName}
                      </h5>
                      <div className="space-y-2">
                        {ings.map((ing: any) => (
                          <RecipeIngredientRow
                            key={ing.originalIndex}
                            ing={ing}
                            rIdx={rIdx}
                            disabled={disabled}
                            items={items}
                            handleIngredientUpdate={handleIngredientUpdate}
                            handleCreateRecipeItem={handleCreateRecipeItem}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

    </>
  );
}
