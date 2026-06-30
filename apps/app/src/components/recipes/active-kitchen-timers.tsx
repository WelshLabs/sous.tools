"use client";

import React, { useState, useEffect } from "react";
import { KitchenTimerState } from "@soustools/api-types";
import { Play, Pause, RotateCcw, Clock, X, Bell } from "lucide-react";

interface ActiveKitchenTimersProps {
  activeTimers: KitchenTimerState[];
  onUpdateTimers: (timers: KitchenTimerState[]) => void;
}

export const ActiveKitchenTimers: React.FC<ActiveKitchenTimersProps> = ({
  activeTimers,
  onUpdateTimers,
}) => {

  const [tickedTimers, setTickedTimers] = useState<KitchenTimerState[]>(activeTimers);

  // Sync state
  useEffect(() => {
    setTickedTimers(activeTimers);
  }, [activeTimers]);

  // Handle timer tick interval
  useEffect(() => {
    const interval = setInterval(() => {
      let changed = false;
      tickedTimers.forEach((timer) => {
        if (!timer.isActive || !timer.startedAt) return;
        
        const now = Date.now();
        const start = new Date(timer.startedAt).getTime();
        const deltaSec = Math.floor((now - start) / 1000);
        
        if (deltaSec > 0) {
          changed = true;
        }
      });

      if (changed) {
        // Force re-render to update tick display
        setTickedTimers([...tickedTimers]);
      }
    }, 250);

    return () => clearInterval(interval);
  }, [tickedTimers]);

  const handleStartPause = (idx: number) => {
    const timer = tickedTimers[idx];
    const updated = [...tickedTimers];
    
    if (timer.isActive) {
      // Pause
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
      // Start
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
    <div className="fixed bottom-6 right-6 z-40 w-80 bg-zinc-950/90 border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl p-4 backdrop-blur-md text-zinc-900 dark:text-slate-100 max-h-[400px] overflow-y-auto space-y-3">
      <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-800 pb-2">
        <Clock className="w-4 h-4 text-emerald-400 animate-pulse" /> Active Timers ({tickedTimers.length})
      </h4>

      <div className="space-y-3">
        {tickedTimers.map((timer, idx) => {
          // Calculate dynamic elapsed time
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
          const progressPercent = Math.min(100, (totalElapsed / timer.durationSeconds) * 100);

          return (
            <div key={timer.id} className={`p-3 rounded-xl border transition-all ${isDone ? "bg-red-950/20 border-red-800/40 animate-pulse" : "bg-zinc-100 dark:bg-zinc-900 border-black/5 dark:border-white/5"}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-300">Step {timer.stepIndex} Timer</span>
                <button onClick={() => handleRemove(idx)} className="p-1 hover:bg-black/5 dark:bg-white/5 rounded text-slate-500 hover:text-white transition-colors cursor-pointer"><X className="w-3.5 h-3.5" /></button>
              </div>

              <div className="flex items-center justify-between mt-1.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono tracking-tight text-zinc-900 dark:text-slate-100">
                    {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
                  </span>
                  {isDone && <Bell className="w-4 h-4 text-red-500 animate-bounce inline" />}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleStartPause(idx)} className={`p-1.5 rounded-lg text-slate-200 transition-colors cursor-pointer ${timer.isActive ? "bg-amber-600/20 hover:bg-amber-600/30 text-amber-400" : "bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400"}`}>
                    {timer.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleReset(idx)} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-3">
                <div className={`h-full transition-all duration-300 ${isDone ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
