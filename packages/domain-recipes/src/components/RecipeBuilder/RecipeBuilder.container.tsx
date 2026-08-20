/* eslint-disable max-lines */
"use client";

import React, { useState, useEffect } from "react";
import type {
  VesselProfile,
  MasterIngredient,
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
} from "@soustools/api-types";
import {
  type RecipeIngredientLine,
  type RecipeInstructionStep,
} from "../../types";
import { RecipeBuilderView } from "./RecipeBuilder.view";

export interface RecipeBuilderProps {
  initialData?: Recipe | null;
  vessels: VesselProfile[];
  masterIngredients: MasterIngredient[];
  loading?: boolean;
  onSave: (payload: {
    recipe: {
      title: string;
      yieldCount: number;
      yieldUnit: string;
      vesselId: string | null;
      instructions: RecipeInstructionStep[];
      status: string;
    };
    recipeIngredients: RecipeIngredientLine[];
  }) => Promise<void>;
  backHref?: string;
}

export function RecipeBuilder(props: RecipeBuilderProps) {
  const {
    initialData,
    vessels,
    masterIngredients,
    loading = false,
    onSave,
    backHref = "/recipes",
  } = props;

  const [title, setTitle] = useState("");
  const [yieldCount, setYieldCount] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("Portions");
  const [vesselId, setVesselId] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredientLine[]>([]);
  const [steps, setSteps] = useState<RecipeInstructionStep[]>([]);
  const [status, setStatus] = useState<string>("APPROVED");
  const [isBakersPercentage, setIsBakersPercentage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setYieldCount(initialData.yieldCount || 1);
      setYieldUnit(initialData.yieldUnit || "Portions");
      setVesselId(initialData.vesselId || "");

      const mappedIngredients: RecipeIngredientLine[] = (
        initialData.recipeIngredients || []
      ).map((ri: RecipeIngredient) => ({
        masterIngredientId: ri.masterIngredientId,
        amount: ri.amount,
        unit: ri.unit,
        calculationType: ri.calculationType,
        baseCalculationGroup: ri.baseCalculationGroup,
        prepNotes: ri.prepNotes || "",
        rawName: ri.rawName,
      }));

      setIngredients(mappedIngredients);

      const hasBakers = mappedIngredients.some(
        (i) =>
          i.calculationType === "bakers_percentage" || i.baseCalculationGroup,
      );
      setIsBakersPercentage(hasBakers);

      setSteps(
        (initialData.instructions || []).map((step: RecipeInstruction) => ({
          stepNumber: step.stepNumber,
          text: step.text,
          timerDurationSeconds: step.timerDurationSeconds,
        })),
      );

      setStatus(initialData.status || "APPROVED");
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        recipe: {
          title,
          yieldCount,
          yieldUnit,
          vesselId: vesselId || null,
          instructions: steps,
          status,
        },
        recipeIngredients: ingredients,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddIngredientLine = () => {
    setIngredients((prev) => [
      ...prev,
      {
        masterIngredientId: masterIngredients[0]?.id || "",
        amount: isBakersPercentage && prev.length > 0 ? 60 : 100,
        unit: isBakersPercentage && prev.length > 0 ? "%" : "g",
        calculationType:
          isBakersPercentage && prev.length > 0
            ? "bakers_percentage"
            : "fixed_weight",
        baseCalculationGroup: isBakersPercentage && prev.length === 0,
        prepNotes: "",
      },
    ]);
  };

  const handleRemoveIngredientLine = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateIngredientLine = (
    idx: number,
    fields: Partial<RecipeIngredientLine>,
  ) => {
    setIngredients((prev) =>
      prev.map((line, i) => (i === idx ? { ...line, ...fields } : line)),
    );
  };

  const handleAddInstructionStep = () => {
    setSteps((prev) => [
      ...prev,
      {
        stepNumber: prev.length + 1,
        text: "",
        timerDurationSeconds: null,
      },
    ]);
  };

  const handleRemoveInstructionStep = (idx: number) => {
    setSteps((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      return filtered.map((step, i) => ({ ...step, stepNumber: i + 1 }));
    });
  };

  const handleUpdateInstructionStep = (
    idx: number,
    fields: Partial<RecipeInstructionStep>,
  ) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === idx ? { ...step, ...fields } : step)),
    );
  };

  return (
    <RecipeBuilderView
      title={title}
      setTitle={setTitle}
      yieldCount={yieldCount}
      setYieldCount={setYieldCount}
      yieldUnit={yieldUnit}
      setYieldUnit={setYieldUnit}
      vesselId={vesselId}
      setVesselId={setVesselId}
      status={status}
      setStatus={setStatus}
      isBakersPercentage={isBakersPercentage}
      setIsBakersPercentage={setIsBakersPercentage}
      ingredients={ingredients}
      onAddIngredientLine={handleAddIngredientLine}
      onRemoveIngredientLine={handleRemoveIngredientLine}
      onUpdateIngredientLine={handleUpdateIngredientLine}
      steps={steps}
      onAddInstructionStep={handleAddInstructionStep}
      onRemoveInstructionStep={handleRemoveInstructionStep}
      onUpdateInstructionStep={handleUpdateInstructionStep}
      vessels={vessels}
      masterIngredients={masterIngredients}
      loading={loading}
      saving={saving}
      onSubmit={handleSubmit}
      backHref={backHref}
      isEditing={!!initialData}
    />
  );
}
