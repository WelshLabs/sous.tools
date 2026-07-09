"use client";

import type React from "react";
import { Loader2 } from "lucide-react";
import type { InventoryItem, WastageReason } from "./types";

export interface WastageEntryFormProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  items: InventoryItem[];
  setItems: (v: InventoryItem[]) => void;
  selectedItem: InventoryItem | null;
  setSelectedItem: (v: InventoryItem | null) => void;
  amount: string;
  setAmount: (v: string) => void;
  unit: string;
  setUnit: (v: string) => void;
  reason: WastageReason;
  setReason: (v: WastageReason) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function WastageEntryForm({
  searchQuery,
  setSearchQuery,
  items,
  setItems,
  selectedItem,
  setSelectedItem,
  amount,
  setAmount,
  unit,
  setUnit,
  reason,
  setReason,
  submitting,
  onSubmit,
}: WastageEntryFormProps) {
  const labelStyle: React.CSSProperties = {
    color: "var(--color-muted-foreground)",
  };

  const inputStyle: React.CSSProperties = {
    backgroundColor: "var(--color-input)",
    border: "1px solid var(--color-border)",
    color: "var(--color-foreground)",
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
  );
}
