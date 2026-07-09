"use client";

import { CheckCircle2, Play } from "lucide-react";
import type { RecipeInstruction } from "@soustools/api-types";

export interface ActiveKitchenStepProps {
  step: RecipeInstruction;
  isChecked: boolean;
  onToggleCheck: (stepNumber: number) => void;
  onStartTimer?: (stepNumber: number, duration: number) => void;
}

export function ActiveKitchenStep({
  step,
  isChecked,
  onToggleCheck,
  onStartTimer,
}: ActiveKitchenStepProps) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer select-none min-h-[56px]`}
      style={{
        backgroundColor: isChecked ? "rgb(15 23 42 / 0.40)" : "var(--color-card)",
        borderColor: isChecked ? "transparent" : "var(--color-border)",
        opacity: isChecked ? 0.5 : 1,
      }}
      onClick={() => onToggleCheck(step.stepNumber)}
    >
      <button
        className="mt-1 min-h-[48px] min-w-[48px] flex items-center justify-center focus:outline-none transition-colors"
        style={{
          color: isChecked ? "#10b981" : "var(--color-muted-foreground)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleCheck(step.stepNumber);
        }}
      >
        <CheckCircle2
          className={`w-8 h-8 transition-all ${isChecked ? "fill-emerald-500/20" : "hover:scale-110"}`}
        />
      </button>

      <div className="flex-1 py-2">
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Step {step.stepNumber}
        </span>
        <p
          className={`text-lg font-medium mt-1 leading-relaxed ${isChecked ? "line-through" : ""}`}
          style={{ color: "var(--color-foreground)" }}
        >
          {step.text}
        </p>
      </div>

      {step.timerDurationSeconds && !isChecked && onStartTimer && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartTimer(step.stepNumber, step.timerDurationSeconds!);
          }}
          className="px-4 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer min-h-[48px]"
          style={{
            backgroundColor: "rgb(16 185 129 / 0.15)",
            color: "#10b981",
            border: "1px solid rgb(16 185 129 / 0.30)",
          }}
        >
          <Play className="w-4 h-4 fill-current" /> {Math.floor(step.timerDurationSeconds / 60)}m
        </button>
      )}
    </div>
  );
}
