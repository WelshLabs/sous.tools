"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { InventoryItem, WastageReason } from "./types";

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

  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 relative">
            <label className="text-xs font-medium" style={labelStyle}>
              Search Item
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedItem(null);
              }}
              placeholder="Type item name..."
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
              required
            />
            {items.length > 0 && (
              <div
                className="absolute top-full left-0 right-0 rounded-lg mt-1 z-50 max-h-48 overflow-y-auto shadow-xl"
                style={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedItem(item);
                      setSearchQuery(item.name);
                      setItems([]);
                    }}
                    className="w-full text-left px-3 py-2 text-sm transition-colors cursor-pointer"
                    style={{
                      color: "var(--color-foreground)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-secondary)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-medium" style={labelStyle}>
                Amount
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" style={labelStyle}>
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
                style={inputStyle}
              >
                <option value="g">grams (g)</option>
                <option value="oz">ounces (oz)</option>
                <option value="lb">pounds (lb)</option>
                <option value="kg">kilograms (kg)</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium" style={labelStyle}>
              Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as WastageReason)}
              className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
              style={inputStyle}
            >
              <option value="TRIM">Trim / Prep Waste</option>
              <option value="SPOILAGE">Spoilage</option>
              <option value="OVERPRODUCTION">Overproduction</option>
              <option value="SPILL">Spill / Dropped</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={submitting || !selectedItem}
            className="w-full text-sm font-semibold py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50 flex justify-center items-center gap-2"
            style={{
              backgroundColor: "var(--color-primary)",
              color: "var(--color-primary-foreground)",
            }}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Record Waste Event"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
