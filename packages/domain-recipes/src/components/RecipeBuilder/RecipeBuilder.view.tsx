"use client";

/* eslint-disable max-lines */

import React from "react";
import { Button } from "@soustools/design-system";
import { ChefHat, ArrowLeft, Plus, Trash2, Clock } from "lucide-react";
import Link from "next/link";
import {
  type VesselProfile,
  type MasterIngredient,
} from "@soustools/api-types";
import {
  type RecipeIngredientLine,
  type RecipeInstructionStep,
} from "../../types";

export interface RecipeBuilderViewProps {
  title: string;
  setTitle: (val: string) => void;
  yieldCount: number;
  setYieldCount: (val: number) => void;
  yieldUnit: string;
  setYieldUnit: (val: string) => void;
  vesselId: string;
  setVesselId: (val: string) => void;
  status: string;
  setStatus: (val: string) => void;
  ingredients: RecipeIngredientLine[];
  onAddIngredientLine: () => void;
  onRemoveIngredientLine: (idx: number) => void;
  onUpdateIngredientLine: (
    idx: number,
    fields: Partial<RecipeIngredientLine>,
  ) => void;
  steps: RecipeInstructionStep[];
  onAddInstructionStep: () => void;
  onRemoveInstructionStep: (idx: number) => void;
  onUpdateInstructionStep: (
    idx: number,
    fields: Partial<RecipeInstructionStep>,
  ) => void;
  vessels: VesselProfile[];
  masterIngredients: MasterIngredient[];
  loading: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  backHref: string;
  isEditing: boolean;
}

export function RecipeBuilderView({
  title,
  setTitle,
  yieldCount,
  setYieldCount,
  yieldUnit,
  setYieldUnit,
  vesselId,
  setVesselId,
  status,
  setStatus,
  ingredients,
  onAddIngredientLine,
  onRemoveIngredientLine,
  onUpdateIngredientLine,
  steps,
  onAddInstructionStep,
  onRemoveInstructionStep,
  onUpdateInstructionStep,
  vessels,
  masterIngredients,
  loading,
  saving,
  onSubmit,
  backHref,
  isEditing,
}: RecipeBuilderViewProps) {
  return (
    <form
      onSubmit={onSubmit}
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
              {isEditing ? "Edit Recipe" : "Create Recipe"}
            </h2>
            <p
              className="text-xs"
              style={{ color: "var(--color-muted-foreground)" }}
            >
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
        onAddLine={onAddIngredientLine}
        onRemoveLine={onRemoveIngredientLine}
        onUpdateLine={onUpdateIngredientLine}
        masterIngredients={masterIngredients}
      />

      <RecipeBuilderInstructions
        steps={steps}
        onAddStep={onAddInstructionStep}
        onRemoveStep={onRemoveInstructionStep}
        onUpdateStep={onUpdateInstructionStep}
      />
    </form>
  );
}

export function RecipeBuilderFormFields({
  title,
  setTitle,
  yieldCount,
  setYieldCount,
  yieldUnit,
  setYieldUnit,
  vesselId,
  setVesselId,
  status,
  setStatus,
  vessels,
}: any) {
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <>
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
          {vessels.map((v: any) => (
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
    </>
  );
}

export function RecipeBuilderIngredients({
  lines,
  onAddLine,
  onRemoveLine,
  onUpdateLine,
  masterIngredients,
}: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4
          className="text-sm font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Recipe Ingredients
        </h4>
        <button
          type="button"
          onClick={onAddLine}
          className="text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          style={{ color: "var(--color-primary)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Ingredient
        </button>
      </div>

      {lines.length === 0 ? (
        <div
          className="text-xs py-4 text-center border border-dashed rounded-lg"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          No ingredients added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {lines.map((line: any, idx: number) => (
            <RecipeBuilderIngredientRow
              key={idx}
              line={line}
              idx={idx}
              masterIngredients={masterIngredients}
              handleUpdateLine={onUpdateLine}
              handleRemoveLine={onRemoveLine}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RecipeBuilderIngredientRow({
  line,
  idx,
  masterIngredients,
  handleUpdateLine,
  handleRemoveLine,
}: any) {
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div
      className="p-3 rounded-xl flex flex-col md:flex-row gap-3 items-start md:items-center"
      style={{
        backgroundColor: "var(--color-card)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex-1 w-full">
        <select
          value={line.masterIngredientId || ""}
          onChange={(e) =>
            handleUpdateLine(idx, {
              masterIngredientId: e.target.value || null,
            })
          }
          className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          style={inputStyle}
        >
          <option value="">
            -- Unmapped Item {line.rawName ? `(${line.rawName})` : ""} --
          </option>
          {masterIngredients.map((mi: any) => (
            <option key={mi.id} value={mi.id}>
              {mi.name}{" "}
              {mi.currentCostPerG
                ? `($${mi.currentCostPerG.toFixed(3)}/g)`
                : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 w-full md:w-auto">
        <input
          type="number"
          step="any"
          value={line.amount}
          onChange={(e) =>
            handleUpdateLine(idx, {
              amount: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="Amt"
          className="w-20 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          style={inputStyle}
          required
        />
        <select
          value={line.unit}
          onChange={(e) => handleUpdateLine(idx, { unit: e.target.value })}
          className="w-20 rounded-lg px-2 py-1.5 text-xs focus:outline-none"
          style={inputStyle}
        >
          <option value="g">g</option>
          <option value="kg">kg</option>
          <option value="oz">oz</option>
          <option value="lb">lb</option>
          <option value="ml">ml</option>
          <option value="l">l</option>
          <option value="tsp">tsp</option>
          <option value="tbsp">tbsp</option>
          <option value="cup">cup</option>
          <option value="count">count</option>
          <option value="%">%</option>
        </select>
      </div>

      <div className="flex gap-4 items-center w-full md:w-auto justify-between md:justify-start">
        <select
          value={line.calculationType}
          onChange={(e) =>
            handleUpdateLine(idx, {
              calculationType: e.target.value as
                "fixed_weight" | "bakers_percentage",
            })
          }
          className="rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
          style={inputStyle}
        >
          <option value="fixed_weight">Fixed Weight</option>
          <option value="bakers_percentage">Baker's %</option>
        </select>

        <label
          className="flex items-center gap-1.5 text-xs select-none cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <input
            type="checkbox"
            checked={line.baseCalculationGroup}
            onChange={(e) =>
              handleUpdateLine(idx, {
                baseCalculationGroup: e.target.checked,
              })
            }
            className="rounded focus:ring-0 focus:ring-offset-0"
            style={{
              accentColor: "var(--color-primary)",
              backgroundColor: "var(--color-input)",
              borderColor: "var(--color-border)",
            }}
          />
          Base Flour
        </label>
      </div>

      <input
        type="text"
        value={line.prepNotes}
        onChange={(e) => handleUpdateLine(idx, { prepNotes: e.target.value })}
        placeholder="Prep Notes (e.g. sifted, ice cold)"
        className="flex-1 min-w-[150px] w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
        style={inputStyle}
      />

      <button
        type="button"
        onClick={() => handleRemoveLine(idx)}
        className="p-1.5 rounded-lg transition-colors cursor-pointer self-end md:self-auto"
        style={{
          backgroundColor: "rgb(244 63 94 / 0.10)",
          color: "var(--color-destructive)",
        }}
        aria-label="Remove ingredient"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function RecipeBuilderInstructions({
  steps,
  onAddStep,
  onRemoveStep,
  onUpdateStep,
}: any) {
  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4
          className="text-sm font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Instructions &amp; Timers
        </h4>
        <button
          type="button"
          onClick={onAddStep}
          className="text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
          style={{ color: "var(--color-primary)" }}
        >
          <Plus className="w-3.5 h-3.5" /> Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div
          className="text-xs py-4 text-center border border-dashed rounded-lg"
          style={{
            borderColor: "var(--color-border)",
            color: "var(--color-muted-foreground)",
          }}
        >
          No instruction steps added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step: any, idx: number) => {
            const minutesVal = step.timerDurationSeconds
              ? Math.floor(step.timerDurationSeconds / 60)
              : "";
            const secondsVal = step.timerDurationSeconds
              ? step.timerDurationSeconds % 60
              : "";

            const handleTimerChange = (min: string, sec: string) => {
              const m = parseInt(min) || 0;
              const s = parseInt(sec) || 0;
              const totalSec = m * 60 + s;
              onUpdateStep(idx, {
                timerDurationSeconds: totalSec > 0 ? totalSec : null,
              });
            };

            return (
              <div
                key={idx}
                className="p-4 rounded-xl flex flex-col md:flex-row gap-3 items-start"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
                  style={{
                    backgroundColor: "var(--color-secondary)",
                    color: "var(--color-foreground)",
                  }}
                >
                  {step.stepNumber}
                </div>

                <div className="flex-1 w-full">
                  <textarea
                    rows={2}
                    value={step.text}
                    onChange={(e) =>
                      onUpdateStep(idx, { text: e.target.value })
                    }
                    placeholder="Describe the instruction details..."
                    className="w-full rounded-lg px-2.5 py-1.5 text-xs focus:outline-none resize-none"
                    style={inputStyle}
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Clock
                      className="w-4 h-4"
                      style={{ color: "var(--color-muted-foreground)" }}
                    />
                    <input
                      type="number"
                      min="0"
                      value={minutesVal}
                      onChange={(e) =>
                        handleTimerChange(e.target.value, secondsVal.toString())
                      }
                      placeholder="Min"
                      className="w-14 rounded-lg px-2 py-1 text-center text-xs focus:outline-none"
                      style={inputStyle}
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      :
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={secondsVal}
                      onChange={(e) =>
                        handleTimerChange(minutesVal.toString(), e.target.value)
                      }
                      placeholder="Sec"
                      className="w-14 rounded-lg px-2 py-1 text-center text-xs focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <span
                    className="text-[10px] text-center"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    (Optional step timer)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveStep(idx)}
                  className="p-2 rounded-lg transition-colors cursor-pointer self-end md:self-auto"
                  style={{
                    backgroundColor: "rgb(244 63 94 / 0.10)",
                    color: "var(--color-destructive)",
                  }}
                  aria-label="Remove instruction step"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function AutoCalculateButton({
  onAutoCalculate,
}: {
  onAutoCalculate: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAutoCalculate}
      className="text-xs px-3 py-2.5 rounded-lg transition-colors cursor-pointer font-semibold border"
      style={{
        backgroundColor: "var(--color-secondary)",
        borderColor: "var(--color-border)",
        color: "var(--color-primary)",
      }}
    >
      Auto-Calc Volume
    </button>
  );
}
