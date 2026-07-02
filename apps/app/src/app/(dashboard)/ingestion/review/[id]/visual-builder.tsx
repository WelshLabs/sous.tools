"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronDown, ChevronRight } from "lucide-react";

interface VisualBuilderProps {
  editedData: string;
  onChange: (newData: string) => void;
  disabled: boolean;
  organizationId: string;
}

export function VisualBuilder({
  editedData,
  onChange,
  disabled,
  organizationId,
}: VisualBuilderProps) {
  const [items, setItems] = useState<{ id: string; name: string }[]>([]);
  const [expandedRecipes, setExpandedRecipes] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("items")
        .select("id, name")
        .eq("organization_id", organizationId)
        .order("name");
      if (data) {
        setItems(data.map((d: any) => ({ id: d.id, name: d.name })));
      }
    };
    if (organizationId) fetchItems();
  }, [organizationId]);

  let parsed: any = {};
  try {
    parsed = JSON.parse(editedData);
  } catch (e) {
    return (
      <div className="p-4 text-red-400">
        Invalid JSON data. Use JSON Editor to fix.
      </div>
    );
  }

  // Auto-map ingredient itemIds based on raw names when items load
  useEffect(() => {
    if (items.length === 0 || disabled) return;
    let modified = false;
    const newData = { ...parsed };
    const targetRecipes = newData.recipes
      ? newData.recipes
      : newData.title && newData.ingredients
        ? [newData]
        : [];

    targetRecipes.forEach((recipe: any) => {
      if (recipe.ingredients) {
        recipe.ingredients.forEach((ing: any) => {
          if (!ing.itemId && ing.name) {
            const match = items.find(
              (i) =>
                i.name.toLowerCase() === String(ing.name).trim().toLowerCase(),
            );
            if (match) {
              ing.itemId = match.id;
              modified = true;
            }
          }
        });
      }
    });

    if (modified) {
      onChange(JSON.stringify(newData, null, 2));
    }
  }, [items, parsed, disabled, onChange]);

  const recipes = parsed.recipes
    ? parsed.recipes
    : parsed.title && parsed.ingredients
      ? [parsed]
      : [];

  if (recipes.length === 0) {
    return (
      <div className="p-4 text-zinc-500 dark:text-zinc-400">
        No recipes found in data.
      </div>
    );
  }

  const handleUpdate = (recipeIndex: number, field: string, value: any) => {
    const newData = { ...parsed };
    if (newData.recipes) {
      newData.recipes[recipeIndex][field] = value;
    } else {
      newData[field] = value;
    }
    onChange(JSON.stringify(newData, null, 2));
  };

  const handleIngredientUpdate = (
    recipeIndex: number,
    ingIndex: number,
    field: string,
    value: any,
  ) => {
    const newData = { ...parsed };
    const targetRecipe = newData.recipes
      ? newData.recipes[recipeIndex]
      : newData;
    targetRecipe.ingredients[ingIndex][field] = value;
    onChange(JSON.stringify(newData, null, 2));
  };

  const toggleExpand = (i: number) => {
    setExpandedRecipes((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  return (
    <div className="flex-1 overflow-y-auto bg-black/5 dark:bg-black/40 p-4 space-y-4">
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
              className="p-3 bg-black/5 dark:bg-white/5 flex items-center gap-2 cursor-pointer hover:bg-black/10 dark:bg-white/10"
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
                    <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
                      Title
                    </label>
                    <input
                      disabled={disabled}
                      type="text"
                      value={recipe.title || ""}
                      onChange={(e) =>
                        handleUpdate(rIdx, "title", e.target.value)
                      }
                      className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
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
                        className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide">
                        Unit
                      </label>
                      <input
                        disabled={disabled}
                        type="text"
                        value={recipe.yieldUnit || "servings"}
                        onChange={(e) =>
                          handleUpdate(rIdx, "yieldUnit", e.target.value)
                        }
                        className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm mt-1 focus:border-sky-500 outline-none"
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
                        {ings.map((ing) => (
                          <div
                            key={ing.originalIndex}
                            className="grid grid-cols-12 gap-3 items-center bg-black/30 p-3 rounded-lg border border-black/5 dark:border-white/5"
                          >
                            <div className="col-span-4 flex flex-col gap-1 relative">
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.name || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "name",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Raw Name (from text)"
                              />
                              <select
                                disabled={disabled}
                                value={ing.itemId || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "itemId",
                                    e.target.value || null,
                                  )
                                }
                                className={`w-full bg-black/5 dark:bg-black/40 border rounded px-2 py-1.5 text-sm outline-none transition-colors ${
                                  !ing.itemId
                                    ? "border-red-500/70 text-red-300 focus:border-red-400"
                                    : "border-black/10 dark:border-white/10 text-emerald-400 focus:border-sky-500"
                                }`}
                              >
                                <option value="">
                                  ⚠️ Select Master Ingredient...
                                </option>
                                {items.map((it) => (
                                  <option key={it.id} value={it.id}>
                                    {it.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="col-span-3 flex gap-1">
                              <input
                                disabled={disabled}
                                type="number"
                                value={ing.amount || 0}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "amount",
                                    Number(e.target.value),
                                  )
                                }
                                className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
                              />
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.unit || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "unit",
                                    e.target.value,
                                  )
                                }
                                className="w-16 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Unit"
                              />
                            </div>
                            <div className="col-span-5 flex flex-col gap-2">
                              <div className="flex items-center gap-2">
                                <select
                                  disabled={disabled}
                                  value={ing.calculationType || "WEIGHT"}
                                  onChange={(e) =>
                                    handleIngredientUpdate(
                                      rIdx,
                                      ing.originalIndex,
                                      "calculationType",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs focus:border-sky-500 outline-none"
                                >
                                  <option value="WEIGHT">Weight</option>
                                  <option value="VOLUME">Volume</option>
                                  <option value="COUNT">Count</option>
                                  <option value="BAKERS_PERCENTAGE">
                                    Baker's %
                                  </option>
                                </select>

                                {ing.calculationType ===
                                  "BAKERS_PERCENTAGE" && (
                                  <label className="flex items-center gap-1.5 text-xs text-amber-400 cursor-pointer whitespace-nowrap bg-amber-400/10 px-2 py-1 rounded">
                                    <input
                                      disabled={disabled}
                                      type="checkbox"
                                      checked={
                                        ing.baseCalculationGroup || false
                                      }
                                      onChange={(e) =>
                                        handleIngredientUpdate(
                                          rIdx,
                                          ing.originalIndex,
                                          "baseCalculationGroup",
                                          e.target.checked,
                                        )
                                      }
                                      className="accent-amber-500"
                                    />
                                    Base
                                  </label>
                                )}
                              </div>
                              <input
                                disabled={disabled}
                                type="text"
                                value={ing.component || ""}
                                onChange={(e) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "component",
                                    e.target.value || null,
                                  )
                                }
                                placeholder="Section (e.g. Glaze)"
                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none text-zinc-500 dark:text-zinc-400"
                              />
                            </div>
                          </div>
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
    </div>
  );
}
