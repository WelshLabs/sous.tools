"use client";

import { useState, useEffect, useCallback } from "react";
import { type Recipe, type KitchenTimerState } from "@soustools/api-types";
import { ActiveKitchenView } from "./ActiveKitchen.view";

export interface ActiveKitchenProps {
  recipe: Recipe;
  activeTimers?: KitchenTimerState[];
  onUpdateTimers?: (timers: KitchenTimerState[]) => void;
  backHref?: string;
}

export function ActiveKitchen({
  recipe,
  activeTimers: externalTimers,
  onUpdateTimers: externalOnUpdateTimers,
  backHref = "/recipes",
}: ActiveKitchenProps) {
  const [internalTimers, setInternalTimers] = useState<KitchenTimerState[]>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(`timers_${recipe.id}`);
        if (saved) {
          try {
            return JSON.parse(saved);
          } catch (err) {
            console.error("Failed to parse timers", err);
          }
        }
      }
      return [];
    },
  );

  const activeTimers = externalTimers ?? internalTimers;
  const onUpdateTimers = useCallback(
    (newTimers: KitchenTimerState[]) => {
      if (externalOnUpdateTimers) {
        externalOnUpdateTimers(newTimers);
      } else {
        setInternalTimers(newTimers);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `timers_${recipe.id}`,
            JSON.stringify(newTimers),
          );
        }
      }
    },
    [externalOnUpdateTimers, recipe.id],
  );

  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    async function requestWakeLock() {
      if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
        try {
          const wl = await (
            navigator as unknown as {
              wakeLock: { request: (type: string) => Promise<unknown> };
            }
          ).wakeLock.request("screen");
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
    setCheckedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

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

  const handleStartPauseTimer = (idx: number) => {
    const timer = tickedTimers[idx];
    const updated = [...tickedTimers];
    if (timer.isActive) {
      const now = Date.now();
      const start = timer.startedAt ? new Date(timer.startedAt).getTime() : now;
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

  const handleResetTimer = (idx: number) => {
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

  const handleRemoveTimer = (idx: number) => {
    onUpdateTimers(tickedTimers.filter((_, i) => i !== idx));
  };

  return (
    <ActiveKitchenView
      recipe={recipe}
      backHref={backHref}
      wakeLockActive={wakeLockActive}
      checkedSteps={checkedSteps}
      onToggleStepCheck={toggleStepCheck}
      onStartStepTimer={handleStartStepTimer}
      tickedTimers={tickedTimers}
      onStartPauseTimer={handleStartPauseTimer}
      onResetTimer={handleResetTimer}
      onRemoveTimer={handleRemoveTimer}
    />
  );
}

export { ActiveKitchen as ActiveKitchenContainer };
