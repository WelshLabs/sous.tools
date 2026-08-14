"use client";
import * as React from "react";

import type { SignageBlock } from "@soustools/api-types";

interface ModifierGroupSettingsProps {
  posItemId: string;
  selectedBlock: SignageBlock;
  selectedBlockId: string;
  onUpdateBlock: (id: string, updates: Partial<SignageBlock>) => void;
  onFetchModifierGroups?: (
    posItemId: string,
  ) => Promise<Array<{ id: string; name: string }>>;
}

/** Organism: Modifier group radio selector for ModifierGroupBlock config. */
export function ModifierGroupSettings({
  posItemId,
  selectedBlock,
  selectedBlockId,
  onUpdateBlock,
  onFetchModifierGroups,
}: ModifierGroupSettingsProps) {
  const [groups, setGroups] = React.useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (onFetchModifierGroups) {
          const data = await onFetchModifierGroups(posItemId);
          setGroups(data || []);
        }
      } catch (_err) {
        /* intentional silent fail */
      }
      setLoading(false);
    }
    load();
  }, [posItemId, onFetchModifierGroups]);

  if (loading)
    return (
      <div className="text-muted-foreground bg-card border-border animate-pulse rounded border p-2 text-xs italic">
        Loading modifier groups...
      </div>
    );
  if (groups.length === 0)
    return (
      <div className="text-muted-foreground bg-card border-border rounded border p-2 text-xs italic">
        This item has no modifier groups configured.
      </div>
    );

  return (
    <div className="flex flex-col gap-2">
      {groups.map((g) => {
        const isSelected =
          (selectedBlock as unknown as Record<string, any>).modifierGroupId ===
          g.id;

        return (
          <label
            key={g.id}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors ${isSelected ? "border-cyan-500/50 bg-cyan-900/30" : "bg-card border-border hover:border-cyan-500/30"}`}
          >
            <input
              type="radio"
              name="modifierGroupSelect"
              checked={isSelected}
              onChange={(e) => {
                if (e.target.checked)
                  onUpdateBlock(selectedBlockId, {
                    modifierGroupId: g.id,
                  } as Partial<SignageBlock>);
              }}
              className="bg-card border-border h-4 w-4 text-cyan-500"
            />
            <div className="flex flex-col">
              <span className="text-foreground text-xs font-medium">
                {g.name}
              </span>
            </div>
          </label>
        );
      })}
    </div>
  );
}
