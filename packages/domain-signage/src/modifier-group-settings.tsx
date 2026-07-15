"use client";
import * as React from "react";

import type { SignageBlock } from "@soustools/api-types";

interface ModifierGroupSettingsProps {
  posItemId: string;
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: Partial<SignageBlock>) => void;
  onFetchModifierGroups?: (posItemId: string) => Promise<Array<{ id: string; name: string }>>;
}

/** Organism: Modifier group radio selector for ModifierGroupBlock config. */
export function ModifierGroupSettings({
  posItemId,
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  onFetchModifierGroups,
}: ModifierGroupSettingsProps) {
  const [groups, setGroups] = React.useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (onFetchModifierGroups) {
          const data = await onFetchModifierGroups(posItemId);
          setGroups(data || []);
        }
      } catch (_err) { /* intentional silent fail */ }
      setLoading(false);
    }
    load();
  }, [posItemId, onFetchModifierGroups]);

  if (loading)
    return (
      <div className="text-xs text-muted-foreground italic p-2 bg-card rounded border border-border animate-pulse">
        Loading modifier groups...
      </div>
    );
  if (groups.length === 0)
    return (
      <div className="text-xs text-muted-foreground italic p-2 bg-card rounded border border-border">
        This item has no modifier groups configured.
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => {
        const isSelected = (selectedBlock as unknown as Record<string, any>).modifierGroupId === g.id;
        
        return (
          <label
            key={g.id}
            className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${isSelected ? "bg-cyan-900/30 border-cyan-500/50" : "bg-zinc-100 dark:bg-card border-black/5 dark:border-white/5 hover:border-cyan-500/30"}`}
          >
            <input
              type="radio"
              name="modifierGroupSelect"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked)
                  onUpdateBlock(selectedBlockId, { modifierGroupId: g.id } as Partial<SignageBlock>);
              }}
              className="w-4 h-4 text-cyan-500 bg-zinc-100 dark:bg-card border-black/10 dark:border-white/10"
            />
            <div className="flex flex-col">
              <span className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">{g.name}</span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
