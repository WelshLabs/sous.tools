"use client";

import * as React from "react";
import { Search, X, Plus } from "lucide-react";

/** A suggestion item rendered in the autocomplete dropdown. */
export interface QuickAddSuggestion {
  id: string;
  name: string;
  /** Unit label shown as a pill on the right (e.g. "kg", "L"). */
  baseUnit: string;
}

export interface QuickAddBarProps {
  /** Current value of the search input. */
  value: string;
  /** Called on every keystroke — parent owns the query state. */
  onChange: (value: string) => void;
  /**
   * Filtered suggestion list to render below the input.
   * Filtering is the caller's responsibility (allows server-side search later).
   */
  suggestions: QuickAddSuggestion[];
  /**
   * Called when the user clicks a suggestion row.
   * The ingredient will be auto-assigned to a vendor via the
   * intelligent assignment stub before being added to the list.
   */
  onSelectSuggestion: (suggestion: QuickAddSuggestion) => void;
  /**
   * Called when the user submits free-text (Enter key or explicit add).
   * Receives the raw string the user typed — not required to match a suggestion.
   * The parent is responsible for creating a new item from this string.
   */
  onAddFreeText: (rawName: string) => void;
  /** Placeholder text for the input. */
  placeholder?: string;
}

/**
 * Quick-add procurement bar with autocomplete dropdown.
 *
 * Design notes:
 *  - The input is deliberately not restricted to the suggestion list.
 *    Users can type any arbitrary ingredient name and press Enter to add it.
 *  - `inferVendorForItem` is a **stub** for the AI vendor-assignment engine
 *    that will eventually auto-route new items to the preferred supplier
 *    based on historical order data, supplier categories, and pricing signals.
 *
 * @tenant-docs-export
 * The Quick-Add bar lets kitchen staff log needed items instantly.
 * Type a partial name to see suggestions from the ingredient catalogue,
 * or type any free-form text and press Enter to add it directly.
 */
export function QuickAddBar({
  value,
  onChange,
  suggestions,
  onSelectSuggestion,
  onAddFreeText,
  placeholder = "I noticed we are low on...",
}: QuickAddBarProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      e.preventDefault();
      // Exact match → treat as suggestion selection
      const match = suggestions.find(
        (s) => s.name.toLowerCase() === value.trim().toLowerCase(),
      );
      if (match) {
        onSelectSuggestion(match);
      } else {
        // Free-text path: stub intelligent assignment then surface to parent
        inferVendorForItem(value.trim());
        onAddFreeText(value.trim());
      }
    }
  };

  return (
    <div className="relative z-[100]">
      <div className="relative">
        <Search
          size={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={[
            "w-full h-16 pl-14 pr-14",
            "bg-card border border-border rounded-2xl shadow-xl",
            "font-bold text-lg uppercase tracking-tight",
            "text-foreground placeholder:text-muted-foreground",
            "outline-none focus:border-primary/50 transition-all",
            "dark:bg-zinc-900 dark:border-zinc-800",
            "dark:focus:border-primary/50",
          ].join(" ")}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Autocomplete dropdown */}
      {suggestions.length > 0 && (
        <div
          className={[
            "absolute top-[4.5rem] left-0 right-0 p-2",
            "bg-card border border-border shadow-2xl rounded-2xl overflow-hidden",
            "dark:bg-zinc-900 dark:border-zinc-800",
          ].join(" ")}
        >
          {suggestions.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectSuggestion(s)}
              className="flex flex-row items-center justify-between p-4 hover:bg-primary/10 rounded-xl cursor-pointer transition-colors group"
            >
              <div className="flex flex-row items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border group-hover:bg-primary/20 transition-colors dark:bg-zinc-800 dark:border-zinc-700">
                  <Plus
                    size={16}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </div>
                <span className="font-black uppercase tracking-tight text-foreground">
                  {s.name}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-3 py-1 rounded-full dark:bg-zinc-800">
                {s.baseUnit}
              </span>
            </div>
          ))}

          {/* Free-text add hint */}
          <div className="px-4 pt-1 pb-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Press Enter to add "{value}" directly
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Intelligent Vendor Assignment Stub ─────────────────────────────────────
 *
 * TODO: Replace this stub with a call to the AI vendor-assignment service once
 * the learning engine is operational.
 *
 * The engine will:
 *  1. Tokenize the ingredient name to extract category signals
 *     (e.g. "Wagyu Ribeye" → category:MEAT → preferred:Sysco)
 *  2. Cross-reference historical purchase_order_items for this org
 *  3. Score suppliers by price history, fill-rate, and delivery schedule fit
 *  4. Return the top-ranked supplierId (or null for manual assignment)
 *
 * @param ingredientName - Raw ingredient name from the quick-add input.
 * @returns The inferred supplierId, or null when confidence is too low.
 * ─────────────────────────────────────────────────────────────────────────── */
export function inferVendorForItem(
  ingredientName: string,
): string | null {
  // eslint-disable-next-line no-console
  console.info(
    `[VendorInference] Stub invoked for "${ingredientName}". ` +
    "Replace with AI assignment call when engine is ready.",
  );
  return null;
}
