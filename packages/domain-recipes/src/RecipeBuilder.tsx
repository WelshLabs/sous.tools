"use client";

import React from "react";
import { useState, useEffect } from "react";
import { type VesselProfile, type MasterIngredient, type Recipe, type RecipeIngredient, type RecipeInstruction } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RecipeBuilderIngredients } from "./RecipeBuilderIngredients";
import { RecipeBuilderFormFields } from "./RecipeBuilderFormFields";
import { RecipeBuilderInstructions } from "./RecipeBuilderInstructions";
import { type RecipeIngredientLine, type RecipeInstructionStep } from "./types";

/**
 * Props for the RecipeBuilder form.
 */
export interface RecipeBuilderProps {
  /** Existing recipe data if editing. Null/undefined if creating. */
  initialData?: Recipe | null;
  /** Available vessel profiles for the dropdown. */
  vessels: VesselProfile[];
  /** Available master ingredients for the ingredient lines. */
  masterIngredients: MasterIngredient[];
  /** Loading state indicator. */
  loading?: boolean;
  /**
   * Called when the form is submitted. The app layer handles the API call
   * and routing.
   */
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
  /** Link href for the cancel / back button. */
  backHref?: string;
}

/**
 * RecipeBuilder — The main form for creating or editing recipes.
 *
 * Employs Neon-Glass `--color-card` and semantic styles. Composes the
 * `RecipeBuilderIngredients` and `RecipeBuilderInstructions` components.
 *
 * **Presentation boundary**: No data fetching. Receives `initialData`,
 * `vessels`, and `masterIngredients` via props. Emits payload on `onSave`.
 *
 * @tenant-docs-export
 * # RecipeBuilder
 * ```tsx
 * import { RecipeBuilder } from "@soustools/domain-recipes";
 *
 * <RecipeBuilder
 *   initialData={recipe}
 *   vessels={vessels}
 *   masterIngredients={masterIngredients}
 *   onSave={handleSave}
 *   backHref="/recipes"
 * />
 * ```
 */
export function RecipeBuilder({
  initialData,
  vessels,
  masterIngredients,
  loading = false,
  onSave,
  backHref = "/recipes",
}: RecipeBuilderProps) {
  const [title, setTitle] = useState("");
  const [yieldCount, setYieldCount] = useState(1);
  const [yieldUnit, setYieldUnit] = useState("Portions");
  const [vesselId, setVesselId] = useState("");
  const [ingredients, setIngredients] = useState<RecipeIngredientLine[]>([]);
  const [steps, setSteps] = useState<RecipeInstructionStep[]>([]);
  const [status, setStatus] = useState<string>("APPROVED");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setYieldCount(initialData.yieldCount || 1);
      setYieldUnit(initialData.yieldUnit || "Portions");
      setVesselId(initialData.vesselId || "");
      setIngredients(
        (initialData.recipeIngredients || []).map((ri: RecipeIngredient) => ({
          masterIngredientId: ri.masterIngredientId,
          amount: ri.amount,
          unit: ri.unit,
          calculationType: ri.calculationType,
          baseCalculationGroup: ri.baseCalculationGroup,
          prepNotes: ri.prepNotes || "",
          rawName: ri.rawName,
        }))
      );
      setSteps(
        (initialData.instructions || []).map((step: RecipeInstruction) => ({
          stepNumber: step.stepNumber,
          text: step.text,
          timerDurationSeconds: step.timerDurationSeconds,
        }))
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

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 p-6 rounded-2xl max-w-5xl mx-auto"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
        color: "var(--color-foreground)",
      }}
    >
      <header
        className="flex justify-between items-center pb-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 hover:text-white" />
          </Link>
          <div>
            <h2
              className="text-xl font-bold flex items-center gap-2"
              style={{ color: "var(--color-foreground)" }}
            >
              <ChefHat
                className="w-5 h-5"
                style={{ color: "var(--color-primary)" }}
              />{" "}
              {initialData ? "Edit Recipe" : "Create Recipe"}
            </h2>
            <p className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>

              Configure yields, baseline flour groups, and step durations.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={backHref}>
            <button
              type="button"
              className="px-4 py-2 text-sm rounded-lg transition-colors cursor-pointer"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-foreground)",
              }}
            >
              Cancel
            </button>
          </Link>
          <Button type="submit" disabled={saving || loading}>
            {saving ? "Saving..." : "Save Recipe"}
          </Button>
        </div>
      </header>

      <RecipeBuilderFormFields
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
        vessels={vessels}
      />

      <RecipeBuilderIngredients
        lines={ingredients}
        onChange={setIngredients}
        masterIngredients={masterIngredients}
      />
      <RecipeBuilderInstructions steps={steps} onChange={setSteps} />
    </form>
  );
}
