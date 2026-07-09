"use client";
import React from "react";
import type { SignageBlock, PosItem } from "@soustools/api-types";
import { PosItemPicker } from "../pos-item-picker";

export function NestedItemBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock, items }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void, items: PosItem[] }) {
  return (
<>
                {selectedBlock.type === "NestedItemBlock" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                        Base POS Item
                      </label>
                      <PosItemPicker
                        items={items}
                        value={(selectedBlock as any).basePosItemId}
                        onChange={(id) =>
                          onUpdateBlock(selectedBlockId, {
                            basePosItemId: id,
                          } as any)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                        Base Description Override
                      </label>
                      <input
                        type="text"
                        value={
                          (selectedBlock as any).baseDescriptionOverride || ""
                        }
                        placeholder="Custom description..."
                        onChange={(e) =>
                          onUpdateBlock(selectedBlockId, {
                            baseDescriptionOverride: e.target.value,
                          } as any)
                        }
                        className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-2">
                        Child Upgrades (Multiselect)
                      </label>
                      <PosItemMultiPicker
                        items={items}
                        selectedIds={(
                          (selectedBlock as any).upgradeItems || []
                        ).map((u: any) => u.posItemId)}
                        onChange={(ids) => {
                          const current = ((selectedBlock as any)
                            .upgradeItems || []) as any[];
                          const newItems = ids.map((id) => {
                            const existing = current.find(
                              (c) => c.posItemId === id,
                            );
                            return existing ? existing : { posItemId: id };
                          });
                          onUpdateBlock(selectedBlockId, {
                            upgradeItems: newItems,
                          } as any);
                        }}
                        renderExtra={(item, isSelected) =>
                          isSelected ? (
                            <input
                              type="text"
                              placeholder="Upgrade description override..."
                              value={
                                (
                                  (selectedBlock as any).upgradeItems || []
                                ).find((u: any) => u.posItemId === item.id)
                                  ?.overrideDescription || ""
                              }
                              onChange={(e) => {
                                const current = [
                                  ...((selectedBlock as any).upgradeItems ||
                                    []),
                                ];
                                const idx = current.findIndex(
                                  (u: any) => u.posItemId === item.id,
                                );
                                if (idx !== -1) {
                                  current[idx] = {
                                    ...current[idx],
                                    overrideDescription: e.target.value,
                                  };
                                  onUpdateBlock(selectedBlockId, {
                                    upgradeItems: current,
                                  } as any);
                                }
                              }}
                              className="ml-6 mt-1 bg-zinc-50 dark:bg-zinc-950 border border-black/10 dark:border-white/10 rounded px-2 py-1 text-[10px] text-zinc-800 dark:text-zinc-200"
                            />
                          ) : null
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Media Carousel */}
  </>
  );
}
