"use client";
import React from "react";
import type { SignageBlock } from "@soustools/api-types";
import { Trash2 } from "lucide-react";

export function TimelineBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void }) {
  return (
<>
                {selectedBlock.type === "TimelineBlock" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Timeline Steps
                    </label>
                    <div className="space-y-2">
                      {((selectedBlock as any).steps || []).map(
                        (step: any, idx: number) => (
                          <div key={step.id} className="flex gap-2">
                            <div className="flex-1 flex flex-col gap-1">
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
                                className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
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
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-zinc-700 dark:text-zinc-300"
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
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded border border-transparent hover:border-red-500/30"
                            >
                              <Trash2 className="w-3 h-3" />
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
                        className="w-full p-2 text-xs text-cyan-400 border border-dashed border-cyan-500/50 rounded hover:bg-cyan-500/10 transition-colors"
                      >
                        + Add Step
                      </button>
                    </div>
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mt-3">
                      Marker Type
                    </label>
                    <select
                      value={(selectedBlock as any).markerType || "bullets"}
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          markerType: e.target.value,
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
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
