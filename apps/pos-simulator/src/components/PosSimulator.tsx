"use client";

import React, { useState, useEffect } from "react";
import { type PosItem } from "@soustools/api-types";
import { RotateCw, AlertTriangle } from "lucide-react";
import { PosItemCard } from "./PosItemCard";
import { StockPromptModal } from "./StockPromptModal";
import { MOCK_POS_ITEMS, mapDbItemToPosItem, type RawDbPosItem } from "./helpers";

export const PosSimulator: React.FC = () => {
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [promptItem, setPromptItem] = useState<PosItem | null>(null);

  const fetchItems = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch("/api/pos/items");
      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          const mapped = (payload.data as RawDbPosItem[]).map(mapDbItemToPosItem);
          setItems(mapped);
          return;
        }
      }
      setItems(MOCK_POS_ITEMS);
    } catch {
      setItems(MOCK_POS_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const updateItemStatus = async (
    itemId: string,
    isSoldOut: boolean,
    quantity?: number,
    unlimited?: boolean
  ): Promise<void> => {
    setUpdatingId(itemId);
    try {
      const res = await fetch("/api/pos/simulate-webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isSoldOut, quantity, unlimited }),
      });
      if (res.ok) {
        const payload = await res.json().catch(() => ({}));
        if (payload.success) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === itemId ? { ...item, isSoldOut } : item
            )
          );
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleSoldOut = async (
    itemId: string,
    isSoldOut: boolean
  ): Promise<void> => {
    if (isSoldOut) {
      const item = items.find((i) => i.id === itemId);
      if (item) setPromptItem(item);
    } else {
      await updateItemStatus(itemId, true);
    }
  };

  const handleConfirmStock = async (
    quantity: number | undefined,
    unlimited: boolean
  ): Promise<void> => {
    if (!promptItem) return;
    const itemId = promptItem.id;
    setPromptItem(null);
    await updateItemStatus(itemId, false, quantity, unlimited);
  };

  return (
    <div className="space-y-4 bg-zinc-950 p-6 rounded-2xl border border-zinc-900 text-zinc-100 max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-3 border-b border-zinc-900">
        <div>
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> POS Simulator Panel
          </h2>
          <p className="text-xs text-zinc-400">
            Simulate Point of Sale menu webhook updates. Changes trigger instant socket push updates.
          </p>
        </div>
        <button
          onClick={fetchItems}
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
            onToggle={() => handleToggleSoldOut(item.id, item.isSoldOut)}
          />
        ))}
      </div>

      <StockPromptModal
        isOpen={!!promptItem}
        itemName={promptItem?.name || ""}
        onClose={() => setPromptItem(null)}
        onConfirm={handleConfirmStock}
      />
    </div>
  );
};

export default PosSimulator;
