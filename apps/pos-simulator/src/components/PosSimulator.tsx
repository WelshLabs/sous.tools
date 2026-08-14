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
    <div className="mx-auto max-w-4xl space-y-4 rounded-2xl border border-zinc-900 bg-zinc-950 p-6 text-zinc-100">
      <header className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-100">
            <AlertTriangle className="h-5 w-5 text-amber-500" /> POS Simulator
            Panel
          </h2>
          <p className="text-xs text-zinc-400">
            Simulate Point of Sale menu webhook updates. Changes trigger instant
            socket push updates.
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="cursor-pointer rounded bg-zinc-900 p-1.5 text-zinc-300 hover:bg-zinc-800"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
