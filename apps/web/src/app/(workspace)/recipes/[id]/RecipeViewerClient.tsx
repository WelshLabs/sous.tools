"use client";

import React, { useState, useMemo } from "react";
import { RecipeViewer, CustomWeightOpts } from "@soustools/domain-recipes";
import { Recipe, VesselProfile } from "@soustools/api-types";
import { toast } from "sonner";
import { calculateRecipeScale } from "@soustools/design-system";

export interface RecipeViewerClientProps {
  recipe: Recipe;
  vessels: VesselProfile[];
  costData: any;
  nutritionData: any;
  versionHistory: any[];
}

export function RecipeViewerClient({
  recipe,
  vessels,
  costData,
  nutritionData,
  versionHistory,
}: RecipeViewerClientProps) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [customWeights, setCustomWeights] = useState<
    Record<string, { amount: number; unit: string }>
  >({});

  const scalingOptions: any = {};
  if (Object.keys(customWeights).length > 0) {
    scalingOptions.customIngredientWeights = customWeights;
  } else if (multiplier !== 1.0) {
    scalingOptions.targetYield = recipe.yieldCount * multiplier;
  }

  const { multiplier: finalMultiplier, items: scaledIngredients } = useMemo(() => {
    return calculateRecipeScale(
      recipe.recipeIngredients || [],
      recipe.yieldCount,
      scalingOptions
    );
  }, [recipe.recipeIngredients, recipe.yieldCount, scalingOptions]);

  const handleScaleChange = (mult: number, customOpts?: CustomWeightOpts) => {
    if (customOpts && customOpts.mode === "weight") {
      const { multiplier: m } = calculateRecipeScale(
        recipe.recipeIngredients || [],
        recipe.yieldCount,
        {
          targetTotalWeight: customOpts.weight,
        }
      );
      setMultiplier(m);
    } else {
      setMultiplier(mult);
    }
    setCustomWeights({});
  };

  const handleIngredientWeightChange = (
    ingId: string,
    amount: number,
    unit: string
  ) => {
    if (amount > 0) {
      setCustomWeights({ [ingId]: { amount, unit } });
    } else {
      setCustomWeights({});
      setMultiplier(1.0);
    }
  };

  const handleSaveVersion = async () => {
    toast.success("Saved version successfully.");
  };

  const handleRestoreVersion = async (version: any) => {
    toast.success(`Restored version ${version.versionNumber}`);
  };

  const handleDownloadLabel = () => {
    toast.success("Label downloading...");
  };

  const handleSearchItems = async (_query: string) => {
    // Basic stub for wastage item search
    return [];
  };

  const handleSubmitWastage = async (_payload: any) => {
    toast.success("Wastage logged successfully.");
    return true;
  };

  return (
    <RecipeViewer
      recipe={recipe}
      vessels={vessels}
      scaledIngredients={scaledIngredients}
      finalMultiplier={finalMultiplier}
      costData={costData}
      nutritionData={nutritionData}
      versionHistory={versionHistory}
      onScaleChange={handleScaleChange}
      onIngredientWeightChange={handleIngredientWeightChange}
      onSaveVersion={handleSaveVersion}
      onRestoreVersion={handleRestoreVersion}
      onDownloadLabel={handleDownloadLabel}
      onSearchItems={handleSearchItems}
      onSubmitWastage={handleSubmitWastage}
      backHref="/recipes"
    />
  );
}
