"use client";
import React from "react";
import type { SignageBlock } from "@soustools/api-types";

export function CalloutBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void, items?: PosItem[] }) {
  return (
<>
                {selectedBlock.type === "CalloutBlock" && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                      Callout Content
                    </label>
                    <input
                      type="text"
                      value={(selectedBlock as any).title || ""}
                      placeholder="Title"
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          title: e.target.value,
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                    <input
                      type="text"
                      value={(selectedBlock as any).message || ""}
                      placeholder="Message"
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          message: e.target.value,
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    />
                    <select
                      value={(selectedBlock as any).iconName || "Info"}
                      onChange={(e) =>
                        onUpdateBlock(selectedBlockId, {
                          iconName: e.target.value,
                        } as any)
                      }
                      className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="Info">Info</option>
                      <option value="AlertTriangle">Alert Triangle</option>
                      <option value="CheckCircle">Check Circle</option>
                      <option value="ChefHat">Chef Hat</option>
                      <option value="Star">Star</option>
                      <option value="Flame">Flame</option>
                      <option value="Utensils">Utensils</option>
                    </select>
                    <label className="flex items-center gap-3 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={(selectedBlock as any).accentBorder || false}
                        onChange={(e) =>
                          onUpdateBlock(selectedBlockId, {
                            accentBorder: e.target.checked,
                          } as any)
                        }
                        className="w-4 h-4 rounded border-black/10 dark:border-white/10 bg-white dark:bg-black text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                        Accent Border
                      </span>
                    </label>
                    <div className="pt-2 border-t border-black/5 dark:border-white/5 space-y-3">
                      <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                        Typography & Colors
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
                            Text Color
                          </label>
                          <input
                            type="color"
                            value={
                              (selectedBlock as any).textColor || "#ffffff"
                            }
                            onChange={(e) =>
                              onUpdateBlock(selectedBlockId, {
                                textColor: e.target.value,
                              } as any)
                            }
                            className="w-full h-8 bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
                            Font Size
                          </label>
                          <select
                            value={(selectedBlock as any).fontSize || ""}
                            onChange={(e) =>
                              onUpdateBlock(selectedBlockId, {
                                fontSize: e.target.value,
                              } as any)
                            }
                            className="w-full bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                          >
                            <option value="">Default</option>
                            <option value="12px">12px</option>
                            <option value="16px">16px</option>
                            <option value="24px">24px</option>
                            <option value="32px">32px</option>
                            <option value="48px">48px</option>
                            <option value="64px">64px</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase block mb-1">
                          Background Opacity
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={(selectedBlock as any).backgroundOpacity ?? 1}
                          onChange={(e) =>
                            onUpdateBlock(selectedBlockId, {
                              backgroundOpacity: Number(e.target.value),
                            } as any)
                          }
                          className="w-full accent-cyan-500"
                        />
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 text-right">
                          {Math.round(
                            ((selectedBlock as any).backgroundOpacity ?? 1) *
                              100,
                          )}
                          %
                        </div>
                      </div>
                    </div>
                  </div>
                )}

  </>
  );
}
