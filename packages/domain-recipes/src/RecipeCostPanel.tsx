"use client";

import React from "react";
import { useState } from "react";
import { DollarSign, Save } from "lucide-react";
import { type RecipeCostData } from "./types";
import { RecipeCostTable } from "./RecipeCostTable";

/**
 * Props for the RecipeCostPanel component.
 */
export interface RecipeCostPanelProps {
  /**
   * Pre-fetched recipe cost data. Pass `null` while loading or when unavailable.
   */
  costData: RecipeCostData | null;
  /** Whether the cost data is still loading. */
  loading?: boolean;
  /** Whether a save-version action is in progress. */
  saving?: boolean;
  /**
   * Called when the user clicks "Save Version".
   * The app layer should POST to /api/recipes/:id/versions.
   */
  onSaveVersion: () => void | Promise<void>;
  /** Called when waste or portions change, so the app layer can refetch */
  onCostFactorsChange?: (wastePct: number, portions: number) => void;
}

/**
 * RecipeCostPanel — displays total cost, per-serving cost, sale price, and
 * margin percentage for a recipe batch.
 *
 * Uses the `glass-panel` surface from `@soustools/design-system`. Margin
 * color uses semantic tokens: green > 30%, amber 10–30%, destructive < 10%.
 *
 * **Data boundary**: All fetching and version-save API calls belong in the
 * `apps/app` controller layer. Pass `costData`, `loading`, `saving`, and
 * `onSaveVersion`.
 *
 * @tenant-docs-export
 * # RecipeCostPanel
 * ```tsx
 * import { RecipeCostPanel } from "@soustools/domain-recipes";
 *
 * <RecipeCostPanel
 *   costData={costData}
 *   loading={isLoading}
 *   saving={isSaving}
 *   onSaveVersion={handleSaveVersion}
 * />
 * ```
 */
export function RecipeCostPanel({
  costData,
  loading = false,
  saving = false,
  onSaveVersion,
  onCostFactorsChange,
}: RecipeCostPanelProps) {
  const [savedFlash, setSavedFlash] = useState(false);
  const [wastePct, setWastePct] = useState(0);
  const [portions, setPortions] = useState(1);

  const handleSave = async () => {
    await onSaveVersion();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const tileStyle: React.CSSProperties = {
    backgroundColor: "rgb(15 23 42 / 0.40)",
    border: "1px solid var(--color-border)",
  };

  if (loading) {
    return (
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
    );
  }

  if (!costData || costData.ingredients.length === 0) {
    return (
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
    );
  }

  const { totalCostUsd, costPerServingUsd, linkedSalePrice, marginPct, suggestedSalePrice } =
    costData;

  const marginColor: string =
    marginPct === undefined
      ? "var(--color-destructive)"
      : marginPct > 30
        ? "#10b981"
        : marginPct >= 10
          ? "#f59e0b"
          : "var(--color-destructive)";

  return (
    <div
      className="rounded-2xl p-4 shadow-xl glass-panel space-y-4"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        color: "var(--color-foreground)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" style={{ color: "#10b981" }} />
          <h3 className="font-semibold text-sm">Cost Breakdown</h3>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors cursor-pointer"
          style={{
            backgroundColor: "var(--color-secondary)",
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
        >
          {savedFlash ? (
            "✓ Saved"
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Version</span>
            </>
          )}
        </button>
      </div>

      {/* Cost Factors Inputs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted-foreground)" }}>
            Yield / Waste (%)
          </label>
          <input
            type="number"
            min="0"
            max="99"
            value={wastePct}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 0;
              setWastePct(val);
              onCostFactorsChange?.(val, portions);
            }}
            className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ backgroundColor: "var(--color-input)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold uppercase mb-1" style={{ color: "var(--color-muted-foreground)" }}>
            Portions
          </label>
          <input
            type="number"
            min="1"
            value={portions}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 1;
              setPortions(val);
              onCostFactorsChange?.(wastePct, val);
            }}
            className="w-full rounded-lg px-2 py-1.5 text-xs focus:outline-none"
            style={{ backgroundColor: "var(--color-input)", border: "1px solid var(--color-border)", color: "var(--color-foreground)" }}
          />
        </div>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-center">
        {[
          { label: "Batch Cost",  value: `$${totalCostUsd.toFixed(2)}`,      color: "var(--color-foreground)" },
          { label: "Plate Cost", value: `$${costPerServingUsd.toFixed(2)}`, color: "var(--color-foreground)" },
          { label: "Sug. Sale Price",  value: suggestedSalePrice ? `$${suggestedSalePrice.toFixed(2)}` : "—", color: "#4cc9f0" },
          { label: "Linked POS",  value: linkedSalePrice ? `$${linkedSalePrice.toFixed(2)}` : "—", color: "var(--color-foreground)" },
          { label: "Margin",      value: marginPct !== undefined ? `${marginPct.toFixed(1)}%` : "—", color: marginColor },
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

      {/* Ingredient cost table */}
      <RecipeCostTable ingredients={costData.ingredients} />
      </div>
    </div>
  );
}
