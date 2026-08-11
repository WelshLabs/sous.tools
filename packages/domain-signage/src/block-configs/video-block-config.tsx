"use client";

import type { SignageBlock } from "@soustools/api-types";

export function VideoBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void }) {
  return (
<>
                {selectedBlock.type === "VideoBlock" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                      Video Source (MP4)
                    </label>
                    <input
                      type="text"
                      value={(selectedBlock as any).videoUrl || ""}
                      placeholder="https://..."
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          videoUrl: e.target.value,
                        } as any)
                      }
                      className="w-full bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
                    />
                  </div>
                )}

                {/* Timeline Block */}
  </>
  );
}
