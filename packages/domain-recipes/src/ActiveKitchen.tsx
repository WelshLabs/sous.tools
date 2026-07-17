"use client";

import { useState, useEffect } from "react";
import { type Recipe, type KitchenTimerState } from "@soustools/api-types";
import { ArrowLeft, Sun } from "lucide-react";
import Link from "next/link";
import { ActiveKitchenTimers } from "./ActiveKitchenTimers";
import { ActiveKitchenStep } from "./ActiveKitchenStep";

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
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    async function requestWakeLock() {
      if ("wakeLock" in navigator) {
        try {
          const wl = await (navigator as unknown as { wakeLock: { request: (type: string) => Promise<unknown> } }).wakeLock.request("screen");
          setWakeLock(wl as WakeLockSentinel);
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
  }, [wakeLock]);

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
            <ActiveKitchenStep
              key={step.stepNumber}
              step={step}
              isChecked={isChecked}
              onToggleCheck={toggleStepCheck}
              onStartTimer={handleStartStepTimer}
            />
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
