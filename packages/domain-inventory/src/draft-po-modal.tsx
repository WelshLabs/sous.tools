"use client";

import React, { useState } from "react";
import { WhiteboardItem, Vendor } from "@soustools/api-types";
import { toast } from "sonner";

/**
 * Props structure for the DraftPoModal component.
 */
export interface DraftPoModalProps {
  /** Indicates if the modal is visible */
  isOpen: boolean;
  /** Callback function called to close the modal */
  onClose: () => void;
  /** Active whiteboard items available for purchase */
  items: WhiteboardItem[];
  /** Registered vendors list for vendor selection */
  vendors: Vendor[];
  /** Callback triggered to execute the PO creation */
  onCreatePO: (vendorId: string, selectedItemIds: string[]) => Promise<void>;
}

/**
 * DraftPoModal enables the user to select specific whiteboard items and
 * compile them into a draft Purchase Order for a selected vendor.
 */
export function DraftPoModal({ isOpen, onClose, items, vendors, onCreatePO }: DraftPoModalProps) {
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  /**
   * Toggles the selection state of a specific whiteboard item.
   * 
   * @param id The UUID of the whiteboard item.
   */
  const toggleSelection = (id: string) => {
    const next = new Set(selectedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedItems(next);
  };

  /**
   * Handles creating a draft Purchase Order and inserting selected items.
   */
  const createPO = async () => {
    if (!selectedVendor || selectedItems.size === 0) return;
    setIsSubmitting(true);

    try {
      await onCreatePO(selectedVendor, Array.from(selectedItems));
      setSelectedItems(new Set());
      onClose();
    } catch (err: any) {
      toast.error(`An unexpected error occurred: ${err.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="st-glass-panel border border-black/10 dark:border-white/10 p-8 max-w-2xl w-full rounded-xl">
        <h2 className="text-3xl font-bold mb-6 text-zinc-900 dark:text-white">Select Items for PO</h2>
        
        <div className="mb-6 space-y-2">
          <label className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Select Vendor</label>
          <select value={selectedVendor} onChange={e => setSelectedVendor(e.target.value)} className="w-full bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-md p-3 text-zinc-900 dark:text-white">
            <option value="">-- Choose Vendor --</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name} ({v.order_method})</option>)}
          </select>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2 border border-black/10 dark:border-white/10 p-4 rounded-md mb-6">
          {items.map(item => (
            <label key={item.id} className="flex items-center gap-4 cursor-pointer p-2 hover:bg-black/5 dark:bg-white/5 rounded">
              <input type="checkbox" checked={selectedItems.has(item.id)} onChange={() => toggleSelection(item.id)} className="w-5 h-5 border-black/20 dark:border-white/20" />
              <span className="text-lg text-zinc-900 dark:text-white">{item.raw_name}</span>
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-4">
          <button onClick={onClose} disabled={isSubmitting} className="px-6 py-2 rounded-md font-medium text-zinc-700 dark:text-zinc-300 hover:bg-black/10 dark:bg-white/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button 
            onClick={createPO}
            disabled={!selectedVendor || selectedItems.size === 0 || isSubmitting} 
            className="bg-zinc-900 dark:bg-white text-white dark:text-black px-6 py-2 rounded-md font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create PO"}
          </button>
        </div>
      </div>
    </div>
  );
}
