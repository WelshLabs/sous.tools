"use client";

import React from "react";
import { type PosItem } from "@soustools/api-types";
import { RotateCw, AlertTriangle } from "lucide-react";
import { PosItemCard } from "./PosItemCard";
import { StockPromptModal } from "./StockPromptModal";

export interface PosSimulatorProps {
  items: PosItem[];
  loading: boolean;
  updatingId: string | null;
  promptItem: PosItem | null;
  setPromptItem: (item: PosItem | null) => void;
  onRefresh: () => Promise<void> | void;
  onToggleSoldOut: (itemId: string, isSoldOut: boolean) => Promise<void> | void;
  onConfirmStock: (
    quantity: number | undefined,
    unlimited: boolean,
  ) => Promise<void> | void;
}

export const PosSimulator: React.FC<PosSimulatorProps> = ({
  items,
  loading,
  updatingId,
  promptItem,
  setPromptItem,
  onRefresh,
  onToggleSoldOut,
  onConfirmStock,
}) => {
  return (
    <div className="space-y-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 text-zinc-100 max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-3 border-b border-zinc-900">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> POS Simulator
            Panel
          </h2>
          <p className="text-xs text-zinc-400">
            Simulate Point of Sale menu webhook updates. Changes trigger instant
            socket push updates.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <PosItemCard
            key={item.id}
            item={item}
            isUpdating={updatingId === item.id}
            onToggle={() => onToggleSoldOut(item.id, item.isSoldOut)}
          />
        ))}
      </div>

      <StockPromptModal
        isOpen={!!promptItem}
        itemName={promptItem?.name || ""}
        onClose={() => setPromptItem(null)}
        onConfirm={onConfirmStock}
      />
    </div>
  );
};

export default PosSimulator;
