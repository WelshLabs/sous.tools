"use client";

import React, { useState } from "react";
import { Button } from "@soustools/design-system";
import { X } from "lucide-react";

interface StockPromptModalProps {
  isOpen: boolean;
  itemName: string;
  onClose: () => void;
  onConfirm: (quantity: number | undefined, unlimited: boolean) => void;
}

export const StockPromptModal: React.FC<StockPromptModalProps> = ({
  isOpen,
  itemName,
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(100);
  const [unlimited, setUnlimited] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(unlimited ? undefined : quantity, unlimited);
  };

  return (
    <div className="animate-fadeIn fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="border-zinc-850 relative w-full max-w-sm space-y-4 rounded-2xl border bg-zinc-900 p-6 text-zinc-100 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-zinc-500 hover:text-zinc-300"
        >
          <X className="h-5 w-5" />
        </button>
        <div>
          <h3 className="text-md font-bold text-zinc-100">Adjust Stock</h3>
          <p className="mt-1 text-xs text-zinc-400">
            Set stock options for {itemName}
          </p>
        </div>

        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="unlimited"
            checked={unlimited}
            onChange={(e) => setUnlimited(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-950 text-sky-500 focus:ring-sky-500"
          />
          <label
            htmlFor="unlimited"
            className="cursor-pointer text-xs text-zinc-300 select-none"
          >
            Unlimited Stock (Untracked on Square)
          </label>
        </div>

        {!unlimited && (
          <div className="space-y-1">
            <label className="block text-xs text-zinc-400">
              Stock Count Quantity
            </label>
            <input
              type="number"
              min={0}
              required
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(0, parseInt(e.target.value) || 0))
              }
              placeholder="e.g. 50, 100"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};
