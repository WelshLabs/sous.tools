/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
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
import { RecipeViewerView } from "./RecipeViewer.view";

export type ScaleMode = "yield" | "weight" | "vessel";

export interface CustomWeightOpts {
  mode: "weight";
  weight: number;
}

export interface RecipeViewerProps {
  recipe: Recipe;
  vessels: VesselProfile[];
  masterIngredients?: MasterIngredient[];
  scaledIngredients: ScaledIngredient[];
  finalMultiplier: number;
  costData: RecipeCostData | null;
  nutritionData: RecipeNutritionCache | null | undefined;
  versionHistory: VersionRow[];

  onScaleChange: (multiplier: number, customOpts?: CustomWeightOpts) => void;
  onIngredientWeightChange: (
    ingId: string,
    amount: number,
    unit: string,
  ) => void;
  onCostFactorsChange?: (wastePct: number, portions: number) => void;

  onSaveVersion: () => Promise<void>;
  onRestoreVersion: (version: VersionRow) => void;
  onDownloadLabel: () => void;

  onSearchItems: (query: string) => Promise<InventoryItem[]>;
  onSubmitWastage: (payload: {
    itemId: string;
    amountG: number;
    reason: WastageReason;
  }) => Promise<boolean>;

  backHref?: string;
  loadingCost?: boolean;
  savingCost?: boolean;
  loadingNutrition?: boolean;
  loadingHistory?: boolean;
}

const UNIT_TO_G: Record<string, number> = {
  g: 1,
  oz: 28.35,
  lb: 453.59,
  kg: 1000,
};

export function RecipeViewer(props: RecipeViewerProps) {
  // RecipeViewer states
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // RecipeScalingPanel states
  const [scaleMode, setScaleMode] = useState<ScaleMode>("yield");
  const [targetYield, setTargetYield] = useState(props.recipe.yieldCount);
  const [targetWeight, setTargetWeight] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    props.recipe.vesselId || "",
  );

  useEffect(() => {
    if (scaleMode === "yield") {
      props.onScaleChange(targetYield / props.recipe.yieldCount);
    }
  }, [scaleMode, targetYield, props.recipe.yieldCount, props.onScaleChange]);

  useEffect(() => {
    if (scaleMode === "vessel" && selectedVesselId) {
      const currentVessel = props.vessels.find(
        (v) => v.id === props.recipe.vesselId,
      );
      const targetVessel = props.vessels.find((v) => v.id === selectedVesselId);
      if (currentVessel && targetVessel) {
        props.onScaleChange(targetVessel.volumeMl / currentVessel.volumeMl);
      }
    }
  }, [
    scaleMode,
    selectedVesselId,
    props.vessels,
    props.recipe.vesselId,
    props.onScaleChange,
  ]);

  const handleWeightChange = (val: string) => {
    setTargetWeight(val);
    const weightNum = parseFloat(val) || 0;
    if (weightNum > 0) {
      props.onScaleChange(0, { mode: "weight", weight: weightNum });
    } else {
      props.onScaleChange(1.0);
    }
  };

  // RecipeCostPanel states
  const [savedFlash, setSavedFlash] = useState(false);
  const [wastePct, setWastePct] = useState(0);
  const [portions, setPortions] = useState(1);

  const handleSaveCost = async () => {
    await props.onSaveVersion();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  const handleCostFactorsChange = (
    newWastePct: number,
    newPortions: number,
  ) => {
    setWastePct(newWastePct);
    setPortions(newPortions);
    props.onCostFactorsChange?.(newWastePct, newPortions);
  };

  // WastageEntryModal / Form states
  const [wastageSearchQuery, setWastageSearchQuery] = useState("");
  const [wastageItems, setWastageItems] = useState<InventoryItem[]>([]);
  const [wastageSelectedItem, setWastageSelectedItem] =
    useState<InventoryItem | null>(null);
  const [wastageAmount, setWastageAmount] = useState("");
  const [wastageUnit, setWastageUnit] = useState("g");
  const [wastageReason, setWastageReason] = useState<WastageReason>("TRIM");
  const [wastageSubmitting, setWastageSubmitting] = useState(false);

  // Debounced search for wastage
  useEffect(() => {
    if (
      !wastageSearchQuery ||
      wastageSelectedItem?.name === wastageSearchQuery
    ) {
      setWastageItems([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const results = await props.onSearchItems(wastageSearchQuery);
        setWastageItems(results.slice(0, 8));
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [wastageSearchQuery, wastageSelectedItem, props.onSearchItems]);

  const handleWastageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(wastageAmount);
    if (!wastageSelectedItem || isNaN(num) || num <= 0) return;
    setWastageSubmitting(true);
    try {
      const success = await props.onSubmitWastage({
        itemId: wastageSelectedItem.id,
        amountG: num * (UNIT_TO_G[wastageUnit] || 1),
        reason: wastageReason,
      });
      if (success) {
        setIsWastageOpen(false);
        setWastageAmount("");
        setWastageSelectedItem(null);
        setWastageSearchQuery("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWastageSubmitting(false);
    }
  };

  return (
    <RecipeViewerView
      // Props from parent
      {...props}

      // RecipeViewer states
      isWastageOpen={isWastageOpen}
      setIsWastageOpen={setIsWastageOpen}
      isHistoryOpen={isHistoryOpen}
      setIsHistoryOpen={setIsHistoryOpen}

      // Scaling states
      scaleMode={scaleMode}
      setScaleMode={setScaleMode}
      targetYield={targetYield}
      setTargetYield={setTargetYield}
      targetWeight={targetWeight}
      handleWeightChange={handleWeightChange}
      selectedVesselId={selectedVesselId}
      setSelectedVesselId={setSelectedVesselId}

      // Cost states
      savedFlash={savedFlash}
      handleSaveCost={handleSaveCost}
      wastePct={wastePct}
      portions={portions}
      handleCostFactorsChange={handleCostFactorsChange}

      // Wastage states
      wastageSearchQuery={wastageSearchQuery}
      setWastageSearchQuery={setWastageSearchQuery}
      wastageItems={wastageItems}
      setWastageItems={setWastageItems}
      wastageSelectedItem={wastageSelectedItem}
      setWastageSelectedItem={setWastageSelectedItem}
      wastageAmount={wastageAmount}
      setWastageAmount={setWastageAmount}
      wastageUnit={wastageUnit}
      setWastageUnit={setWastageUnit}
      wastageReason={wastageReason}
      setWastageReason={setWastageReason}
      wastageSubmitting={wastageSubmitting}
      handleWastageSubmit={handleWastageSubmit}
    />
  );
}
