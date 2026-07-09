"use client";

import { Play, Pause, RotateCcw, X, Bell } from "lucide-react";
import type { KitchenTimerState } from "@soustools/api-types";

export interface ActiveKitchenTimerRowProps {
  timer: KitchenTimerState;
  idx: number;
  onRemove: (idx: number) => void;
  onStartPause: (idx: number) => void;
  onReset: (idx: number) => void;
}

export function ActiveKitchenTimerRow({
  timer,
  idx,
  onRemove,
  onStartPause,
  onReset,
}: ActiveKitchenTimerRowProps) {
  let totalElapsed = timer.elapsedSeconds;
  if (timer.isActive && timer.startedAt) {
    const now = Date.now();
    const start = new Date(timer.startedAt).getTime();
    totalElapsed = timer.elapsedSeconds + Math.floor((now - start) / 1000);
  }

  const remaining = Math.max(0, timer.durationSeconds - totalElapsed);
  const isDone = remaining === 0;
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progressPercent = Math.min(
    100,
    (totalElapsed / timer.durationSeconds) * 100
  );

  return (
    <div
      className={`p-3 rounded-xl transition-all ${isDone ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: isDone ? "rgb(244 63 94 / 0.10)" : "var(--color-card)",
        border: isDone
          ? "1px solid rgb(244 63 94 / 0.30)"
          : "1px solid var(--color-border)",
      }}
    >
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold" style={{ color: "var(--color-foreground)" }}>
          Step {timer.stepIndex} Timer
        </span>
        <button
          onClick={() => onRemove(idx)}
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
            {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
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
            onClick={() => onStartPause(idx)}
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
            onClick={() => onReset(idx)}
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

      <div
        className="w-full h-1.5 rounded-full overflow-hidden mt-3"
        style={{ backgroundColor: "var(--color-secondary)" }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isDone ? "var(--color-destructive)" : "#10b981",
          }}
        />
      </div>
    </div>
  );
}
