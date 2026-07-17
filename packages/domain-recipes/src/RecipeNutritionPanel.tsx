"use client";

import { RecipeDietaryBadges } from "./RecipeDietaryBadges";
import { type RecipeNutritionCache } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { Download, Activity, ShieldAlert } from "lucide-react";

/**
 * Props for the RecipeNutritionPanel component.
 */
export interface RecipeNutritionPanelProps {
  /**
   * Pre-fetched nutrition data. Pass `null` while loading,
   * `undefined` / empty when no data is available.
   */
  nutrition: RecipeNutritionCache | null | undefined;
  /** Whether the nutrition data is still loading. */
  loading?: boolean;
  /**
   * Called when the user clicks "FDA Label". The app layer should
   * fetch /api/recipes/:id/nutrition-label?format=svg and trigger a download.
   */
  onDownloadLabel: () => void | Promise<void>;
}

/**
 * RecipeNutritionPanel — displays per-serving macro breakdown and dietary
 * badge flags from a pre-fetched `RecipeNutritionCache` object.
 *
 * Uses `glass-panel` from `@soustools/design-system` for the Neon-Glass surface.
 * Macro tiles use `--color-card` @ 40% as a nested inset.
 *
 * **Data boundary**: All data-fetching (fetch + SVG download) lives in the
 * `apps/app` controller layer. Pass `nutrition`, `loading`, and `onDownloadLabel`.
 *
 * @tenant-docs-export
 * # RecipeNutritionPanel
 * ```tsx
 * import { RecipeNutritionPanel } from "@soustools/domain-recipes";
 *
 * <RecipeNutritionPanel
 *   nutrition={nutritionData}
 *   loading={isLoading}
 *   onDownloadLabel={handleDownload}
 * />
 * ```
 */
export function RecipeNutritionPanel({
  nutrition,
  loading = false,
  onDownloadLabel,
}: RecipeNutritionPanelProps) {
  if (loading) {
    return (
      <div
        className="text-xs animate-pulse"
        style={{ color: "var(--color-muted-foreground)" }}
      >
        Calculating nutrition profiles...
      </div>
    );
  }

  if (
    !nutrition ||
    !nutrition.perServingNutrition ||
    Object.keys(nutrition.perServingNutrition).length === 0
  ) {
    return (
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
        No nutrition facts resolved for this recipe. Ensure ingredients are
        matched with USDA profiles.
      </div>
    );
  }

  const macros = nutrition.perServingNutrition;


  return (
    <div
      className="p-4 rounded-2xl space-y-4 shadow-xl glass-panel"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      {/* Header */}
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
          onClick={onDownloadLabel}
          className="flex items-center gap-1"
        >
          <Download className="w-3.5 h-3.5" /> FDA Label
        </Button>
      </div>

      {/* Macro grid */}
      <div className="grid grid-cols-4 gap-2 text-center">
        {(
          [
            { label: "Calories", value: Math.round(macros.calories || 0), suffix: "" },
            { label: "Fat",      value: Math.round(macros.total_fat_g || 0),          suffix: "g" },
            { label: "Carbs",    value: Math.round(macros.total_carbohydrate_g || 0), suffix: "g" },
            { label: "Protein",  value: Math.round(macros.protein_g || 0),            suffix: "g" },
          ] as const
        ).map((macro) => (
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
              {macro.value}{macro.suffix}
            </div>
          </div>
        ))}
      </div>

      <RecipeDietaryBadges dietaryFlags={nutrition.dietaryFlags} />
    </div>
  );
}
