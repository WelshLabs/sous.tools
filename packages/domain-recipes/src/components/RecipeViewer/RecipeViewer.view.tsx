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
} from "../../types";
import type { ScaleMode } from "./RecipeViewer.container";

export interface RecipeViewerViewProps {
  // Original props
  recipe: Recipe;
  vessels: VesselProfile[];
  masterIngredients?: MasterIngredient[];
  scaledIngredients: ScaledIngredient[];
  finalMultiplier: number;
  costData: RecipeCostData | null;
  nutritionData: RecipeNutritionCache | null | undefined;
  versionHistory: VersionRow[];

  onIngredientWeightChange: (
    ingId: string,
    amount: number,
    unit: string,
  ) => void;
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

  // Scaling states
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;
  targetYield: number;
  setTargetYield: (val: number) => void;
  targetWeight: string;
  handleWeightChange: (val: string) => void;
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
  const { recipe, vessels, finalMultiplier, costData, nutritionData } = props;

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
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl shadow-xl max-w-6xl mx-auto glass-panel"
        style={{
          backgroundColor: "rgb(30 41 59 / 0.50)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <header
            className="flex justify-between items-center pb-4"
            style={{ borderBottom: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <Link
                href={props.backHref || "/recipes"}
                className="p-2 rounded-lg transition-colors hover:bg-white/5 cursor-pointer"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h2 className="text-2xl font-extrabold font-brand tracking-wide">
                {recipe.title}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => props.setIsHistoryOpen(true)}
                className="flex items-center gap-1.5 shadow-lg"
              >
                <History className="w-4 h-4" /> History
              </Button>
              <Link href={`/recipes/${recipe.id}/kitchen`}>
                <Button
                  size="sm"
                  className="flex items-center gap-1.5 shadow-lg"
                  style={{
                    backgroundColor: "#10b981",
                    color: "#fff",
                    borderColor: "transparent",
                  }}
                >
                  <Play className="w-4 h-4 fill-current" /> Active Kitchen Mode
                </Button>
              </Link>
            </div>
          </header>

          <div className="space-y-4">
            <h3
              className="text-sm font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              Ingredients Checklist
            </h3>
            <div
              className="overflow-hidden rounded-xl"
              style={{
                backgroundColor: "rgb(30 41 59 / 0.50)",
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
                  {props.scaledIngredients.map((ing) => (
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
                            props.onIngredientWeightChange(
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
                      <td
                        className="p-3 text-right font-medium text-[11px]"
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
                    className="flex gap-4 p-4 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
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
                      {step.text}
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
              <Scale
                className="w-4 h-4"
                style={{ color: "var(--color-primary)" }}
              />
              Hybrid Scaling Tool
            </h3>
            <div
              className="flex gap-2 p-1 rounded-lg text-xs"
              style={{ backgroundColor: "var(--color-secondary)" }}
            >
              {(["yield", "weight", "vessel"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => props.setScaleMode(mode)}
                  className="flex-1 py-1.5 rounded-md capitalize font-bold transition-all cursor-pointer"
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
                  {mode}
                </button>
              ))}
            </div>
            <div className="pt-2">
              {props.scaleMode === "yield" && (
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
                      value={props.targetYield}
                      onChange={(e) =>
                        props.setTargetYield(parseFloat(e.target.value) || 1)
                      }
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>
                  <div
                    className="text-xs pt-4 font-semibold"
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
                      className="block text-[10px] font-bold uppercase mb-1"
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
                    className="text-xs pt-4 font-semibold"
                    style={labelStyle}
                  >
                    Multiplier: {finalMultiplier.toFixed(2)}x
                  </div>
                </div>
              )}
              {props.scaleMode === "vessel" && (
                <div className="space-y-2">
                  <div>
                    <label
                      className="block text-[10px] font-bold uppercase mb-1"
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

          {/* Cost Panel */}
          {props.loadingCost ? (
            <div
              className="rounded-2xl p-4 shadow-xl glass-panel animate-pulse space-y-3"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="h-4 rounded w-1/3"
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
              className="rounded-2xl p-4 shadow-xl glass-panel text-sm text-center"
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
              className="rounded-2xl p-4 shadow-xl glass-panel space-y-4"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-foreground)",
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign
                    className="w-5 h-5"
                    style={{ color: "#10b981" }}
                  />
                  <h3 className="font-semibold text-sm">Cost Breakdown</h3>
                </div>
                <button
                  onClick={props.handleSaveCost}
                  disabled={props.savingCost}
                  className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors cursor-pointer"
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
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Version</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-[10px] font-bold uppercase mb-1"
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
                    className="block text-[10px] font-bold uppercase mb-1"
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

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-center">
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
                  <div key={label} className="p-2 rounded-lg" style={tileStyle}>
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
                  className="w-full text-xs text-left"
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
              className="text-xs animate-pulse"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Calculating nutrition profiles...
            </div>
          ) : !nutritionData ||
            !nutritionData.perServingNutrition ||
            Object.keys(nutritionData.perServingNutrition).length === 0 ? (
            <div
              className="p-4 rounded-xl text-xs flex items-center gap-2"
              style={{
                border: "1px solid var(--color-border)",
                backgroundColor: "rgb(15 23 42 / 0.20)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <ShieldAlert
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "#f59e0b" }}
              />
              No nutrition facts resolved for this recipe. Ensure ingredients
              are matched with USDA profiles.
            </div>
          ) : (
            <div
              className="p-4 rounded-2xl space-y-4 shadow-xl glass-panel"
              style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <div
                className="flex justify-between items-center pb-2"
                style={{ borderBottom: "1px solid var(--color-border)" }}
              >
                <h3
                  className="text-sm font-bold flex items-center gap-1.5"
                  style={{ color: "var(--color-foreground)" }}
                >
                  <Activity className="w-4 h-4" style={{ color: "#10b981" }} />
                  Nutrition &amp; Diets
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={props.onDownloadLabel}
                  className="flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> FDA Label
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
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: "rgb(15 23 42 / 0.40)",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      className="text-[10px] uppercase tracking-wider font-semibold"
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

              {/* Dietary Badges inline */}
              {nutritionData.dietaryFlags && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {Object.entries(nutritionData.dietaryFlags)
                    .filter(([, active]) => active)
                    .map(([key]) => {
                      const labels: Record<
                        string,
                        {
                          label: string;
                          bg: string;
                          text: string;
                          border: string;
                        }
                      > = {
                        vegan: {
                          label: "Vegan",
                          bg: "rgb(16 185 129 / 0.12)",
                          text: "#10b981",
                          border: "rgb(16 185 129 / 0.25)",
                        },
                        vegetarian: {
                          label: "Vegetarian",
                          bg: "rgb(34 197 94 / 0.12)",
                          text: "#22c55e",
                          border: "rgb(34 197 94 / 0.25)",
                        },
                        pescetarian: {
                          label: "Pescetarian",
                          bg: "rgb(20 184 166 / 0.12)",
                          text: "#14b8a6",
                          border: "rgb(20 184 166 / 0.25)",
                        },
                        keto: {
                          label: "Keto",
                          bg: "rgb(99 102 241 / 0.12)",
                          text: "#6366f1",
                          border: "rgb(99 102 241 / 0.25)",
                        },
                        gluten_free: {
                          label: "Gluten Free",
                          bg: "rgb(245 158 11 / 0.12)",
                          text: "#f59e0b",
                          border: "rgb(245 158 11 / 0.25)",
                        },
                        dairy_free: {
                          label: "Dairy Free",
                          bg: "rgb(14 165 233 / 0.12)",
                          text: "#0ea5e9",
                          border: "rgb(14 165 233 / 0.25)",
                        },
                        egg_free: {
                          label: "Egg Free",
                          bg: "rgb(234 179 8 / 0.12)",
                          text: "#eab308",
                          border: "rgb(234 179 8 / 0.25)",
                        },
                        nut_free: {
                          label: "Nut Free",
                          bg: "rgb(244 63 94 / 0.12)",
                          text: "var(--color-destructive)",
                          border: "rgb(244 63 94 / 0.25)",
                        },
                        low_sodium: {
                          label: "Low Sodium",
                          bg: "rgb(37 99 235 / 0.12)",
                          text: "#2563eb",
                          border: "rgb(37 99 235 / 0.25)",
                        },
                        high_protein: {
                          label: "High Protein",
                          bg: "rgb(247 37 133 / 0.12)",
                          text: "var(--color-accent)",
                          border: "rgb(247 37 133 / 0.25)",
                        },
                      };
                      const badge = labels[key];
                      if (!badge) return null;
                      return (
                        <span
                          key={key}
                          className="px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
                          style={{
                            backgroundColor: badge.bg,
                            color: badge.text,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Batch Summary */}
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
              <Info
                className="w-4 h-4"
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
                  {props.scaledIngredients
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
        </div>
      </div>

      {/* Wastage Modal */}
      {props.isWastageOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{ backgroundColor: "rgb(0 0 0 / 0.60)" }}
        >
          <div
            className="relative w-96 max-w-full rounded-2xl p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              color: "var(--color-foreground)",
            }}
          >
            <button
              onClick={() => props.setIsWastageOpen(false)}
              className="absolute top-4 right-4 transition-colors cursor-pointer"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">Record Wastage</h3>
            <form onSubmit={props.handleWastageSubmit} className="space-y-4">
              <div className="space-y-1 relative">
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
                    className="absolute top-full left-0 right-0 rounded-lg mt-1 z-50 max-h-48 overflow-y-auto shadow-xl"
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
                        className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer"
                        style={{
                          color: "var(--color-foreground)",
                          borderBottom: "1px solid var(--color-border)",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "var(--color-secondary)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
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
                className="w-full text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-primary-foreground)",
                }}
              >
                {props.wastageSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Record Waste Event"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Version History Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-80 shadow-2xl z-50 p-4 transition-transform duration-300 transform ${
          props.isHistoryOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          backgroundColor: "rgb(15 23 42 / 0.95)",
          borderLeft: "1px solid var(--color-border)",
          backdropFilter: "blur(12px)",
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
            <History className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-sm">Version History</h3>
          </div>
          <button
            onClick={() => props.setIsHistoryOpen(false)}
            className="transition-colors cursor-pointer"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3 overflow-y-auto h-[calc(100vh-80px)]">
          {props.loadingHistory ? (
            <div
              className="text-center text-xs py-8 animate-pulse"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Loading history...
            </div>
          ) : props.versionHistory.length === 0 ? (
            <div
              className="text-center text-xs py-8"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              No saved versions yet. Use "Save Version" to snapshot.
            </div>
          ) : (
            props.versionHistory.map((ver) => (
              <div
                key={ver.id}
                className="rounded-lg p-3 space-y-2"
                style={{
                  backgroundColor: "rgb(30 41 59 / 0.5)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20">
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
                    className="text-xs font-semibold truncate"
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
                  className="w-full text-center text-[10px] text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 py-1.5 rounded transition font-semibold cursor-pointer"
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
