/* eslint-disable max-lines */
"use client";

import { ArrowLeft, Sun, CheckCircle2, Play, Pause, RotateCcw, X, Bell, Clock } from "lucide-react";
import Link from "next/link";
import { type Recipe, type RecipeInstruction, type KitchenTimerState } from "@soustools/api-types";

export interface ActiveKitchenViewProps {
  recipe: Recipe;
  backHref: string;
  wakeLockActive: boolean;
  checkedSteps: Record<number, boolean>;
  onToggleStepCheck: (stepNumber: number) => void;
  onStartStepTimer: (stepNumber: number, duration: number) => void;
  tickedTimers: KitchenTimerState[];
  onStartPauseTimer: (idx: number) => void;
  onResetTimer: (idx: number) => void;
  onRemoveTimer: (idx: number) => void;
}

export function ActiveKitchenView({
  recipe,
  backHref,
  wakeLockActive,
  checkedSteps,
  onToggleStepCheck,
  onStartStepTimer,
  tickedTimers,
  onStartPauseTimer,
  onResetTimer,
  onRemoveTimer,
}: ActiveKitchenViewProps) {
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
            <ActiveKitchenStepView
              key={step.stepNumber}
              step={step}
              isChecked={isChecked}
              onToggleCheck={onToggleStepCheck}
              onStartTimer={onStartStepTimer}
            />
          );
        })}
      </main>

      {tickedTimers.length > 0 && (
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
              <ActiveKitchenTimerRowView
                key={timer.id}
                timer={timer}
                idx={idx}
                onRemove={onRemoveTimer}
                onStartPause={onStartPauseTimer}
                onReset={onResetTimer}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActiveKitchenStepView({
  step,
  isChecked,
  onToggleCheck,
  onStartTimer,
}: {
  step: RecipeInstruction;
  isChecked: boolean;
  onToggleCheck: (stepNumber: number) => void;
  onStartTimer: (stepNumber: number, duration: number) => void;
}) {
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

      {step.timerDurationSeconds && !isChecked && (
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

function ActiveKitchenTimerRowView({
  timer,
  idx,
  onRemove,
  onStartPause,
  onReset,
}: {
  timer: KitchenTimerState;
  idx: number;
  onRemove: (idx: number) => void;
  onStartPause: (idx: number) => void;
  onReset: (idx: number) => void;
}) {
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
