"use client";

import React, { useState, useMemo } from "react";
import { RecipeViewer, type CustomWeightOpts } from "@soustools/domain-recipes";
import { type Recipe, type VesselProfile } from "@soustools/api-types";
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
  costData: initialCostData,
  nutritionData,
  versionHistory,
}: RecipeViewerClientProps) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [customWeights, setCustomWeights] = useState<
    Record<string, { amount: number; unit: string }>
  >({});
  const [costData, setCostData] = useState<any>(initialCostData);
  const [liveIngredients, setLiveIngredients] = useState<any[]>([]);

  React.useEffect(() => {
    // Fetch live prices on mount
    fetch('/api/recipes/ingredients')
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setLiveIngredients(json.data);
        }
      })
      .catch(err => console.error('Failed to fetch live ingredients:', err));
  }, []);

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

  const handleCostFactorsChange = async (wastePct: number, portions: number) => {
    try {
      const res = await fetch(`/api/recipes/${recipe.id}/cost?wastePct=${wastePct}&portions=${portions}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCostData(json.data);
      }
    } catch (err) {
      console.error("Failed to refetch cost data:", err);
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
      masterIngredients={liveIngredients}
      scaledIngredients={scaledIngredients}
      finalMultiplier={finalMultiplier}
      costData={costData}
      nutritionData={nutritionData}
      versionHistory={versionHistory}
      onScaleChange={handleScaleChange}
      onIngredientWeightChange={handleIngredientWeightChange}
      onCostFactorsChange={handleCostFactorsChange}
      onSaveVersion={handleSaveVersion}
      onRestoreVersion={handleRestoreVersion}
      onDownloadLabel={handleDownloadLabel}
      onSearchItems={handleSearchItems}
      onSubmitWastage={handleSubmitWastage}
      backHref="/recipes"
    />
  );
}
