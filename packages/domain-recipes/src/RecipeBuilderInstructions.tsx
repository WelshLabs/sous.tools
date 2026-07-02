"use client";

import React from "react";
import { Plus, Trash2, Clock } from "lucide-react";
import { RecipeInstructionStep } from "./types";

/**
 * Props for the RecipeBuilderInstructions component.
 */
export interface RecipeBuilderInstructionsProps {
  /** Current instruction steps array. */
  steps: RecipeInstructionStep[];
  /** Callback fired when steps change. */
  onChange: (steps: RecipeInstructionStep[]) => void;
}

/**
 * RecipeBuilderInstructions — A dynamic form array for recipe instructions
 * with optional step timers.
 *
 * Uses the Neon-Glass `--color-card` surface and `--color-input` elements.
 *
 * **Presentation boundary**: Pure UI.
 *
 * @tenant-docs-export
 * # RecipeBuilderInstructions
 * ```tsx
 * import { RecipeBuilderInstructions } from "@soustools/domain-recipes";
 *
 * <RecipeBuilderInstructions
 *   steps={instructions}
 *   onChange={setInstructions}
 * />
 * ```
 */
export function RecipeBuilderInstructions({
  steps,
  onChange,
}: RecipeBuilderInstructionsProps) {
  const handleAddStep = () => {
    onChange([
      ...steps,
      {
        stepNumber: steps.length + 1,
        text: "",
        timerDurationSeconds: null,
      },
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    const filtered = steps.filter((_, i) => i !== idx);
    onChange(filtered.map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  const handleUpdateStep = (idx: number, fields: Partial<RecipeInstructionStep>) => {
    onChange(
      steps.map((step, i) => (i === idx ? { ...step, ...fields } : step))
    );
  };

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
          onClick={handleAddStep}
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
          {steps.map((step, idx) => {
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
              handleUpdateStep(idx, {
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
                      handleUpdateStep(idx, { text: e.target.value })
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
                  onClick={() => handleRemoveStep(idx)}
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
