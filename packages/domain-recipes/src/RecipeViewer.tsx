"use client";

import React, { useState } from "react";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { ArrowLeft, Play, Info, History, Trash2 } from "lucide-react";
import Link from "next/link";
import { RecipeScalingPanel, CustomWeightOpts } from "./RecipeScalingPanel";
import { RecipeNutritionPanel } from "./RecipeNutritionPanel";
import { RecipeIngredientsTable } from "./RecipeIngredientsTable";
import { RecipeCostPanel } from "./RecipeCostPanel";
import { WastageEntryModal } from "./WastageEntryModal";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";
import { ScaledIngredient, RecipeCostData, VersionRow } from "./types";

/**
 * Props for the RecipeViewer component.
 */
export interface RecipeViewerProps {
  /** The loaded recipe to view. */
  recipe: Recipe;
  /** All available vessel profiles. */
  vessels: VesselProfile[];
  /** Scaled ingredients array emitted by the scaling math utility. */
  scaledIngredients: ScaledIngredient[];
  /** The final calculated multiplier. */
  finalMultiplier: number;
  /** Cost data pre-fetched. */
  costData: RecipeCostData | null;
  /** Nutrition data pre-fetched. */
  nutritionData: any; // Mapped to the RecipeNutritionPanel
  /** Version history pre-fetched. */
  versionHistory: VersionRow[];

  /** Callbacks for scaling */
  onScaleChange: (multiplier: number, customOpts?: CustomWeightOpts) => void;
  onIngredientWeightChange: (ingId: string, amount: number, unit: string) => void;

  /** External Actions */
  onSaveVersion: () => Promise<void>;
  onRestoreVersion: (version: VersionRow) => void;
  onDownloadLabel: () => void;
  
  /** Wastage actions */
  onSearchItems: (query: string) => Promise<any[]>;
  onSubmitWastage: (payload: any) => Promise<boolean>;

  /** Back navigation */
  backHref?: string;
}

/**
 * RecipeViewer — the central view for scaling, costing, and running a recipe.
 *
 * Uses the Neon-Glass `--color-card` layout. Acts as the orchestration layout
 * for the sub-panels (Cost, Nutrition, Scaling, Ingredients).
 *
 * **Presentation boundary**: No data fetching. Receives all pre-calculated
 * data and dependencies as props.
 *
 * @tenant-docs-export
 * # RecipeViewer
 * ```tsx
 * import { RecipeViewer } from "@soustools/domain-recipes";
 *
 * <RecipeViewer
 *   recipe={recipe}
 *   scaledIngredients={scaledIngredients}
 *   finalMultiplier={multiplier}
 *   vessels={vessels}
 *   // ...
 * />
 * ```
 */
export function RecipeViewer({
  recipe,
  vessels,
  scaledIngredients,
  finalMultiplier,
  costData,
  nutritionData,
  versionHistory,
  onScaleChange,
  onIngredientWeightChange,
  onSaveVersion,
  onRestoreVersion,
  onDownloadLabel,
  onSearchItems,
  onSubmitWastage,
  backHref = "/recipes",
}: RecipeViewerProps) {
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 rounded-2xl shadow-xl max-w-6xl mx-auto glass-panel"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.50)",
        border: "1px solid var(--color-border)",
        color: "var(--color-foreground)",
      }}
    >
      <div className="lg:col-span-2 space-y-6">
        <header
          className="flex justify-between items-center pb-4"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <Link
              href={backHref}
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
              onClick={() => setIsHistoryOpen(true)}
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
          <RecipeIngredientsTable
            ingredients={scaledIngredients}
            onWeightChange={onIngredientWeightChange}
          />
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
              {recipe.instructions.map((step, idx) => {
                const stepText =
                  typeof step === "string" ? step : (step as any).text;
                return (
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
                      {stepText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <RecipeScalingPanel
          recipe={recipe}
          vessels={vessels}
          onScaleChange={onScaleChange}
          currentMultiplier={finalMultiplier}
        />
        <RecipeCostPanel
          costData={costData}
          onSaveVersion={onSaveVersion}
        />
        <RecipeNutritionPanel
          nutrition={nutritionData}
          onDownloadLabel={onDownloadLabel}
        />

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
            onClick={() => setIsWastageOpen(true)}
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

      <WastageEntryModal
        isOpen={isWastageOpen}
        onClose={() => setIsWastageOpen(false)}
        onSearchItems={onSearchItems}
        onSubmitWastage={onSubmitWastage}
      />
      <VersionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        versions={versionHistory}
        onRestore={onRestoreVersion}
      />
    </div>
  );
}
