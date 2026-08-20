/* eslint-disable max-lines */
"use client";

import React, { useState, useEffect, useMemo } from "react";
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
import { calculateRecipeScale } from "../../utils/scaling";
import { RecipeViewerView } from "./RecipeViewer.view";

export type ScaleMode = "yield" | "weight" | "bakers" | "vessel";

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
  onIngredientUnitChange?: (ingId: string, newUnit: string) => void;
  onBakersPercentageChange?: (ingId: string, percentage: number) => void;
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
  ea: 50,
};

export function RecipeViewer(props: RecipeViewerProps) {
  // RecipeViewer states
  const [isWastageOpen, setIsWastageOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBakersMode, setIsBakersMode] = useState(false);

  // Scaling states
  const [scaleMode, setScaleMode] = useState<ScaleMode>("yield");
  const [targetYield, setTargetYield] = useState(props.recipe.yieldCount || 1);
  const [targetWeight, setTargetWeight] = useState("");
  const [targetBakersFlour, setTargetBakersFlour] = useState("");
  const [selectedVesselId, setSelectedVesselId] = useState(
    props.recipe.vesselId || "",
  );

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isHistoryOpen) setIsHistoryOpen(false);
        if (isWastageOpen) setIsWastageOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isHistoryOpen, isWastageOpen]);

  // Compute Baker's summary metrics
  const bakersSummary: BakersFormulaSummary = useMemo(() => {
    const { bakersSummary: summary } = calculateRecipeScale(
      props.recipe.recipeIngredients || [],
      props.recipe.yieldCount || 1,
    );
    return summary;
  }, [props.recipe.recipeIngredients, props.recipe.yieldCount]);

  useEffect(() => {
    if (scaleMode === "yield") {
      props.onScaleChange(targetYield / (props.recipe.yieldCount || 1));
    }
  }, [scaleMode, targetYield, props.recipe.yieldCount, props.onScaleChange]);

  useEffect(() => {
    if (scaleMode === "vessel" && selectedVesselId) {
      const currentVessel = props.vessels.find(
        (v) => v.id === props.recipe.vesselId,
      );
      const targetVessel = props.vessels.find((v) => v.id === selectedVesselId);
      if (currentVessel && targetVessel && currentVessel.volumeMl > 0) {
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

  const handleBakersFlourChange = (val: string) => {
    setTargetBakersFlour(val);
    const targetFlourG = parseFloat(val) || 0;
    const baseFlourG = bakersSummary.totalFlourWeightG || 1;
    if (targetFlourG > 0 && baseFlourG > 0) {
      props.onScaleChange(targetFlourG / baseFlourG);
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
      bakersSummary={bakersSummary}
      // RecipeViewer states
      isWastageOpen={isWastageOpen}
      setIsWastageOpen={setIsWastageOpen}
      isHistoryOpen={isHistoryOpen}
      setIsHistoryOpen={setIsHistoryOpen}
      isBakersMode={isBakersMode}
      setIsBakersMode={setIsBakersMode}
      // Scaling states
      scaleMode={scaleMode}
      setScaleMode={setScaleMode}
      targetYield={targetYield}
      setTargetYield={setTargetYield}
      targetWeight={targetWeight}
      handleWeightChange={handleWeightChange}
      targetBakersFlour={targetBakersFlour}
      handleBakersFlourChange={handleBakersFlourChange}
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
