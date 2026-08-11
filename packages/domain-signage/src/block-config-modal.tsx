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

export function BlockConfigModal({ block: initialBlock, items, onClose, onSave }: BlockConfigModalProps): React.JSX.Element {
  const [activeBlock, setActiveBlock] = useState<SignageBlock>(
    initialBlock ?? ({ id: "block-" + Math.random().toString() } as SignageBlock),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-background border border-border rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/50">
          <div className="flex items-center gap-2">
            <GokujoKnifeIcon />
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-widest">
              {isNew ? "Assemble Component" : "Inspect Component"}
            </h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isNew && (
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Component Type</span>
              <div className="grid grid-cols-3 gap-2">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => handleTypeSelect(bt.type)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition ${
                      activeBlock.type === bt.type
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.15)]"
                        : "bg-card/50 border-border text-muted-foreground hover:border-white/15"
                    }`}
                  >
                    {bt.icon}
                    <span className="text-[10px] font-semibold">{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeBlock.type && (
            <div className="space-y-4 pt-2 border-t border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Configure Settings</span>
              <ContentConfigFields
                block={activeBlock}
                items={items}
                onChange={(updates) => setActiveBlock((prev) => ({ ...prev, ...updates } as SignageBlock))}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-card/30">
          <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer">Cancel</button>
          <button
            onClick={() => { if (activeBlock.type) { onSave(activeBlock); onClose(); } }}
            disabled={!activeBlock.type}
            className={`px-5 py-2 text-xs font-semibold rounded-xl transition shadow-[0_4px_12px_rgba(34,211,238,0.2)] ${activeBlock.type ? "text-foreground bg-cyan-400 hover:bg-cyan-300 cursor-pointer" : "text-muted-foreground bg-secondary cursor-not-allowed shadow-none"}`}
          >Apply Component</button>
        </div>
      </div>
    </div>
  );
}
