"use client";

import { useState } from "react";
import { type WhiteboardItem, type Vendor } from "@soustools/api-types";
import { toast } from "sonner";

export interface DraftPoModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: WhiteboardItem[];
  vendors: Vendor[];
  onCreatePO: (vendorId: string, selectedItemIds: string[]) => Promise<void>;
}

export function DraftPoModal({
  isOpen,
  onClose,
  items,
  vendors,
  onCreatePO,
}: DraftPoModalProps) {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  const createPO = async () => {
    if (!selectedVendor || selectedItems.size === 0) return;
    setIsSubmitting(true);
    try {
      await onCreatePO(selectedVendor, Array.from(selectedItems));
      setSelectedItems(new Set());
      onClose();
    } catch (err: unknown) {
      toast.error(
        `An unexpected error occurred: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm dark:bg-black/60">
      <div className="st-glass-panel dark:border-border w-full max-w-2xl rounded-xl border border-black/10 p-8">
        <h2 className="dark:text-foreground mb-6 text-3xl font-bold text-zinc-900">
          Select Items for PO
        </h2>
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            Select Vendor
          </label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            className="dark:border-border dark:text-foreground w-full rounded-md border border-black/10 bg-white p-3 text-zinc-900 dark:bg-black/40"
          >
            <option value="">-- Choose Vendor --</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.order_method})
              </option>
            ))}
          </select>
        </div>
        <div className="dark:border-border mb-6 max-h-64 space-y-2 overflow-y-auto rounded-md border border-black/10 p-4">
          {items.map((item) => (
            <label
              key={item.id}
              className="dark:bg-card flex cursor-pointer items-center gap-4 rounded p-2 hover:bg-black/5"
            >
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => toggleSelection(item.id)}
                className="h-5 w-5 border-black/20 dark:border-white/20"
              />
              <span className="dark:text-foreground text-lg text-zinc-900">
                {item.raw_name}
              </span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="dark:text-muted-foreground hover:bg-card rounded-md px-6 py-2 font-medium text-zinc-700 transition-colors disabled:opacity-50 dark:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={createPO}
            disabled={
              !selectedVendor || selectedItems.size === 0 || isSubmitting
            }
            className="bg-card text-foreground dark:text-foreground rounded-md px-6 py-2 font-medium transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:hover:bg-zinc-200"
          >
            {isSubmitting ? "Creating..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
}
