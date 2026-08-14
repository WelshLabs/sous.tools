"use client";

import type { SignageBlock } from "@soustools/api-types";
import { Trash2 } from "lucide-react";

export function TimelineBlockConfig({
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
}: {
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: any) => void;
}) {
  return (
    <>
      {selectedBlock.type === "TimelineBlock" && (
        <div className="space-y-3">
          <label className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase">
            Timeline Steps
          </label>
          <div className="space-y-2">
            {((selectedBlock as any).steps || []).map(
              (step: any, idx: number) => (
                <div key={step.id} className="flex gap-2">
                  <div className="flex flex-1 flex-col gap-1">
                    <input
                      type="text"
                      value={step.text}
                      onChange={(e) => {
                        const newSteps = [
                          ...((selectedBlock as any).steps || []),
                        ];
                        newSteps[idx].text = e.target.value;
                        onUpdateBlock(selectedBlockId, {
                          steps: newSteps,
                        } as any);
                      }}
                      className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      value={step.subtitle || ""}
                      placeholder="Subtitle (Optional)"
                      onChange={(e) => {
                        const newSteps = [
                          ...((selectedBlock as any).steps || []),
                        ];
                        newSteps[idx].subtitle = e.target.value;
                        onUpdateBlock(selectedBlockId, {
                          steps: newSteps,
                        } as any);
                      }}
                      className="bg-background border-border text-muted-foreground w-full rounded-lg border px-2.5 py-1 text-[10px]"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newSteps = [
                        ...((selectedBlock as any).steps || []),
                      ];
                      newSteps.splice(idx, 1);
                      onUpdateBlock(selectedBlockId, {
                        steps: newSteps,
                      } as any);
                    }}
                    className="rounded border border-transparent p-1.5 text-red-400 hover:border-red-500/30 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ),
            )}
            <button
              onClick={() => {
                const newSteps = [
                  ...((selectedBlock as any).steps || []),
                  { id: `step-${Date.now()}`, text: "New Step" },
                ];
                onUpdateBlock(selectedBlockId, {
                  steps: newSteps,
                } as any);
              }}
              className="w-full rounded border border-dashed border-cyan-500/50 p-2 text-xs text-cyan-400 transition-colors hover:bg-cyan-500/10"
            >
              + Add Step
            </button>
          </div>
          <label className="text-muted-foreground mt-3 block text-[10px] font-bold tracking-widest uppercase">
            Marker Type
          </label>
          <select
            value={(selectedBlock as any).markerType || "bullets"}
            onChange={(e) =>
              onUpdateBlock(selectedBlockId, {
                markerType: e.target.value,
              } as any)
            }
            className="bg-card border-border text-foreground w-full rounded-lg border px-2.5 py-1.5 text-xs"
          >
            <option value="bullets">Bullets</option>
            <option value="numbers">Numbers</option>
          </select>
        </div>
      )}

      {/* NestedItemBlock */}
    </>
  );
}
