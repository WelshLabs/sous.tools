"use client";

import React from "react";
import { CreatableSelect } from "./creatable-select";

export interface RecipeIngredientRowProps {
  ing: any;
  rIdx: number;
  disabled: boolean;
  items: { id: string; name: string; each_weight_g: number | null }[];
  handleIngredientUpdate: (rIdx: number, ingIdx: number, field: string, value: any) => void;
  handleCreateRecipeItem: (name: string, recipeIndex: number, ingIndex: number) => void;
}

export function RecipeIngredientRow({
  ing,
  rIdx,
  disabled,
  items,
  handleIngredientUpdate,
  handleCreateRecipeItem,
}: RecipeIngredientRowProps) {
  return (
                          <div
                            key={ing.originalIndex}
                            className="grid grid-cols-12 gap-3 items-center bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
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
                                className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none placeholder:text-white/20"
                                placeholder="Raw Name (from text)"
                              />
                              <CreatableSelect
                                disabled={disabled}
                                value={ing.itemId || ""}
                                options={items}
                                onChange={(val) =>
                                  handleIngredientUpdate(
                                    rIdx,
                                    ing.originalIndex,
                                    "itemId",
                                    val,
                                  )
                                }
                                onCreate={(name) => handleCreateRecipeItem(name, rIdx, ing.originalIndex)}
                                placeholder="⚠️ Select Master Ingredient..."
                              />
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
                                className="w-16 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none"
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
                                className="w-16 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-sm focus:border-sky-500 outline-none placeholder:text-white/20"
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
                                  className="flex-1 bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1.5 text-xs focus:border-sky-500 outline-none"
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
                                className="w-full bg-black/5 bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-xs focus:border-sky-500 outline-none text-zinc-500 dark:text-muted-foreground"
                              />
                            </div>
                          </div>

  );
}
