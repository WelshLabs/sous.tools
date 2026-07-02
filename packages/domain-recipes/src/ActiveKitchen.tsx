"use client";

import React, { useState, useEffect } from "react";
import { Recipe, KitchenTimerState } from "@soustools/api-types";
import { ArrowLeft, Play, Sun, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ActiveKitchenTimers } from "./ActiveKitchenTimers";

/**
 * Props for the ActiveKitchen component.
 */
export interface ActiveKitchenProps {
  /** The fully loaded recipe. */
  recipe: Recipe;
  /**
   * The list of active timers. The app layer is responsible for persistence
   * (e.g. localStorage).
   */
  activeTimers: KitchenTimerState[];
  /** Callback when timers are updated. */
  onUpdateTimers: (timers: KitchenTimerState[]) => void;
  /** Link for the back button. */
  backHref?: string;
}

/**
 * ActiveKitchen — Large display, touch-optimized recipe runner.
 *
 * Uses Neon-Glass styling (`--color-card`). Includes an internal WakeLock
 * to prevent the screen from sleeping during cooking.
 *
 * **Presentation boundary**: No data fetching or localStorage. All state
 * persistence delegates to the app layer via props.
 *
 * @tenant-docs-export
 * # ActiveKitchen
 * ```tsx
 * import { ActiveKitchen } from "@soustools/domain-recipes";
 *
 * <ActiveKitchen
 *   recipe={recipe}
 *   activeTimers={timers}
 *   onUpdateTimers={handleUpdateTimers}
 * />
 * ```
 */
export function ActiveKitchen({
  recipe,
  activeTimers,
  onUpdateTimers,
  backHref = "/recipes",
}: ActiveKitchenProps) {
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    async function requestWakeLock() {
      if ("wakeLock" in navigator) {
        try {
          const wl = await (navigator as any).wakeLock.request("screen");
          setWakeLock(wl);
          setWakeLockActive(true);
        } catch (err) {
          console.warn("Wake lock request failed", err);
        }
      }
    }
    requestWakeLock();
    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => setWakeLock(null));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStartStepTimer = (stepIndex: number, durationSeconds: number) => {
    const timerId = `${recipe.id}-${stepIndex}`;
    const exists = activeTimers.some((t) => t.id === timerId);
    if (exists) return;

    const newTimer: KitchenTimerState = {
      id: timerId,
      stepIndex,
      durationSeconds,
      startedAt: new Date().toISOString(),
      pausedAt: null,
      elapsedSeconds: 0,
      isActive: true,
    };
    onUpdateTimers([...activeTimers, newTimer]);
  };

  const toggleStepCheck = (stepNumber: number) => {
    setCheckedSteps({
      ...checkedSteps,
      [stepNumber]: !checkedSteps[stepNumber],
    });
  };

  return (
    <div
      className="min-h-screen p-6 flex flex-col justify-between w-full kitchen-touch"
      style={{
        backgroundColor: "var(--color-background)",
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
            className="p-2 rounded-lg transition-colors cursor-pointer hover:bg-white/5 min-h-[48px] flex items-center justify-center"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-xl font-black uppercase tracking-wide">
              {recipe.title}
            </h2>
            <p
              className="text-xs font-medium"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              Active Kitchen Mode — Large display optimized for touch.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wakeLockActive ? (
            <span
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "rgb(16 185 129 / 0.15)",
                color: "#10b981",
                border: "1px solid rgb(16 185 129 / 0.30)",
              }}
            >
              <Sun className="w-3.5 h-3.5" /> Wake Lock Active
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-muted-foreground)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Sun className="w-3.5 h-3.5 opacity-40" /> Wake Lock Offline
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 py-8 space-y-6">
        {recipe.instructions.map((step) => {
          const isChecked = checkedSteps[step.stepNumber] || false;
          return (
            <div
              key={step.stepNumber}
              className={`p-6 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer select-none min-h-[56px]`}
              style={{
                backgroundColor: isChecked
                  ? "rgb(15 23 42 / 0.40)"
                  : "var(--color-card)",
                borderColor: isChecked
                  ? "transparent"
                  : "var(--color-border)",
                opacity: isChecked ? 0.5 : 1,
              }}
              onClick={() => toggleStepCheck(step.stepNumber)}
            >
              <button
                className="mt-1 min-h-[48px] min-w-[48px] flex items-center justify-center focus:outline-none transition-colors"
                style={{
                  color: isChecked
                    ? "#10b981"
                    : "var(--color-muted-foreground)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleStepCheck(step.stepNumber);
                }}
              >
                <CheckCircle2
                  className={`w-8 h-8 transition-all ${
                    isChecked ? "fill-emerald-500/20" : "hover:scale-110"
                  }`}
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
                  className={`text-lg font-medium mt-1 leading-relaxed ${
                    isChecked ? "line-through" : ""
                  }`}
                  style={{ color: "var(--color-foreground)" }}
                >
                  {step.text}
                </p>
              </div>

              {step.timerDurationSeconds && !isChecked && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartStepTimer(
                      step.stepNumber,
                      step.timerDurationSeconds!
                    );
                  }}
                  className="px-4 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all cursor-pointer min-h-[48px]"
                  style={{
                    backgroundColor: "rgb(16 185 129 / 0.15)",
                    color: "#10b981",
                    border: "1px solid rgb(16 185 129 / 0.30)",
                  }}
                >
                  <Play className="w-4 h-4 fill-current" />{" "}
                  {Math.floor(step.timerDurationSeconds / 60)}m
                </button>
              )}
            </div>
          );
        })}
      </main>

      <ActiveKitchenTimers
        activeTimers={activeTimers}
        onUpdateTimers={onUpdateTimers}
      />
    </div>
  );
}
