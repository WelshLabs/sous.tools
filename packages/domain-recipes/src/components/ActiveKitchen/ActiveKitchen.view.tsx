/* eslint-disable max-lines */
"use client";

import {
  ArrowLeft,
  Sun,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  X,
  Bell,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  type Recipe,
  type RecipeInstruction,
  type KitchenTimerState,
} from "@soustools/api-types";

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
      className="kitchen-touch flex min-h-screen w-full flex-col justify-between p-6"
      style={{
        backgroundColor: "var(--color-background)",
        color: "var(--color-foreground)",
      }}
    >
      <header
        className="flex items-center justify-between pb-4"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="flex min-h-[48px] cursor-pointer items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/5"
            style={{ color: "var(--color-muted-foreground)" }}
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-xl font-black tracking-wide uppercase">
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
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor: "rgb(16 185 129 / 0.15)",
                color: "#10b981",
                border: "1px solid rgb(16 185 129 / 0.30)",
              }}
            >
              <Sun className="h-3.5 w-3.5" /> Wake Lock Active
            </span>
          ) : (
            <span
              className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase"
              style={{
                backgroundColor: "var(--color-secondary)",
                color: "var(--color-muted-foreground)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Sun className="h-3.5 w-3.5 opacity-40" /> Wake Lock Offline
            </span>
          )}
        </div>
      </header>

      <main className="flex-1 space-y-6 py-8">
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
          className="bg-card fixed right-6 bottom-6 z-40 max-h-[400px] w-80 space-y-3 overflow-y-auto rounded-2xl p-4 shadow-2xl backdrop-blur-md"
          style={{
            border: "1px solid var(--color-border)",
            color: "var(--color-foreground)",
          }}
        >
          <h4
            className="flex items-center gap-1.5 pb-2 text-xs font-bold tracking-wider uppercase"
            style={{
              color: "var(--color-muted-foreground)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <Clock
              className="h-4 w-4 animate-pulse"
              style={{ color: "#10b981" }}
            />
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
      className={`flex min-h-[56px] cursor-pointer items-start gap-4 rounded-2xl border p-6 transition-all select-none`}
      style={{
        backgroundColor: isChecked
          ? "rgb(15 23 42 / 0.40)"
          : "var(--color-card)",
        borderColor: isChecked ? "transparent" : "var(--color-border)",
        opacity: isChecked ? 0.5 : 1,
      }}
      onClick={() => onToggleCheck(step.stepNumber)}
    >
      <button
        className="mt-1 flex min-h-[48px] min-w-[48px] items-center justify-center transition-colors focus:outline-none"
        style={{
          color: isChecked ? "#10b981" : "var(--color-muted-foreground)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleCheck(step.stepNumber);
        }}
      >
        <CheckCircle2
          className={`h-8 w-8 transition-all ${isChecked ? "fill-emerald-500/20" : "hover:scale-110"}`}
        />
      </button>

      <div className="flex-1 py-2">
        <span
          className="text-[10px] font-bold tracking-wider uppercase"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          Step {typeof step === "string" ? 1 : step.stepNumber || 1}
        </span>
        <p
          className={`mt-1 text-lg leading-relaxed font-medium ${isChecked ? "line-through" : ""}`}
          style={{ color: "var(--color-foreground)" }}
        >
          {typeof step === "string"
            ? step
            : step.text ||
              (typeof step === "object" && step && "instruction" in step
                ? String((step as Record<string, unknown>).instruction)
                : "")}
        </p>
      </div>

      {step.timerDurationSeconds && !isChecked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onStartTimer(step.stepNumber, step.timerDurationSeconds!);
          }}
          className="flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition-all"
          style={{
            backgroundColor: "rgb(16 185 129 / 0.15)",
            color: "#10b981",
            border: "1px solid rgb(16 185 129 / 0.30)",
          }}
        >
          <Play className="h-4 w-4 fill-current" />{" "}
          {Math.floor(step.timerDurationSeconds / 60)}m
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
    (totalElapsed / timer.durationSeconds) * 100,
  );

  return (
    <div
      className={`rounded-xl p-3 transition-all ${isDone ? "animate-pulse" : ""}`}
      style={{
        backgroundColor: isDone ? "rgb(244 63 94 / 0.10)" : "var(--color-card)",
        border: isDone
          ? "1px solid rgb(244 63 94 / 0.30)"
          : "1px solid var(--color-border)",
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className="text-xs font-bold"
          style={{ color: "var(--color-foreground)" }}
        >
          Step {timer.stepIndex} Timer
        </span>
        <button
          onClick={() => onRemove(idx)}
          className="cursor-pointer rounded p-1 transition-colors"
          style={{ color: "var(--color-muted-foreground)" }}
          aria-label="Remove timer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-1.5 flex items-center justify-between">
        <div className="flex items-baseline gap-1">
          <span
            className="font-mono text-2xl font-black tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            {minutes.toString().padStart(2, "0")}:
            {seconds.toString().padStart(2, "0")}
          </span>
          {isDone && (
            <Bell
              className="inline h-4 w-4 animate-bounce"
              style={{ color: "var(--color-destructive)" }}
            />
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onStartPause(idx)}
            className="cursor-pointer rounded-lg p-1.5 transition-colors"
            style={
              timer.isActive
                ? {
                    backgroundColor: "rgb(245 158 11 / 0.15)",
                    color: "#f59e0b",
                  }
                : {
                    backgroundColor: "rgb(16 185 129 / 0.15)",
                    color: "#10b981",
                  }
            }
            aria-label={timer.isActive ? "Pause timer" : "Start timer"}
          >
            {timer.isActive ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
          </button>
          <button
            onClick={() => onReset(idx)}
            className="cursor-pointer rounded-lg p-1.5 transition-colors"
            style={{
              backgroundColor: "var(--color-secondary)",
              color: "var(--color-muted-foreground)",
            }}
            aria-label="Reset timer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
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
