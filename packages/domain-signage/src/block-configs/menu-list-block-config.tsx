"use client";

import { type SignageBlock, type PosItem } from "@soustools/api-types";
import { PosItemMultiPicker } from "../pos-item-picker";
import { MenuListModifierSettings } from "../menu-list-modifier-settings";

export function MenuListBlockConfig({ selectedBlock, selectedBlockId, onUpdateBlock, items = [] }: { selectedBlock: SignageBlock, selectedBlockId: string, onUpdateBlock: (id: string, updates: any) => void, items?: PosItem[] }) {

  return (
<>
      {/* MenuList Data Source */}
      {selectedBlock.type === "MenuListBlock" && (
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={
                          (selectedBlock as any).hideDescriptions || false
                        }
                        onChange={(e) =>
                          onUpdateBlock(selectedBlockId, {
                            hideDescriptions: e.target.checked,
                          } as any)
                        }
                        className="w-4 h-4 rounded border-border bg-background dark:bg-background text-cyan-500 focus:ring-cyan-500"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Hide Item Descriptions
                      </span>
                    </label>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-3">
                      Data Source (POS Items)
                    </label>
                    <PosItemMultiPicker
                      items={items}
                      selectedIds={selectedBlock.itemIds || []}
                      onChange={(ids) =>
                        onUpdateBlock(selectedBlockId, { itemIds: ids })
                      }
                      placeholder="Search items..."
                    />
                    <MenuListModifierSettings
                      items={items}
                      selectedItemIds={selectedBlock.itemIds || []}
                      itemModifiers={(selectedBlock as any).itemModifiers || {}}
                      modifierLayout={
                        (selectedBlock as any).modifierLayout || "stacked"
                      }
                      onChangeLayout={(layout) =>
                        onUpdateBlock(selectedBlockId, {
                          modifierLayout: layout,
                        } as any)
                      }
                      onChangeModifiers={(modifiers) =>
                        onUpdateBlock(selectedBlockId, {
                          itemModifiers: modifiers,
                        } as any)
                      }
                    />
                  </div>
                )}

                {/* Category Header */}
  </>
  );
}
