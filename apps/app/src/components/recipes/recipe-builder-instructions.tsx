"use client";

import React from "react";
import { Plus, Trash2, Clock } from "lucide-react";

interface RecipeBuilderInstructionsProps {
  steps: any[];
  onChange: (steps: any[]) => void;
}

export const RecipeBuilderInstructions: React.FC<RecipeBuilderInstructionsProps> = ({
  steps,
  onChange,
}) => {
  const handleAddStep = () => {
    onChange([
      ...steps,
      {
        stepNumber: steps.length + 1,
        text: "",
        timerDurationSeconds: null,
      },
    ]);
  };

  const handleRemoveStep = (idx: number) => {
    const filtered = steps.filter((_, i) => i !== idx);
    // Re-index step numbers
    onChange(filtered.map((step, i) => ({ ...step, stepNumber: i + 1 })));
  };

  const handleUpdateStep = (idx: number, fields: any) => {
    onChange(steps.map((step, i) => (i === idx ? { ...step, ...fields } : step)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-bold text-slate-300">Instructions & Timers</h4>
        <button type="button" onClick={handleAddStep} className="text-xs text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1 cursor-pointer">
          <Plus className="w-3.5 h-3.5" /> Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-xs text-slate-500 py-4 text-center border border-dashed border-slate-800 rounded-lg">
          No instruction steps added yet.
        </div>
      ) : (
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const minutesVal = step.timerDurationSeconds ? Math.floor(step.timerDurationSeconds / 60) : "";
            const secondsVal = step.timerDurationSeconds ? step.timerDurationSeconds % 60 : "";

            const handleTimerChange = (min: string, sec: string) => {
              const m = parseInt(min) || 0;
              const s = parseInt(sec) || 0;
              const totalSec = m * 60 + s;
              handleUpdateStep(idx, { timerDurationSeconds: totalSec > 0 ? totalSec : null });
            };

            return (
              <div key={idx} className="p-4 rounded-xl bg-zinc-900 border border-white/5 flex flex-col md:flex-row gap-3 items-start">
                <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 mt-1">
                  {step.stepNumber}
                </div>

                <div className="flex-1 w-full">
                  <textarea rows={2} value={step.text} onChange={(e) => handleUpdateStep(idx, { text: e.target.value })} placeholder="Describe the instruction details..." className="w-full bg-zinc-800 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs focus:border-sky-500 focus:outline-none text-slate-200 resize-none" required />
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <input type="number" min="0" value={minutesVal} onChange={(e) => handleTimerChange(e.target.value, secondsVal.toString())} placeholder="Min" className="w-14 bg-zinc-800 border border-white/5 rounded-lg px-2 py-1 text-center text-xs focus:border-sky-500 focus:outline-none text-slate-200" />
                    <span className="text-slate-400 text-xs">:</span>
                    <input type="number" min="0" max="59" value={secondsVal} onChange={(e) => handleTimerChange(minutesVal.toString(), e.target.value)} placeholder="Sec" className="w-14 bg-zinc-800 border border-white/5 rounded-lg px-2 py-1 text-center text-xs focus:border-sky-500 focus:outline-none text-slate-200" />
                  </div>
                  <span className="text-[10px] text-slate-500 text-center">(Optional step timer)</span>
                </div>

                <button type="button" onClick={() => handleRemoveStep(idx)} className="p-2 bg-red-950/10 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors cursor-pointer self-end md:self-auto">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
