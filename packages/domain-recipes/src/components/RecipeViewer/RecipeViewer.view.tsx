/* eslint-disable max-lines */
import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  History,
  Scale,
  DollarSign,
  Save,
  Download,
  Activity,
  ShieldAlert,
  Info,
  Trash2,
  X,
  Loader2,
  Edit,
  Percent,
  Sparkles,
} from "lucide-react";
import { Button } from "@soustools/design-system";
import type {
  Recipe,
  VesselProfile,
  MasterIngredient,
  RecipeNutritionCache,
} from "@soustools/api-types";
import type {
  ScaledIngredient,
  RecipeCostData,
  VersionRow,
  InventoryItem,
  WastageReason,
  BakersFormulaSummary,
} from "../../types";
import type { ScaleMode } from "./RecipeViewer.container";

export interface RecipeViewerViewProps {
  // Original props
  recipe: Recipe;
  vessels: VesselProfile[];
  masterIngredients?: MasterIngredient[];
  scaledIngredients: ScaledIngredient[];
  bakersSummary: BakersFormulaSummary;
  finalMultiplier: number;
  costData: RecipeCostData | null;
  nutritionData: RecipeNutritionCache | null | undefined;
  versionHistory: VersionRow[];

  onIngredientWeightChange: (
    ingId: string,
    amount: number,
    unit: string,
  ) => void;
  onIngredientUnitChange?: (ingId: string, newUnit: string) => void;
  onBakersPercentageChange?: (ingId: string, percentage: number) => void;
  onRestoreVersion: (version: VersionRow) => void;
  onDownloadLabel: () => void;

  backHref?: string;
  loadingCost?: boolean;
  savingCost?: boolean;
  loadingNutrition?: boolean;
  loadingHistory?: boolean;

  // RecipeViewer states
  isWastageOpen: boolean;
  setIsWastageOpen: (open: boolean) => void;
  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isBakersMode: boolean;
  setIsBakersMode: (mode: boolean) => void;

  // Scaling states
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;
  targetYield: number;
  setTargetYield: (val: number) => void;
  targetWeight: string;
  handleWeightChange: (val: string) => void;
  targetBakersFlour: string;
  handleBakersFlourChange: (val: string) => void;
  selectedVesselId: string;
  setSelectedVesselId: (id: string) => void;

  // Cost states
  savedFlash: boolean;
  handleSaveCost: () => void;
  wastePct: number;
  portions: number;
  handleCostFactorsChange: (wastePct: number, portions: number) => void;

  // Wastage states
  wastageSearchQuery: string;
  setWastageSearchQuery: (q: string) => void;
  wastageItems: InventoryItem[];
  setWastageItems: (items: InventoryItem[]) => void;
  wastageSelectedItem: InventoryItem | null;
  setWastageSelectedItem: (item: InventoryItem | null) => void;
  wastageAmount: string;
  setWastageAmount: (val: string) => void;
  wastageUnit: string;
  setWastageUnit: (val: string) => void;
  wastageReason: WastageReason;
  setWastageReason: (r: WastageReason) => void;
  wastageSubmitting: boolean;
  handleWastageSubmit: (e: React.FormEvent) => void;
}

export function RecipeViewerView(props: RecipeViewerViewProps) {
  const {
    recipe,
    vessels,
    finalMultiplier,
    costData,
    nutritionData,
    bakersSummary,
  } = props;

  const inputClass = "w-full rounded-lg px-3 py-2 text-sm focus:outline-none";
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };
  const tileStyle: React.CSSProperties = {
    backgroundColor: "rgb(15 23 42 / 0.40)",
    border: "1px solid var(--color-border)",
  };

  return (
    <>
      <div
        className="glass-panel mx-auto grid max-w-6xl grid-cols-1 gap-6 rounded-2xl p-6 shadow-xl lg:grid-cols-3"
        style={{
          backgroundColor: "rgb(30 41 59 / 0.50)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <header
            className="flex flex-wrap items-center justify-between gap-4 pb-4"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <Link
                href={props.backHref || "/recipes"}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-white/10"
                style={{ color: "var(--color-muted-foreground)" }}
                aria-label="Back to recipes"
              >
                <ArrowLeft className="h-5 w-5 hover:text-white" />
              </Link>
              <div>
                <h2 className="font-archivo text-2xl font-extrabold tracking-wide">
                  {recipe.title}
                </h2>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    Yield: {recipe.yieldCount} {recipe.yieldUnit}
                  </span>
                  {bakersSummary.isBakersRecipe && (
                    <span
                      className="flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                      style={{
                        backgroundColor: "rgb(76 201 240 / 0.15)",
                        color: "var(--color-primary)",
                        border: "1px solid rgb(76 201 240 / 0.3)",
                      }}
                    >
                      <Percent className="h-3 w-3" /> Baker's % Formula
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 shadow-lg"
              >
                <Link href={`/recipes/${recipe.id}/edit`}>
                  <Edit className="h-4 w-4" /> Edit Recipe
                </Link>
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => props.setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 shadow-lg"
              >
                <History className="h-4 w-4" /> History
              </Button>

              <Button
                asChild
                size="sm"
                className="flex items-center gap-1.5 shadow-lg"
                style={{
                  backgroundColor: "#10b981",
                  color: "#fff",
                  borderColor: "transparent",
                }}
              >
                <Link href={`/recipes/${recipe.id}/kitchen`}>
                  <Play className="h-4 w-4 fill-current" /> Active Kitchen Mode
                </Link>
              </Button>
            </div>
          </header>

          {/* Baker's Percentage Banner if applicable */}
          {bakersSummary.isBakersRecipe && (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl p-3.5 text-xs font-semibold"
              style={{
                backgroundColor: "rgb(76 201 240 / 0.08)",
                border: "1px solid rgb(76 201 240 / 0.20)",
                color: "var(--color-foreground)",
              }}
            >
              <div className="flex items-center gap-2">
                <Percent
                  className="h-4 w-4"
                  style={{ color: "var(--color-primary)" }}
                />
                <span>Baker's Formula Stats:</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Base Flour:{" "}
                  <strong style={{ color: "var(--color-primary)" }}>
                    {bakersSummary.totalFlourWeightG}g (100%)
                  </strong>
                </span>
                <span>
                  Hydration:{" "}
                  <strong style={{ color: "#10b981" }}>
                    {bakersSummary.hydrationPercentage}%
                  </strong>
                </span>
                <span>
                  Formula Total:{" "}
                  <strong style={{ color: "var(--color-foreground)" }}>
                    {bakersSummary.totalFormulaPercentage}%
                  </strong>
                </span>
                <button
                  type="button"
                  onClick={() => props.setIsBakersMode(!props.isBakersMode)}
                  className="cursor-pointer rounded px-2 py-1 text-[11px] font-bold transition-colors"
                  style={{
                    backgroundColor: props.isBakersMode
                      ? "var(--color-primary)"
                      : "var(--color-secondary)",
                    color: props.isBakersMode
                      ? "var(--color-primary-foreground)"
                      : "var(--color-foreground)",
                  }}
                >
                  {props.isBakersMode ? "Viewing Baker's %" : "View Baker's %"}
                </button>
              </div>
            </div>
          )}

          {/* Ingredients Checklist */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-foreground)" }}
              >
                Ingredients Checklist
              </h3>
              <span
                className="text-[11px]"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                Edit amounts to anchor-scale the batch, or tweak formulas in
                real-time.
              </span>
            </div>

            <div
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: "rgb(30 41 59 / 0.50)",
                border: "1px solid var(--color-border)",
              }}
            >
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--color-card)",
                      borderBottom: "1px solid var(--color-border)",
                      color: "var(--color-muted-foreground)",
                    }}
                    className="font-semibold tracking-wider uppercase"
                  >
                    <th className="p-3">Ingredient</th>
                    <th className="w-36 p-3">Scaled Amount</th>
                    <th className="w-24 p-3">Unit</th>
                    <th className="p-3">Type / Baker's %</th>
                    <th className="w-24 p-3 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {props.scaledIngredients.map((ing) => (
                    <tr
                      key={ing.ingredientId}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <td className="p-3">
                        <div
                          className="font-semibold"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {ing.name}
                        </div>
                        {ing.estimateText && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
                            <Sparkles className="inline h-3 w-3" />
                            <span>{ing.estimateText}</span>
                            {ing.subBreakdown && (
                              <span
                                className="text-[10px] opacity-80"
                                style={{
                                  color: "var(--color-muted-foreground)",
                                }}
                              >
                                — {ing.subBreakdown}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            step="any"
                            value={Number(ing.scaledAmount.toFixed(2))}
                            onChange={(e) =>
                              props.onIngredientWeightChange(
                                ing.ingredientId,
                                parseFloat(e.target.value) || 0,
                                ing.scaledUnit,
                              )
                            }
                            className="w-20 rounded px-2 py-1 text-xs font-bold focus:outline-none"
                            style={{
                              backgroundColor: "var(--color-input)",
                              border: "1px solid var(--color-border)",
                              color: "var(--color-foreground)",
                            }}
                          />
                        </div>
                      </td>

                      <td className="p-3 font-medium">
                        <select
                          value={ing.scaledUnit}
                          onChange={(e) => {
                            const newUnit = e.target.value;
                            props.onIngredientUnitChange?.(
                              ing.ingredientId,
                              newUnit,
                            );
                          }}
                          className="rounded px-2 py-1 text-xs font-semibold focus:outline-none"
                          style={{
                            backgroundColor: "var(--color-input)",
                            border: "1px solid var(--color-border)",
                            color: "var(--color-foreground)",
                          }}
                        >
                          <optgroup label="Weight">
                            <option value="g">g</option>
                            <option value="kg">kg</option>
                            <option value="oz">oz</option>
                            <option value="lb">lb</option>
                          </optgroup>
                          <optgroup label="Volume">
                            <option value="ml">ml</option>
                            <option value="l">l</option>
                            <option value="tsp">tsp</option>
                            <option value="tbsp">tbsp</option>
                            <option value="fl oz">fl oz</option>
                            <option value="cup">cup</option>
                            <option value="pt">pt</option>
                            <option value="qt">qt</option>
                            <option value="gal">gal</option>
                          </optgroup>
                          <optgroup label="Count &amp; Culinary">
                            <option value="ea">ea</option>
                            <option value="count">count</option>
                            <option value="piece">piece</option>
                            <option value="clove">clove</option>
                            <option value="head">head</option>
                            <option value="stalk">stalk</option>
                            <option value="slice">slice</option>
                            <option value="sprig">sprig</option>
                            <option value="bunch">bunch</option>
                            <option value="can">can</option>
                            <option value="stick">stick</option>
                            <option value="pinch">pinch</option>
                            <option value="dash">dash</option>
                          </optgroup>
                          <optgroup label="Formulas">
                            <option value="%">%</option>
                          </optgroup>
                        </select>
                      </td>

                      <td className="p-3">
                        {ing.baseCalculationGroup ? (
                          <span
                            className="rounded px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                            style={{
                              backgroundColor: "rgb(245 158 11 / 0.15)",
                              border: "1px solid rgb(245 158 11 / 0.25)",
                              color: "#f59e0b",
                            }}
                          >
                            Base Flour (100%)
                          </span>
                        ) : ing.calculationType === "bakers_percentage" ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              step="any"
                              value={ing.percentageOfBase || 0}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                props.onBakersPercentageChange?.(
                                  ing.ingredientId,
                                  val,
                                );
                              }}
                              className="w-14 rounded px-1.5 py-0.5 text-xs font-bold focus:outline-none"
                              style={{
                                backgroundColor: "rgb(76 201 240 / 0.10)",
                                border: "1px solid rgb(76 201 240 / 0.30)",
                                color: "var(--color-primary)",
                              }}
                            />
                            <span className="text-[10px] font-bold text-sky-400 uppercase">
                              % Baker's
                            </span>
                          </div>
                        ) : (
                          <span
                            className="rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                            style={{
                              backgroundColor: "var(--color-secondary)",
                              color: "var(--color-muted-foreground)",
                            }}
                          >
                            Fixed
                          </span>
                        )}
                      </td>

                      <td
                        className="p-3 text-right text-[11px] font-medium"
                        style={{ color: "var(--color-muted-foreground)" }}
                      >
                        {(() => {
                          const masterIng = props.masterIngredients?.find(
                            (m) => m.id === ing.ingredientId,
                          );
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
          </div>

          {recipe.instructions && recipe.instructions.length > 0 && (
            <div
              className="space-y-4 pt-6"
              style={{ borderTop: "1px solid var(--color-border)" }}
            >
              <h3
                className="text-sm font-bold"
                style={{ color: "var(--color-foreground)" }}
              >
                Instructions
              </h3>
              <div className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 rounded-xl p-4 shadow-sm"
                    style={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: "rgb(76 201 240 / 0.15)",
                        color: "var(--color-primary)",
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {typeof step === "string"
                        ? step
                        : step.text ||
                          (typeof step === "object" &&
                          step &&
                          "instruction" in step
                            ? String(
                                (step as Record<string, unknown>).instruction,
                              )
                            : "")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Scaling Panel */}
          <div
            className="space-y-4 rounded-2xl p-4 shadow-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              className="flex items-center gap-1.5 text-sm font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              <Scale
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
              />
              Hybrid Scaling Tool
            </h3>
            <div
              className="flex gap-1 rounded-lg p-1 text-xs"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              {(["yield", "weight", "bakers", "vessel"] as const).map(
                (mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => props.setScaleMode(mode)}
                    className="flex-1 cursor-pointer rounded-md py-1.5 font-bold capitalize transition-all"
                    style={
                      props.scaleMode === mode
                        ? {
                            backgroundColor: "var(--color-primary)",
                            color: "var(--color-primary-foreground)",
                            boxShadow: "0 1px 4px rgb(0 0 0 / 0.2)",
                          }
                        : { color: "var(--color-muted-foreground)" }
                    }
                  >
                    {mode === "bakers" ? "Baker's %" : mode}
                  </button>
                ),
              )}
            </div>
            <div className="pt-2">
              {props.scaleMode === "yield" && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label
                      className="mb-1 block text-[10px] font-bold uppercase"
                      style={labelStyle}
                    >
                      Target Yield ({recipe.yieldUnit})
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      value={props.targetYield}
                      onChange={(e) =>
                        props.setTargetYield(parseFloat(e.target.value) || 1)
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div
                    className="pt-4 text-xs font-semibold"
                    style={labelStyle}
                  >
                    Multiplier: {finalMultiplier.toFixed(2)}x
                  </div>
                </div>
              )}

              {props.scaleMode === "weight" && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label
                      className="mb-1 block text-[10px] font-bold uppercase"
                      style={labelStyle}
                    >
                      Target Total Batch Weight (g)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={props.targetWeight}
                      onChange={(e) => props.handleWeightChange(e.target.value)}
                      placeholder="Enter target grams..."
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div
                    className="pt-4 text-xs font-semibold"
                    style={labelStyle}
                  >
                    Multiplier: {finalMultiplier.toFixed(2)}x
                  </div>
                </div>
              )}

              {props.scaleMode === "bakers" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label
                        className="mb-1 block text-[10px] font-bold uppercase"
                        style={labelStyle}
                      >
                        Target Base Flour (100% Group) (g)
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        value={props.targetBakersFlour}
                        onChange={(e) =>
                          props.handleBakersFlourChange(e.target.value)
                        }
                        placeholder="e.g. 1000g flour"
                        className={inputClass}
                        style={inputStyle}
                      />
                    </div>
                    <div
                      className="pt-4 text-xs font-semibold"
                      style={labelStyle}
                    >
                      Multiplier: {finalMultiplier.toFixed(2)}x
                    </div>
                  </div>
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Scales all percentages and formula ingredients relative to
                    the target flour base.
                  </p>
                </div>
              )}

              {props.scaleMode === "vessel" && (
                <div className="space-y-2">
                  <div>
                    <label
                      className="mb-1 block text-[10px] font-bold uppercase"
                      style={labelStyle}
                    >
                      Swap Vessel Profile
                    </label>
                    <select
                      value={props.selectedVesselId}
                      onChange={(e) =>
                        props.setSelectedVesselId(e.target.value)
                      }
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
                        className="mt-1 text-[10px] font-semibold"
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

          {/* Cost Panel */}
          {props.loadingCost ? (
            <div
              className="glass-panel animate-pulse space-y-3 rounded-2xl p-4 shadow-xl"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="h-4 w-1/3 rounded"
                style={{ backgroundColor: "var(--color-secondary)" }}
              />
              <div
                className="h-10 rounded"
                style={{ backgroundColor: "var(--color-secondary)" }}
              />
              <div
                className="h-20 rounded"
                style={{ backgroundColor: "var(--color-secondary)" }}
              />
            </div>
          ) : !costData || costData.ingredients.length === 0 ? (
            <div
              className="glass-panel rounded-2xl p-4 text-center text-sm shadow-xl"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "#f59e0b",
              }}
            >
              No cost data — add prices to ingredients via the Items ledger.
            </div>
          ) : (
            <div
              className="glass-panel space-y-4 rounded-2xl p-4 shadow-xl"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="h-5 w-5"
                    style={{ color: "#10b981" }}
                  />
                  <h3 className="text-sm font-semibold">Cost Breakdown</h3>
                </div>
                <button
                  onClick={props.handleSaveCost}
                  disabled={props.savingCost}
                  className="flex cursor-pointer items-center gap-1 rounded px-2 py-1 text-xs transition-colors"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {props.savedFlash ? (
                    "✓ Saved"
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      <span>Save Version</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="mb-1 block text-[10px] font-bold uppercase"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Yield / Waste (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={props.wastePct}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      props.handleCostFactorsChange(val, props.portions);
                    }}
                    className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-input)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                </div>
                <div>
                  <label
                    className="mb-1 block text-[10px] font-bold uppercase"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Portions
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={props.portions}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1;
                      props.handleCostFactorsChange(props.wastePct, val);
                    }}
                    className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                    style={{
                      backgroundColor: "var(--color-input)",
                      border: "1px solid var(--color-border)",
                      color: "var(--color-foreground)",
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center lg:grid-cols-3">
                {[
                  {
                    label: "Batch Cost",
                    value: `$${costData.totalCostUsd.toFixed(2)}`,
                    color: "var(--color-foreground)",
                  },
                  {
                    label: "Plate Cost",
                    value: `$${costData.costPerServingUsd.toFixed(2)}`,
                    color: "var(--color-foreground)",
                  },
                  {
                    label: "Sug. Sale Price",
                    value: costData.suggestedSalePrice
                      ? `$${costData.suggestedSalePrice.toFixed(2)}`
                      : "—",
                    color: "#4cc9f0",
                  },
                  {
                    label: "Linked POS",
                    value: costData.linkedSalePrice
                      ? `$${costData.linkedSalePrice.toFixed(2)}`
                      : "—",
                    color: "var(--color-foreground)",
                  },
                  {
                    label: "Margin",
                    value:
                      costData.marginPct !== undefined
                        ? `${costData.marginPct.toFixed(1)}%`
                        : "—",
                    color:
                      costData.marginPct === undefined
                        ? "var(--color-destructive)"
                        : costData.marginPct > 30
                          ? "#10b981"
                          : costData.marginPct >= 10
                            ? "#f59e0b"
                            : "var(--color-destructive)",
                  },
                ].map(({ label, value, color }) => (
                  <div key={label} className="rounded-lg p-2" style={tileStyle}>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {label}
                    </p>
                    <p className="text-sm font-semibold" style={{ color }}>
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table
                  className="w-full text-left text-xs"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <thead>
                    <tr
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                    >
                      <th className="py-1">Ingredient</th>
                      <th className="py-1 text-right">Weight (g)</th>
                      <th className="py-1 text-right">Cost ($)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costData.ingredients.map((ing) => (
                      <tr
                        key={ing.ingredientId}
                        style={{
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        <td className="py-1.5">{ing.name}</td>
                        <td className="py-1.5 text-right">
                          {ing.weightG.toFixed(0)}
                        </td>
                        <td className="py-1.5 text-right">
                          ${ing.costUsd.toFixed(3)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Nutrition Panel */}
          {props.loadingNutrition ? (
            <div
              className="animate-pulse text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Calculating nutrition profiles...
            </div>
          ) : !nutritionData ||
            !nutritionData.perServingNutrition ||
            Object.keys(nutritionData.perServingNutrition).length === 0 ? (
            <div
              className="flex items-center gap-2 rounded-xl p-4 text-xs"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "rgb(15 23 42 / 0.20)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <ShieldAlert
                className="h-4 w-4 flex-shrink-0"
                style={{ color: "#f59e0b" }}
              />
              No nutrition facts resolved for this recipe. Ensure ingredients
              are matched with USDA profiles.
            </div>
          ) : (
            <div
              className="glass-panel space-y-4 rounded-2xl p-4 shadow-xl"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="flex items-center justify-between pb-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h3
                  className="flex items-center gap-1.5 text-sm font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <Activity className="h-4 w-4" style={{ color: "#10b981" }} />
                  Nutrition &amp; Diets
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={props.onDownloadLabel}
                  className="flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" /> FDA Label
                </Button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  {
                    label: "Calories",
                    value: Math.round(
                      nutritionData.perServingNutrition.calories || 0,
                    ),
                    suffix: "",
                  },
                  {
                    label: "Fat",
                    value: Math.round(
                      nutritionData.perServingNutrition.total_fat_g || 0,
                    ),
                    suffix: "g",
                  },
                  {
                    label: "Carbs",
                    value: Math.round(
                      nutritionData.perServingNutrition.total_carbohydrate_g ||
                        0,
                    ),
                    suffix: "g",
                  },
                  {
                    label: "Protein",
                    value: Math.round(
                      nutritionData.perServingNutrition.protein_g || 0,
                    ),
                    suffix: "g",
                  },
                ].map((macro) => (
                  <div
                    key={macro.label}
                    className="rounded-lg p-2"
                    style={{
                      backgroundColor: "rgb(15 23 42 / 0.40)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="text-[10px] font-semibold tracking-wider uppercase"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      {macro.label}
                    </div>
                    <div
                      className="text-sm font-bold"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {macro.value}
                      {macro.suffix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Batch Summary */}
          <div
            className="space-y-4 rounded-2xl p-4 shadow-xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              className="flex items-center gap-1 text-sm font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              <Info
                className="h-4 w-4"
                style={{ color: "var(--color-primary)" }}
              />{" "}
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
                <span
                  className="font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {(recipe.yieldCount * finalMultiplier).toFixed(1)}{" "}
                  {recipe.yieldUnit}
                </span>
              </div>
              <div
                className="flex justify-between pb-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span>Total Batch Weight:</span>
                <span
                  className="font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  ~
                  {props.scaledIngredients
                    .reduce((acc, item) => acc + (item.weightInGrams || 0), 0)
                    .toFixed(0)}{" "}
                  g
                </span>
              </div>
              {bakersSummary.isBakersRecipe && (
                <div
                  className="flex justify-between pb-2"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <span>Hydration %:</span>
                  <span className="font-bold text-emerald-400">
                    {bakersSummary.hydrationPercentage}%
                  </span>
                </div>
              )}
              <div
                className="flex justify-between pb-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <span>Target Pan/Vessel:</span>
                <span
                  className="font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  {recipe.vessel?.name || "Standard Yield"}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => props.setIsWastageOpen(true)}
              className="flex w-full items-center justify-center gap-1.5 font-bold"
              style={{
                backgroundColor: "rgb(244 63 94 / 0.15)",
                color: "var(--color-destructive)",
                borderColor: "rgb(244 63 94 / 0.3)",
              }}
            >
              <Trash2 className="h-4 w-4" /> Log Food Waste
            </Button>
          </div>
        </div>
      </div>

      {/* Wastage Modal */}
      {props.isWastageOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgb(0 0 0 / 0.60)" }}
        >
          <div
            className="relative w-96 max-w-full space-y-4 rounded-2xl p-6 shadow-2xl"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <button
              onClick={() => props.setIsWastageOpen(false)}
              className="absolute top-4 right-4 cursor-pointer transition-colors hover:text-white"
              style={{ color: "var(--color-muted-foreground)" }}
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-semibold">Record Wastage</h3>
            <form onSubmit={props.handleWastageSubmit} className="space-y-4">
              <div className="relative space-y-1">
                <label className="text-xs font-medium" style={labelStyle}>
                  Search Item
                </label>
                <input
                  type="text"
                  value={props.wastageSearchQuery}
                  onChange={(e) => {
                    props.setWastageSearchQuery(e.target.value);
                    props.setWastageSelectedItem(null);
                  }}
                  placeholder="Type item name..."
                  className={inputClass}
                  style={inputStyle}
                  required
                />
                {props.wastageItems.length > 0 && (
                  <div
                    className="absolute top-full right-0 left-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg shadow-xl"
                    style={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    {props.wastageItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          props.setWastageSelectedItem(item);
                          props.setWastageSearchQuery(item.name);
                          props.setWastageItems([]);
                        }}
                        className="w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors"
                        style={{
                          color: "var(--color-foreground)",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Amount
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={props.wastageAmount}
                    onChange={(e) => props.setWastageAmount(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium" style={labelStyle}>
                    Unit
                  </label>
                  <select
                    value={props.wastageUnit}
                    onChange={(e) => props.setWastageUnit(e.target.value)}
                    className={inputClass}
                    style={inputStyle}
                  >
                    <option value="g">grams (g)</option>
                    <option value="oz">ounces (oz)</option>
                    <option value="lb">pounds (lb)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="ea">each (ea)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium" style={labelStyle}>
                  Reason
                </label>
                <select
                  value={props.wastageReason}
                  onChange={(e) =>
                    props.setWastageReason(e.target.value as WastageReason)
                  }
                  className={inputClass}
                  style={inputStyle}
                >
                  <option value="TRIM">Trim / Prep Waste</option>
                  <option value="SPOILAGE">Spoilage</option>
                  <option value="OVERPRODUCTION">Overproduction</option>
                  <option value="SPILL">Spill / Dropped</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={props.wastageSubmitting || !props.wastageSelectedItem}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                {props.wastageSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Record Waste Event"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Version History Backdrop Overlay & Drawer */}
      {props.isHistoryOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => props.setIsHistoryOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 transform p-4 shadow-2xl transition-transform duration-300 ${
          props.isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "rgb(15 23 42 / 0.98)",
          borderLeft: "1px solid var(--color-border)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          className="flex items-center justify-between pb-3"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div
            className="flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <History className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-semibold">Version History</h3>
          </div>
          <button
            onClick={() => props.setIsHistoryOpen(false)}
            className="cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Close version history"
          >
            <X className="h-5 w-5 hover:text-white" />
          </button>
        </div>

        <div className="mt-4 h-[calc(100vh-80px)] space-y-3 overflow-y-auto">
          {props.loadingHistory ? (
            <div
              className="animate-pulse py-8 text-center text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Loading history...
            </div>
          ) : props.versionHistory.length === 0 ? (
            <div
              className="py-8 text-center text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              No saved versions yet. Use "Save Version" to snapshot.
            </div>
          ) : (
            props.versionHistory.map((ver) => (
              <div
                key={ver.id}
                className="space-y-2 rounded-lg p-3"
                style={{
                  backgroundColor: "rgb(30 41 59 / 0.5)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400">
                    v{ver.versionNumber}
                  </span>
                  <span
                    className="text-[10px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {new Date(ver.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <h4
                    className="truncate text-xs font-semibold"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {ver.title}
                  </h4>
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    Yield: {ver.yieldCount} {ver.yieldUnit}
                  </p>
                </div>
                <button
                  onClick={() => {
                    props.onRestoreVersion(ver);
                    props.setIsHistoryOpen(false);
                  }}
                  className="w-full cursor-pointer rounded bg-indigo-500/5 py-1.5 text-center text-[10px] font-semibold text-indigo-400 transition hover:bg-indigo-500/10 hover:text-indigo-300"
                >
                  Restore Snapshot
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
