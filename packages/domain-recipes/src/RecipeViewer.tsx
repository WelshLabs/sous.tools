/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { type Recipe, type VesselProfile, type MasterIngredient, type RecipeInstruction } from "@soustools/api-types";
import { RecipeViewerHeader } from "./RecipeViewerHeader";
import { RecipeScalingPanel, type CustomWeightOpts } from "./RecipeScalingPanel";
import { RecipeNutritionPanel } from "./RecipeNutritionPanel";
import { RecipeIngredientsTable } from "./RecipeIngredientsTable";
import { RecipeCostPanel } from "./RecipeCostPanel";
import { WastageEntryModal } from "./WastageEntryModal";
import { VersionHistoryDrawer } from "./VersionHistoryDrawer";
import { RecipeBatchSummary } from "./RecipeBatchSummary";
import { type ScaledIngredient, type RecipeCostData, type VersionRow } from "./types";

/**
 * Props for the RecipeViewer component.
 */
export interface RecipeViewerProps {
  /** The loaded recipe to view. */
  recipe: Recipe;
  /** All available vessel profiles. */
  vessels: VesselProfile[];
  /** Master ingredients for live pricing */
  masterIngredients?: MasterIngredient[];
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
  onCostFactorsChange?: (wastePct: number, portions: number) => void;

  /** External Actions */
  onSaveVersion: () => Promise<void>;
  onRestoreVersion: (version: VersionRow) => void;
  onDownloadLabel: () => void;
  
  /** Wastage actions */
  onSearchItems: (query: string) => Promise<any[]>;

  onSubmitWastage: (payload: unknown) => Promise<boolean>;

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
  masterIngredients,
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
  onCostFactorsChange,
  backHref = "/recipes",
}: RecipeViewerProps) {
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
          <RecipeViewerHeader
            recipeTitle={recipe.title}
            recipeId={recipe.id}
            backHref={backHref}
            onOpenHistory={() => setIsHistoryOpen(true)}
          />

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
              masterIngredients={masterIngredients}
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
                    typeof step === "string" ? step : (step as unknown as RecipeInstruction).text;
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
            onCostFactorsChange={onCostFactorsChange}
          />
          <RecipeNutritionPanel
            nutrition={nutritionData}
            onDownloadLabel={onDownloadLabel}
          />

          <RecipeBatchSummary
            recipe={recipe}
            finalMultiplier={finalMultiplier}
            scaledIngredients={scaledIngredients}
            onOpenWastage={() => setIsWastageOpen(true)}
          />
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
    </>
  );
}
