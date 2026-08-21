"use client";

import type { SignageBlock, TimelineStep } from "@soustools/api-types";
import { Trash2, ChevronUp, ChevronDown, Plus, GitCommit } from "lucide-react";

export function TimelineBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
}) {
  if (selectedBlock.type !== "TimelineBlock") return null;

  const b = selectedBlock as any;
  const steps: TimelineStep[] = b.steps || [];

  const handleUpdateStep = (idx: number, updates: Partial<TimelineStep>) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], ...updates };
    onUpdateBlock(selectedBlockId, { steps: newSteps });
  };

  const handleDeleteStep = (idx: number) => {
    const newSteps = [...steps];
    newSteps.splice(idx, 1);
    onUpdateBlock(selectedBlockId, { steps: newSteps });
  };

  const handleMoveStep = (idx: number, direction: "up" | "down") => {
    const newSteps = [...steps];
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= newSteps.length) return;
    const temp = newSteps[idx];
    newSteps[idx] = newSteps[target];
    newSteps[target] = temp;
    onUpdateBlock(selectedBlockId, { steps: newSteps });
  };

  const handleAddStep = () => {
    const newSteps: TimelineStep[] = [
      ...steps,
      {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        text: `Step ${steps.length + 1}`,
        subtitle: "",
        badge: "",
        price: "",
      },
    ];
    onUpdateBlock(selectedBlockId, { steps: newSteps });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
            <GitCommit className="h-3.5 w-3.5 text-cyan-400" /> Timeline Steps (
            {steps.length})
          </label>
        </div>

        <div className="space-y-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="bg-card/70 border-border space-y-2 rounded-xl border p-2.5"
            >
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-950/80 font-mono text-[8px] font-bold text-cyan-400">
                    {idx + 1}
                  </span>
                  <span className="text-foreground max-w-[120px] truncate text-[10px] font-semibold">
                    {step.text || "Untitled Step"}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveStep(idx, "up")}
                    className="text-muted-foreground rounded p-0.5 hover:text-cyan-400 disabled:opacity-30"
                  >
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === steps.length - 1}
                    onClick={() => handleMoveStep(idx, "down")}
                    className="text-muted-foreground rounded p-0.5 hover:text-cyan-400 disabled:opacity-30"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteStep(idx)}
                    className="ml-1 rounded p-0.5 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <input
                  type="text"
                  placeholder="Step Title (e.g. Choose Your Protein)"
                  value={step.text}
                  onChange={(e) =>
                    handleUpdateStep(idx, { text: e.target.value })
                  }
                  className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs font-medium focus:border-cyan-500 focus:outline-none"
                />

                <input
                  type="text"
                  placeholder="Step Details / Options (e.g. Grilled Chicken, Steak, Tofu)"
                  value={step.subtitle || ""}
                  onChange={(e) =>
                    handleUpdateStep(idx, { subtitle: e.target.value })
                  }
                  className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-[10px] focus:border-cyan-500 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Badge (e.g. Required / Pick 1)"
                    value={step.badge || ""}
                    onChange={(e) =>
                      handleUpdateStep(idx, { badge: e.target.value })
                    }
                    className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-[10px] focus:border-cyan-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Price (e.g. Free / +$2.00)"
                    value={step.price || ""}
                    onChange={(e) =>
                      handleUpdateStep(idx, { price: e.target.value })
                    }
                    className="bg-background border-border w-full rounded border px-2 py-1 font-mono text-[10px] text-cyan-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddStep}
            className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-cyan-500/50 p-2 text-xs font-semibold text-cyan-400 transition-colors hover:bg-cyan-500/10"
          >
            <Plus className="h-3.5 w-3.5" /> Add Timeline Step
          </button>
        </div>
      </div>

      <div className="border-border space-y-2 border-t pt-3">
        <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
          Display Format
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Marker Style
            </label>
            <select
              value={b.markerType || "numbers"}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { markerType: e.target.value })
              }
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
            >
              <option value="numbers">Step Numbers (01, 02)</option>
              <option value="glowing-dots">Glowing Neon Dots</option>
              <option value="step-cards">Connected Cards</option>
              <option value="bullets">Bullets</option>
            </select>
          </div>
          <div>
            <label className="text-muted-foreground text-[9px] font-bold tracking-wider uppercase">
              Layout Direction
            </label>
            <select
              value={b.layout || "vertical"}
              onChange={(e) =>
                onUpdateBlock(selectedBlockId, { layout: e.target.value })
              }
              className="bg-card border-border text-foreground w-full rounded border px-2 py-1 text-xs focus:border-cyan-500 focus:outline-none"
            >
              <option value="vertical">Vertical Timeline</option>
              <option value="horizontal">Horizontal Steps</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
