import React from "react";
import { PosItem, ItemModifierOverride } from "@soustools/api-types";
import { Layers } from "lucide-react";

interface MenuListModifierSettingsProps {
  items: PosItem[];
  selectedItemIds: string[];
  itemModifiers: Record<string, ItemModifierOverride[]>;
  modifierLayout: "stacked" | "inline";
  onChangeLayout: (layout: "stacked" | "inline") => void;
  onChangeModifiers: (modifiers: Record<string, ItemModifierOverride[]>) => void;
}

export const MenuListModifierSettings: React.FC<MenuListModifierSettingsProps> = ({
  items,
  selectedItemIds,
  itemModifiers,
  modifierLayout,
  onChangeLayout,
  onChangeModifiers,
}) => {
  const selectedItems = items.filter(item => selectedItemIds.includes(item.id));

  const handleAddOverride = (itemId: string) => {
    const current = itemModifiers[itemId] || [];
    const updated = { ...itemModifiers, [itemId]: [...current, { modifierIds: [], displayNameOverride: "" }] };
    onChangeModifiers(updated);
  };

  const handleUpdateOverride = (itemId: string, index: number, updates: Partial<ItemModifierOverride>) => {
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

  return (
    <div className="space-y-4 pt-4 border-t border-white/5 mt-4">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" /> Modifier Overrides
        </label>
        <select
          value={modifierLayout || "stacked"}
          onChange={(e) => onChangeLayout(e.target.value as "stacked" | "inline")}
          className="bg-zinc-900 border border-white/10 rounded px-2 py-1 text-[10px] text-zinc-300"
        >
          <option value="stacked">Stacked List</option>
          <option value="inline">Inline (Side-by-Side)</option>
        </select>
      </div>

      <div className="space-y-4">
        {selectedItems.map((item) => {
          const overrides = itemModifiers[item.id] || [];
          // Note: In a real app we'd fetch the specific POS item's modifier groups to display checkboxes.
          // For now, we provide a generic comma-separated ID field for the user.
          
          return (
            <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200">{item.name}</span>
                <button
                  onClick={() => handleAddOverride(item.id)}
                  className="text-[9px] font-bold uppercase px-2 py-1 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 rounded"
                >
                  + Add Mod Override
                </button>
              </div>

              {overrides.map((override, idx) => (
                <div key={idx} className="space-y-2 bg-zinc-900/50 border border-white/5 rounded p-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400">Modifier Display Rule</label>
                    <button onClick={() => handleDeleteOverride(item.id, idx)} className="text-[10px] text-red-400 hover:text-red-300">Remove</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Modifier IDs (comma separated)"
                    value={override.modifierIds.join(",")}
                    onChange={(e) => handleUpdateOverride(item.id, idx, { modifierIds: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-zinc-300"
                  />
                  <input
                    type="text"
                    placeholder="Custom Display Name (e.g. '8oz Cup')"
                    value={override.displayNameOverride || ""}
                    onChange={(e) => handleUpdateOverride(item.id, idx, { displayNameOverride: e.target.value })}
                    className="w-full bg-zinc-950 border border-white/10 rounded px-2 py-1 text-xs text-cyan-400"
                  />
                </div>
              ))}
            </div>
          );
        })}
        {selectedItems.length === 0 && (
          <p className="text-xs text-zinc-500 italic">Select items above to configure modifiers.</p>
        )}
      </div>
    </div>
  );
};
