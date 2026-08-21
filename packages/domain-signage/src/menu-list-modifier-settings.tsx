/* eslint-disable max-lines */
"use client";
import React from "react";
import { type PosItem, type ItemModifierOverride } from "@soustools/api-types";
import { Layers, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface MenuListModifierSettingsProps {
  items: PosItem[];
  selectedItemIds: string[];
  itemModifiers: Record<string, ItemModifierOverride[]>;
  modifierLayout: "stacked" | "inline";
  onChangeLayout: (layout: "stacked" | "inline") => void;
  onChangeModifiers: (
    modifiers: Record<string, ItemModifierOverride[]>,
  ) => void;
}

export const MenuListModifierSettings: React.FC<
  MenuListModifierSettingsProps
> = ({
  items,
  selectedItemIds,
  itemModifiers,
  modifierLayout,
  onChangeLayout,
  onChangeModifiers,
}) => {
  const selectedItems = selectedItemIds
    .map((id) => items.find((i) => i.id === id || i.externalId === id))
    .filter((i): i is PosItem => Boolean(i));

  const handleAddOverride = (itemId: string) => {
    const current = itemModifiers[itemId] || [];
    const updated = {
      ...itemModifiers,
      [itemId]: [
        ...current,
        {
          text: "",
          price: "",
          displayNameOverride: "",
          modifierIds: [],
        },
      ],
    };
    onChangeModifiers(updated);
  };

  const handleUpdateOverride = (
    itemId: string,
    index: number,
    updates: Partial<ItemModifierOverride>,
  ) => {
    const current = [...(itemModifiers[itemId] || [])];
    current[index] = { ...current[index], ...updates };
    onChangeModifiers({ ...itemModifiers, [itemId]: current });
  };

  const handleDeleteOverride = (itemId: string, index: number) => {
    const current = [...(itemModifiers[itemId] || [])];
    current.splice(index, 1);
    const updated = { ...itemModifiers };
    if (current.length === 0) delete updated[itemId];
    else updated[itemId] = current;
    onChangeModifiers(updated);
  };

  const handleMoveOverride = (
    itemId: string,
    index: number,
    direction: "up" | "down",
  ) => {
    const current = [...(itemModifiers[itemId] || [])];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= current.length) return;
    const temp = current[index];
    current[index] = current[target];
    current[target] = temp;
    onChangeModifiers({ ...itemModifiers, [itemId]: current });
  };

  return (
    <div className="border-border mt-4 space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5 text-cyan-400" /> Modifier Notes &
          Overrides
        </label>
        <select
          value={modifierLayout || "stacked"}
          onChange={(e) =>
            onChangeLayout(e.target.value as "stacked" | "inline")
          }
          className="bg-card border-border text-muted-foreground rounded border px-2 py-1 text-[10px] focus:border-cyan-500 focus:outline-none"
        >
          <option value="stacked">Stacked List</option>
          <option value="inline">Inline (Side-by-Side)</option>
        </select>
      </div>

      <div className="space-y-4">
        {selectedItems.map((item) => {
          const overrides =
            itemModifiers[item.id] ||
            itemModifiers[item.externalId || ""] ||
            [];

          return (
            <div
              key={item.id}
              className="bg-background border-border space-y-3 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground text-xs font-semibold">
                    {item.name}
                  </span>
                  <span className="text-muted-foreground font-mono text-[10px]">
                    ${Number(item.price).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddOverride(item.id)}
                  className="flex items-center gap-1 rounded bg-cyan-900/30 px-2 py-1 text-[9px] font-bold text-cyan-400 uppercase transition-colors hover:bg-cyan-900/50"
                >
                  <Plus className="h-3 w-3" /> Add Note / Mod
                </button>
              </div>

              {overrides.length === 0 && (
                <div className="text-muted-foreground text-[10px] italic">
                  No modifier notes added yet. Click &quot;+ Add Note /
                  Mod&quot; to add custom modifiers like &quot;Add a scrambled
                  egg inside or an up egg on top... $2.00&quot;.
                </div>
              )}

              {overrides.map((override, idx) => (
                <div
                  key={idx}
                  className="bg-card/60 border-border space-y-2 rounded-lg border p-2.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-semibold text-cyan-400">
                      Modifier #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveOverride(item.id, idx, "up")}
                        className="text-muted-foreground rounded p-0.5 hover:text-cyan-400 disabled:opacity-30"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === overrides.length - 1}
                        onClick={() => handleMoveOverride(item.id, idx, "down")}
                        className="text-muted-foreground rounded p-0.5 hover:text-cyan-400 disabled:opacity-30"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOverride(item.id, idx)}
                        className="ml-1 rounded p-0.5 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2 space-y-1">
                      <label className="text-muted-foreground text-[9px] tracking-wider uppercase">
                        Modifier Text / Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Add scrambled egg inside or up egg on top..."
                        value={
                          override.text || override.displayNameOverride || ""
                        }
                        onChange={(e) =>
                          handleUpdateOverride(item.id, idx, {
                            text: e.target.value,
                            displayNameOverride: e.target.value,
                          })
                        }
                        className="bg-background border-border text-foreground w-full rounded border px-2 py-1 text-xs placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-muted-foreground text-[9px] tracking-wider uppercase">
                        Price (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. $2.00"
                        value={override.price || ""}
                        onChange={(e) =>
                          handleUpdateOverride(item.id, idx, {
                            price: e.target.value,
                          })
                        }
                        className="bg-background border-border w-full rounded border px-2 py-1 font-mono text-xs text-cyan-400 placeholder:text-zinc-600 focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {selectedItems.length === 0 && (
          <p className="text-muted-foreground text-xs italic">
            Select items above to configure modifiers.
          </p>
        )}
      </div>
    </div>
  );
};
