"use client";
import React from "react";
import type { SignageBlock } from "@soustools/api-types";
import { Trash2 } from "lucide-react";

export function MediaCarouselBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void }) {
  return (
<>
                {selectedBlock.type === "MediaCarouselBlock" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Carousel Images
                    </label>
                    <div className="space-y-2">
                      {((selectedBlock as any).slides || []).map(
                        (slide: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <input
                              type="text"
                              value={slide.imageUrl || ""}
                              placeholder="https://..."
                              onChange={(e) => {
                                const newSlides = [
                                  ...((selectedBlock as any).slides || []),
                                ];
                                newSlides[idx].imageUrl = e.target.value;
                                onUpdateBlock(selectedBlockId, {
                                  slides: newSlides,
                                } as any);
                              }}
                              className="flex-1 bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                            />
                            <button
                              onClick={() => {
                                const newSlides = [
                                  ...((selectedBlock as any).slides || []),
                                ];
                                newSlides.splice(idx, 1);
                                onUpdateBlock(selectedBlockId, {
                                  slides: newSlides,
                                } as any);
                              }}
                              className="p-1.5 text-red-400 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ),
                      )}
                      <button
                        onClick={() => {
                          const newSlides = [
                            ...((selectedBlock as any).slides || []),
                            { type: "image", imageUrl: "" },
                          ];
                          onUpdateBlock(selectedBlockId, {
                            slides: newSlides,
                          } as any);
                        }}
                        className="w-full p-2 text-xs text-cyan-400 border border-dashed border-cyan-500/50 rounded hover:bg-cyan-500/10"
                      >
                        + Add Image
                      </button>
                    </div>
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mt-3">
                      Carousel Settings
                    </label>
                    <input
                      type="number"
                      value={(selectedBlock as any).slideDuration || 5000}
                      placeholder="Slide Duration (ms)"
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          slideDuration: Number(e.target.value),
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                    <select
                      value={(selectedBlock as any).objectFit || "cover"}
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          objectFit: e.target.value,
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="cover">Cover (Fill & Crop)</option>
                      <option value="contain">Contain (Show All)</option>
                      <option value="fill">Fill (Stretch)</option>
                    </select>
                  </div>
                )}

                {/* CalloutBlock */}
  </>
  );
}
