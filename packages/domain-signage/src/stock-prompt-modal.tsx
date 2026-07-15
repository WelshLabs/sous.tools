"use client";

import { useState } from "react";
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-zinc-100 dark:bg-card border border-zinc-850 p-6 rounded-2xl shadow-2xl relative space-y-4 text-zinc-900 dark:text-zinc-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        <div>
          <h3 className="text-md font-bold text-zinc-900 dark:text-zinc-100">
            Adjust Stock
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Set stock options for {itemName}
          </p>
        </div>

        <div className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            id="unlimited"
            checked={unlimited}
            onChange={(e) => setUnlimited(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sky-500 focus:ring-sky-500"
          />
          <label
            htmlFor="unlimited"
            className="text-xs text-zinc-300 cursor-pointer select-none"
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
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
            />
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};
