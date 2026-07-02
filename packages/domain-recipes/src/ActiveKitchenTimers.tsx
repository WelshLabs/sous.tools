"use client";

import React, { useState, useEffect } from "react";
import { KitchenTimerState } from "@soustools/api-types";
import { Play, Pause, RotateCcw, Clock, X, Bell } from "lucide-react";

/**
 * Props for the ActiveKitchenTimers component.
 */
export interface ActiveKitchenTimersProps {
  /** The current list of kitchen timers. */
  activeTimers: KitchenTimerState[];
  /**
   * Called when the timer list changes (start/pause/reset/remove).
   * The app layer persists to localStorage and updates state.
   */
  onUpdateTimers: (timers: KitchenTimerState[]) => void;
}

/**
 * ActiveKitchenTimers — a floating overlay of active kitchen countdown timers.
 *
 * Positioned fixed bottom-right at z-40. Uses `--color-card` glass surface
 * with `backdrop-blur`. Completed timers pulse red (`--color-destructive`).
 * Running timers use the emerald success color. Paused timers use amber warning.
 *
 * This component manages its own tick interval for display — but it does NOT
 * own timer state. All mutations delegate to `onUpdateTimers`.
 *
 * Returns `null` when there are no active timers.
 *
 * @tenant-docs-export
 * # ActiveKitchenTimers
 * ```tsx
 * import { ActiveKitchenTimers } from "@soustools/domain-recipes";
 *
 * <ActiveKitchenTimers
 *   activeTimers={timers}
 *   onUpdateTimers={handleUpdateTimers}
 * />
 * ```
 */
export function ActiveKitchenTimers({
  activeTimers,
  onUpdateTimers,
}: ActiveKitchenTimersProps) {
  const [tickedTimers, setTickedTimers] =
    useState<KitchenTimerState[]>(activeTimers);

  useEffect(() => {
    setTickedTimers(activeTimers);
  }, [activeTimers]);

  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      tickedTimers.forEach((timer) => {
        if (!timer.isActive || !timer.startedAt) return;
        const now = Date.now();
        const start = new Date(timer.startedAt).getTime();
        const deltaSec = Math.floor((now - start) / 1000);
        if (deltaSec > 0) changed = true;
      });
      if (changed) setTickedTimers([...tickedTimers]);
    }, 250);
    return () => clearInterval(interval);
  }, [tickedTimers]);

  const handleStartPause = (idx: number) => {
    const timer = tickedTimers[idx];
    const updated = [...tickedTimers];
    if (timer.isActive) {
      const now = Date.now();
      const start = timer.startedAt
        ? new Date(timer.startedAt).getTime()
        : now;
      const elapsed = timer.elapsedSeconds + Math.floor((now - start) / 1000);
      updated[idx] = {
        ...timer,
        isActive: false,
        startedAt: null,
        pausedAt: new Date().toISOString(),
        elapsedSeconds: elapsed,
      };
    } else {
      updated[idx] = {
        ...timer,
        isActive: true,
        startedAt: new Date().toISOString(),
        pausedAt: null,
      };
    }
    onUpdateTimers(updated);
  };

  const handleReset = (idx: number) => {
    const updated = [...tickedTimers];
    updated[idx] = {
      ...tickedTimers[idx],
      isActive: false,
      startedAt: null,
      pausedAt: null,
      elapsedSeconds: 0,
    };
    onUpdateTimers(updated);
  };

  const handleRemove = (idx: number) => {
    onUpdateTimers(tickedTimers.filter((_, i) => i !== idx));
  };

  if (tickedTimers.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 w-80 rounded-2xl shadow-2xl p-4
        backdrop-blur-md max-h-[400px] overflow-y-auto space-y-3"
      style={{
        backgroundColor: "rgb(15 23 42 / 0.90)",
        border: "1px solid var(--color-border)",
        color: "var(--color-foreground)",
      }}
    >
      <h4
        className="text-xs font-bold flex items-center gap-1.5 uppercase
          tracking-wider pb-2"
        style={{
          color: "var(--color-muted-foreground)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <Clock className="w-4 h-4 animate-pulse" style={{ color: "#10b981" }} />
        Active Timers ({tickedTimers.length})
      </h4>

      <div className="space-y-3">
        {tickedTimers.map((timer, idx) => {
          let totalElapsed = timer.elapsedSeconds;
          if (timer.isActive && timer.startedAt) {
            const now = Date.now();
            const start = new Date(timer.startedAt).getTime();
            totalElapsed =
              timer.elapsedSeconds + Math.floor((now - start) / 1000);
          }

          const remaining = Math.max(0, timer.durationSeconds - totalElapsed);
          const isDone = remaining === 0;
          const minutes = Math.floor(remaining / 60);
          const seconds = remaining % 60;
          const progressPercent = Math.min(
            100,
            (totalElapsed / timer.durationSeconds) * 100,
          );

          return (
            <div
              key={timer.id}
              className={`p-3 rounded-xl transition-all ${isDone ? "animate-pulse" : ""}`}
              style={{
                backgroundColor: isDone
                  ? "rgb(244 63 94 / 0.10)"
                  : "var(--color-card)",
                border: isDone
                  ? "1px solid rgb(244 63 94 / 0.30)"
                  : "1px solid var(--color-border)",
              }}
            >
              <div className="flex justify-between items-center mb-1">
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--color-foreground)" }}
                >
                  Step {timer.stepIndex} Timer
                </span>
                <button
                  onClick={() => handleRemove(idx)}
                  className="p-1 rounded transition-colors cursor-pointer"
                  style={{ color: "var(--color-muted-foreground)" }}
                  aria-label="Remove timer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-2xl font-black font-mono tracking-tight"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {minutes.toString().padStart(2, "0")}:
                    {seconds.toString().padStart(2, "0")}
                  </span>
                  {isDone && (
                    <Bell
                      className="w-4 h-4 animate-bounce inline"
                      style={{ color: "var(--color-destructive)" }}
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartPause(idx)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={
                      timer.isActive
                        ? { backgroundColor: "rgb(245 158 11 / 0.15)", color: "#f59e0b" }
                        : { backgroundColor: "rgb(16 185 129 / 0.15)", color: "#10b981" }
                    }
                    aria-label={timer.isActive ? "Pause timer" : "Start timer"}
                  >
                    {timer.isActive ? (
                      <Pause className="w-3.5 h-3.5" />
                    ) : (
                      <Play className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleReset(idx)}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{
                      backgroundColor: "var(--color-secondary)",
                      color: "var(--color-muted-foreground)",
                    }}
                    aria-label="Reset timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div
                className="w-full h-1.5 rounded-full overflow-hidden mt-3"
                style={{ backgroundColor: "var(--color-secondary)" }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: isDone
                      ? "var(--color-destructive)"
                      : "#10b981",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
