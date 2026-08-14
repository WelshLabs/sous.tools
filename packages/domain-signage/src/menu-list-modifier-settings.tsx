import { type PosItem, type ItemModifierOverride } from "@soustools/api-types";
import { Layers } from "lucide-react";

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
  const selectedItems = items.filter((item) =>
    selectedItemIds.includes(item.id),
  );

  const handleAddOverride = (itemId: string) => {
    const current = itemModifiers[itemId] || [];
    const updated = {
      ...itemModifiers,
      [itemId]: [...current, { modifierIds: [], displayNameOverride: "" }],
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

  return (
    <div className="border-border mt-4 space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <label className="text-muted-foreground flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
          <Layers className="h-3.5 w-3.5" /> Modifier Overrides
        </label>
        <select
          value={modifierLayout || "stacked"}
          onChange={(e) =>
            onChangeLayout(e.target.value as "stacked" | "inline")
          }
          className="bg-card border-border text-muted-foreground rounded border px-2 py-1 text-[10px]"
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
            <div
              key={item.id}
              className="bg-background border-border space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-foreground text-xs font-semibold">
                  {item.name}
                </span>
                <button
                  onClick={() => handleAddOverride(item.id)}
                  className="rounded bg-cyan-900/30 px-2 py-1 text-[9px] font-bold text-cyan-400 uppercase hover:bg-cyan-900/50"
                >
                  + Add Mod Override
                </button>
              </div>

              {overrides.map((override, idx) => (
                <div
                  key={idx}
                  className="bg-card/50 border-border space-y-2 rounded border p-2"
                >
                  <div className="flex items-center justify-between">
                    <label className="text-muted-foreground text-[10px]">
                      Modifier Display Rule
                    </label>
                    <button
                      onClick={() => handleDeleteOverride(item.id, idx)}
                      className="text-[10px] text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Modifier IDs (comma separated)"
                    value={override.modifierIds.join(",")}
                    onChange={(e) =>
                      handleUpdateOverride(item.id, idx, {
                        modifierIds: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="bg-background border-border text-muted-foreground w-full rounded border px-2 py-1 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Custom Display Name (e.g. '8oz Cup')"
                    value={override.displayNameOverride || ""}
                    onChange={(e) =>
                      handleUpdateOverride(item.id, idx, {
                        displayNameOverride: e.target.value,
                      })
                    }
                    className="bg-background border-border w-full rounded border px-2 py-1 text-xs text-cyan-400"
                  />
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
