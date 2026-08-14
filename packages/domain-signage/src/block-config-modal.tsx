"use client";

import React, { useState } from "react";
import { type SignageBlock, type PosItem } from "@soustools/api-types";
import { X } from "lucide-react";
import { ContentConfigFields } from "./content-config-fields";
import { GokujoKnifeIcon, BLOCK_TYPES } from "./block-config-data";

interface BlockConfigModalProps {
  block: SignageBlock | null;
  parentId?: string;
  items: PosItem[];
  onClose: () => void;
  onSave: (block: SignageBlock) => void;
}

export function BlockConfigModal({
  block: initialBlock,
  items,
  onClose,
  onSave,
}: BlockConfigModalProps): React.JSX.Element {
  const [activeBlock, setActiveBlock] = useState<SignageBlock>(
    initialBlock ??
      ({ id: "block-" + Math.random().toString() } as SignageBlock),
  );

  const handleTypeSelect = (type: string) => {
    const defaultData = { id: activeBlock.id, type } as SignageBlock;
    if (type === "GridBlock") {
      Object.assign(defaultData, { columns: 2, rows: 2, cells: [] });
    } else if (type === "ColumnBlock" || type === "RowBlock") {
      Object.assign(defaultData, { blocks: [] });
    } else if (type === "MediaCarouselBlock") {
      Object.assign(defaultData, { slides: [], style: "ken-burns" });
    }
    setActiveBlock(defaultData);
  };

  const isNew = !initialBlock;

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-background border-border flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-2xl transition-all">
        <div className="border-border bg-card/50 flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            <GokujoKnifeIcon />
            <h3 className="text-foreground text-sm font-semibold tracking-widest uppercase">
              {isNew ? "Assemble Component" : "Inspect Component"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {isNew && (
            <div className="space-y-3">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Select Component Type
              </span>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => handleTypeSelect(bt.type)}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition ${
                      activeBlock.type === bt.type
                        ? "border-cyan-400 bg-cyan-500/10 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                        : "bg-card/50 border-border text-muted-foreground hover:border-white/15"
                    }`}
                  >
                    {bt.icon}
                    <span className="text-[10px] font-semibold">
                      {bt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeBlock.type && (
            <div className="border-border space-y-4 border-t pt-2">
              <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
                Configure Settings
              </span>
              <ContentConfigFields
                block={activeBlock}
                items={items}
                onChange={(updates) =>
                  setActiveBlock(
                    (prev) => ({ ...prev, ...updates }) as SignageBlock,
                  )
                }
              />
            </div>
          )}
        </div>

        <div className="border-border bg-card/30 flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2 text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (activeBlock.type) {
                onSave(activeBlock);
                onClose();
              }
            }}
            disabled={!activeBlock.type}
            className={`rounded-xl px-5 py-2 text-xs font-semibold shadow-[0_4px_12px_rgba(34,211,238,0.2)] transition ${activeBlock.type ? "text-foreground cursor-pointer bg-cyan-400 hover:bg-cyan-300" : "text-muted-foreground bg-secondary cursor-not-allowed shadow-none"}`}
          >
            Apply Component
          </button>
        </div>
      </div>
    </div>
  );
}
