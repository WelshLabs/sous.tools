"use client";

import React, { useState, useEffect } from "react";
import { Recipe, KitchenTimerState } from "@soustools/api-types";
import { ArrowLeft, Play, Sun, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ActiveKitchenTimers } from "./active-kitchen-timers";


interface ActiveKitchenProps {
  recipeId: string;
}

export const ActiveKitchen: React.FC<ActiveKitchenProps> = ({ recipeId }) => {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [activeTimers, setActiveTimers] = useState<KitchenTimerState[]>([]);
  const [wakeLock, setWakeLock] = useState<any>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  useEffect(() => {
    fetch(`/api/recipes/${recipeId}`)
      .then((res) => res.json())
      .then((payload) => {
        if (payload.success) setRecipe(payload.data);
      })
      .finally(() => setLoading(false));

    const saved = localStorage.getItem(`timers_${recipeId}`);
    if (saved) {
      try {
        setActiveTimers(JSON.parse(saved));
      } catch (err) {
        console.error(err);
      }
    }
  }, [recipeId]);

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
      if (wakeLock) wakeLock.release().then(() => setWakeLock(null));
    };
  }, []);

  const handleUpdateTimers = (timers: KitchenTimerState[]) => {
    setActiveTimers(timers);
    localStorage.setItem(`timers_${recipeId}`, JSON.stringify(timers));
  };

  const handleStartStepTimer = (stepIndex: number, durationSeconds: number) => {
    const timerId = `${recipeId}-${stepIndex}`;
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
    handleUpdateTimers([...activeTimers, newTimer]);
  };

  const toggleStepCheck = (stepNumber: number) => {
    setCheckedSteps({ ...checkedSteps, [stepNumber]: !checkedSteps[stepNumber] });
  };

  if (loading) return <div className="text-center py-24 text-slate-400">Loading Active Kitchen Mode...</div>;
  if (!recipe) return <div className="text-center py-24 text-slate-400">Recipe not found.</div>;

  return (
    <div className="min-h-screen bg-black text-slate-100 p-6 flex flex-col justify-between w-full">
      <header className="flex justify-between items-center pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Link href={`/recipes/${recipeId}`} className="p-2 hover:bg-zinc-800 rounded-lg text-slate-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <div>
            <h2 className="text-xl font-black font-brand text-slate-100 uppercase tracking-wide">{recipe.title}</h2>
            <p className="text-xs text-slate-500 font-medium">Active Kitchen Mode — Large display optimized for touch.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {wakeLockActive ? (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-900/40 uppercase tracking-wider"><Sun className="w-3.5 h-3.5" /> Wake Lock Active</span>
          ) : (
            <span className="flex items-center gap-1 text-[10px] bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-full font-bold border border-zinc-700/40 uppercase tracking-wider"><Sun className="w-3.5 h-3.5 opacity-40" /> Wake Lock Offline</span>
          )}
        </div>

      </header>

      <main className="flex-1 py-8 space-y-6">
        {recipe.instructions.map((step) => {
          const isChecked = checkedSteps[step.stepNumber] || false;
          return (
            <div key={step.stepNumber} className={`p-6 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer select-none ${isChecked ? "bg-zinc-950/40 border-zinc-900 opacity-40" : "bg-zinc-900 border-white/5 hover:border-slate-800"}`} onClick={() => toggleStepCheck(step.stepNumber)}>
              <button className="mt-1 text-slate-500 focus:outline-none" onClick={(e) => { e.stopPropagation(); toggleStepCheck(step.stepNumber); }}>
                <CheckCircle2 className={`w-6 h-6 transition-all ${isChecked ? "text-emerald-500 fill-emerald-500/10" : "text-slate-600 hover:text-slate-400"}`} />
              </button>

              <div className="flex-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step {step.stepNumber}</span>
                <p className={`text-base font-medium mt-1 leading-relaxed text-slate-200 ${isChecked ? "line-through" : ""}`}>{step.text}</p>
              </div>

              {step.timerDurationSeconds && !isChecked && (
                <button type="button" onClick={(e) => { e.stopPropagation(); handleStartStepTimer(step.stepNumber, step.timerDurationSeconds!); }} className="px-3 py-2 bg-emerald-950/20 hover:bg-emerald-900/30 text-emerald-400 hover:text-emerald-300 border border-emerald-900/40 rounded-xl text-xs font-black flex items-center gap-1 transition-all cursor-pointer">
                  <Play className="w-3.5 h-3.5 fill-current" /> {Math.floor(step.timerDurationSeconds / 60)}m
                </button>
              )}
            </div>
          );
        })}
      </main>

      <ActiveKitchenTimers activeTimers={activeTimers} onUpdateTimers={handleUpdateTimers} />
    </div>
  );
};
