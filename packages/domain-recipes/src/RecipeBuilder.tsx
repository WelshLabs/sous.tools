"use client";

import React from "react";
import { useState, useEffect } from "react";
import { type VesselProfile, type MasterIngredient, type Recipe } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { ChefHat, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { RecipeBuilderIngredients } from "./RecipeBuilderIngredients";
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
        (initialData.recipeIngredients || []).map((ri: any) => ({
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
        (initialData.instructions || []).map((step: any) => ({
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

  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
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
            <p className="text-xs" style={labelStyle}>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Recipe Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Traditional Sourdough Bread"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Default Yield
          </label>
          <input
            type="number"
            step="any"
            min="0.01"
            value={yieldCount}
            onChange={(e) => setYieldCount(parseFloat(e.target.value) || 1)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1" style={labelStyle}>
            Yield Unit
          </label>
          <input
            type="text"
            value={yieldUnit}
            onChange={(e) => setYieldUnit(e.target.value)}
            placeholder="e.g. loaves, portions"
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={labelStyle}>
          Default Vessel Profile (Optional)
        </label>
        <select
          value={vesselId}
          onChange={(e) => setVesselId(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        >
          <option value="">None (Standard Yield Scaling only)</option>
          {vessels.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.volumeMl} ml)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium mb-1" style={labelStyle}>
          Recipe Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
          style={inputStyle}
        >
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>

      <RecipeBuilderIngredients
        lines={ingredients}
        onChange={setIngredients}
        masterIngredients={masterIngredients}
      />
      <RecipeBuilderInstructions steps={steps} onChange={setSteps} />
    </form>
  );
}
