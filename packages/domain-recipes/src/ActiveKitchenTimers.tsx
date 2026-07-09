"use client";

import { useState, useEffect } from "react";
import { type KitchenTimerState } from "@soustools/api-types";
import { Clock } from "lucide-react";
import { ActiveKitchenTimerRow } from "./ActiveKitchenTimerRow";

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
        backdrop-blur-md max-h-[400px] overflow-y-auto space-y-3 bg-card"
      style={{
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
        {tickedTimers.map((timer, idx) => (
          <ActiveKitchenTimerRow
            key={timer.id}
            timer={timer}
            idx={idx}
            onRemove={handleRemove}
            onStartPause={handleStartPause}
            onReset={handleReset}
          />
        ))}
      </div>
    </div>
  );
}
