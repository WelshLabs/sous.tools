"use client";

import React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { WastageEntryForm } from "./WastageEntryForm";
import { type InventoryItem, type WastageReason } from "./types";

const UNIT_TO_G: Record<string, number> = {
  g: 1,
  oz: 28.35,
  lb: 453.59,
  kg: 1000,
};

/**
 * Props for the WastageEntryModal component.
 */
export interface WastageEntryModalProps {
  /** Whether the modal is open. */
  isOpen: boolean;
  /** Called when the modal should close. */
  onClose: () => void;
  /** An initially selected item to pre-fill the form, if any. */
  defaultItem?: InventoryItem | null;
  /**
   * Called to search for inventory items matching the query.
   * Debouncing is handled internally by the component.
   */
  onSearchItems: (query: string) => Promise<InventoryItem[]>;
  /**
   * Called when the user submits the wastage record.
   * Should return true on success to close the modal.
   */
  onSubmitWastage: (payload: {
    itemId: string;
    amountG: number;
    reason: WastageReason;
  }) => Promise<boolean>;
}

/**
 * WastageEntryModal — a modal for logging food waste events.
 *
 * Uses the Neon-Glass `--color-card` surface and semantic inputs.
 *
 * **Presentation boundary**: API calls are injected via `onSearchItems`
 * and `onSubmitWastage`.
 *
 * @tenant-docs-export
 * # WastageEntryModal
 * ```tsx
 * import { WastageEntryModal } from "@soustools/domain-recipes";
 *
 * <WastageEntryModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   defaultItem={prefetchedItem}
 *   onSearchItems={handleSearch}
 *   onSubmitWastage={handleSubmit}
 * />
 * ```
 */
export function WastageEntryModal({
  isOpen,
  onClose,
  defaultItem,
  onSearchItems,
  onSubmitWastage,
}: WastageEntryModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [amount, setAmount] = useState("");
  const [unit, setUnit] = useState("g");
  const [reason, setReason] = useState<WastageReason>("TRIM");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (defaultItem && isOpen) {
      setSelectedItem(defaultItem);
      setSearchQuery(defaultItem.name);
    }
  }, [defaultItem, isOpen]);

  useEffect(() => {
    if (!searchQuery || selectedItem?.name === searchQuery) {
      setItems([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const results = await onSearchItems(searchQuery);
        setItems(results.slice(0, 8));
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, selectedItem, onSearchItems]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!selectedItem || isNaN(num) || num <= 0) return;
    setSubmitting(true);
    try {
      const success = await onSubmitWastage({
        itemId: selectedItem.id,
        amountG: num * (UNIT_TO_G[unit] || 1),
        reason,
      });
      if (success) {
        onClose();
        setAmount("");
        setSelectedItem(null);
        setSearchQuery("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgb(0 0 0 / 0.60)" }}
    >
      <div
        className="relative w-96 max-w-full rounded-2xl p-6 shadow-2xl space-y-4"
        style={{
          backgroundColor: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 transition-colors cursor-pointer"
          style={{ color: "var(--color-muted-foreground)" }}
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">Record Wastage</h3>
        <WastageEntryForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          items={items}
          setItems={setItems}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          amount={amount}
          setAmount={setAmount}
          unit={unit}
          setUnit={setUnit}
          reason={reason}
          setReason={setReason}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
