This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/.next/**, **/out/**, **/build/**, package-lock.json, yarn.lock, pnpm-lock.yaml, **/.git/**, **/*.png, **/*.jpg, **/*.jpeg, **/*.svg, **/*.ico
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
components/
  logos/
    index.ts
    Lettermark.tsx
    MicroIcon.tsx
    PrimaryLogo.tsx
  Button.test.tsx
  Button.tsx
  InsightsSidebar.tsx
  QuickAddBar.tsx
  SupplierOrderGroup.tsx
  TwoToneHeader.tsx
utils/
  scaling.test.ts
  scaling.ts
index.ts
theme.ts
```

# Files

## File: components/logos/index.ts
````typescript
export * from './Lettermark';
export * from './MicroIcon';
export * from './PrimaryLogo';
````

## File: components/logos/Lettermark.tsx
````typescript
import React from 'react';

export const Lettermark: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" {...props}>
    <g transform="translate(10, 10) scale(0.8)">
      <path d="M 25,72 C 5,72 5,45 25,35 C 20,10 50,5 50,25 C 50,5 80,10 75,35 C 95,45 95,72 75,72 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinejoin="round"/>
      <rect x="25" y="78" width="50" height="10" rx="3" fill="currentColor" />
    </g>
  </svg>
);
````

## File: components/logos/MicroIcon.tsx
````typescript
import React from 'react';

export const MicroIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%" {...props}>
    <path d="M 25,72 
             C 5,72 5,45 25,35 
             C 20,10 50,5 50,25 
             C 50,5 80,10 75,35 
             C 95,45 95,72 75,72 
             Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="8" 
          strokeLinejoin="round"/>
    
    <rect x="25" y="78" width="50" height="10" rx="3" fill="currentColor" />
  </svg>
);
````

## File: components/logos/PrimaryLogo.tsx
````typescript
import React from 'react';

export const PrimaryLogo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 100" width="100%" height="100%" {...props}>
    <g transform="translate(15, 15) scale(0.7)">
      <path d="M 25,72 C 5,72 5,45 25,35 C 20,10 50,5 50,25 C 50,5 80,10 75,35 C 95,45 95,72 75,72 Z" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinejoin="round"/>
      <rect x="25" y="78" width="50" height="10" rx="3" fill="currentColor" />
    </g>
    
    <text x="95" y="66" fill="currentColor">
      <tspan fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="46" letterSpacing="-2">sous</tspan><tspan fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" fontWeight="700" fontSize="42" letterSpacing="-1">.tools</tspan>
    </text>
  </svg>
);
````

## File: components/Button.test.tsx
````typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeDefined();
    expect(buttonElement.className).toContain("bg-primary");
  });

  it("renders with custom variant and size", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const buttonElement = screen.getByRole("button", { name: /delete/i });
    expect(buttonElement).toBeDefined();
    expect(buttonElement.className).toContain("bg-destructive");
    expect(buttonElement.className).toContain("px-6");
  });
});
````

## File: components/Button.tsx
````typescript
import * as React from "react";

/**
 * Properties for the Button component.
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual variant style of the button.
   * @default 'primary'
   */
  variant?: "primary" | "secondary" | "outline" | "destructive";
  /**
   * Scale size of the button, providing large touch targets for active kitchen use.
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

/**
 * A highly interactive, premium Button component designed for high-glare tablet screens.
 * Supports tactile scaling animation on click/press and custom variants.
 *
 * @tenant-docs-export
 * # Button Component Guide
 * The `Button` component is designed for tactile usage in active kitchen spaces.
 * It features large touch targets and scaling CSS animations to indicate active pressed states.
 *
 * ## Usage Example:
 * ```tsx
 * import { Button } from '@soustools/ui';
 *
 * <Button variant="primary" size="lg" onClick={() => alert('Order status updated!')}>
 *   Complete Order
 * </Button>
 * ```
 *
 * ## Props:
 * - `variant`: "primary" | "secondary" | "outline" | "destructive" (default: "primary")
 * - `size`: "sm" | "md" | "lg" (default: "md")
 * - Accepts all standard HTML button attributes.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-sans font-medium transition-all duration-150 rounded-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline:
        "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg font-semibold min-h-[48px]", // Ensuring large touch target
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
````

## File: components/InsightsSidebar.tsx
````typescript
import * as React from "react";
import { Clock, Zap, Plus } from "lucide-react";
import type { OrderSupplier } from "./SupplierOrderGroup";

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getNextDelivery(deliveryDays: number[]): string {
  if (!deliveryDays.length) return "No schedule";
  const today = new Date().getDay();
  const sorted = [...deliveryDays].sort((a, b) => a - b);
  const next = sorted.find((d) => d > today) ?? sorted[0];
  const daysUntil = next > today ? next - today : 7 - today + next;
  const date = new Date();
  date.setDate(date.getDate() + daysUntil);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ─── InsightsSidebar ─────────────────────────────────────────────────────── */

export interface InsightsSidebarProps {
  /** List of suppliers to render in the schedule section. */
  suppliers: OrderSupplier[];
  /** Called when the user clicks the "Add Vendor" CTA. */
  onAddVendor?: () => void;
}

/**
 * Sticky sidebar for the Order Manager page.
 *
 * Contains two cards:
 *  1. **Insights** — cutoff reminders + per-supplier next-delivery schedule
 *  2. **New Supplier CTA** — solid cyan card with an "Add Vendor" action
 *
 * Uses semantic CSS tokens so it responds correctly to light/dark mode.
 */
export function InsightsSidebar({
  suppliers,
  onAddVendor,
}: InsightsSidebarProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* ── Insights Card ─────────────────────────────────────────────── */}
      <div className="p-6 bg-card dark:bg-zinc-900/60 border border-border dark:border-zinc-800 rounded-3xl shadow-2xl">
        <p className="text-foreground font-black uppercase text-xs tracking-[0.2em] mb-6 flex flex-row items-center gap-2">
          <Zap size={13} className="text-amber-500" fill="currentColor" />
          Insights
        </p>

        <div className="flex flex-col gap-6">
          {/* Cutoff Reminders */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
              Cutoff Reminders
            </p>
            <div className="p-4 bg-muted/40 dark:bg-zinc-800/40 border border-border dark:border-zinc-700 border-dashed rounded-2xl flex flex-col items-center justify-center">
              <Clock
                size={22}
                className="text-muted-foreground/30 dark:text-zinc-700 mb-2"
              />
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest text-center">
                No orders reaching cutoff in next 4h
              </p>
            </div>
          </div>

          {/* Supplier Schedule */}
          {suppliers.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase text-muted-foreground leading-tight">
                Supplier Schedule
              </p>
              <div className="flex flex-col gap-2">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-row items-center justify-between p-3 bg-muted/30 dark:bg-zinc-800/30 border border-border/40 dark:border-zinc-700/40 rounded-xl"
                  >
                    <span className="text-[9px] font-black uppercase text-foreground/70 truncate pr-2">
                      {s.name}
                    </span>
                    <span className="text-[8px] font-black uppercase text-primary shrink-0">
                      {getNextDelivery(s.deliveryDays)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── New Supplier CTA Card ──────────────────────────────────────── */}
      <div className="p-6 bg-primary border border-primary/80 rounded-3xl shadow-2xl shadow-primary/20">
        <div className="flex flex-row items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Plus size={15} className="text-white" />
          </div>
          <span className="text-white font-black uppercase text-[10px] tracking-widest">
            New Supplier
          </span>
        </div>
        <p className="text-white/80 text-xs mb-6 font-medium leading-relaxed">
          Expand your network to optimize pricing and availability.
        </p>
        <button
          onClick={onAddVendor}
          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl h-10 font-black uppercase text-[10px] tracking-widest transition-colors"
        >
          Add Vendor
        </button>
      </div>
    </div>
  );
}
````

## File: components/QuickAddBar.tsx
````typescript
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
````

## File: components/SupplierOrderGroup.tsx
````typescript
"use client";

import * as React from "react";
import {
  Truck,
  Calendar,
  Package,
  Check,
  Trash2,
  Zap,
  Loader2,
  ShoppingBag,
} from "lucide-react";

/* ─── Shared Types ────────────────────────────────────────────────────────── */

/** Minimal supplier shape required by these components. */
export interface OrderSupplier {
  id: string;
  name: string;
  /** Day-of-week indices (0=Sun … 6=Sat). */
  deliveryDays: number[];
  cutoffTime: string;
}

/** A single item on the living order list. */
export interface OrderLineItem {
  id: string;
  rawName: string;
  quantity: number;
  unit: string;
  /** Whether the item was added by a system/AI suggestion. */
  isSystemSuggestion: boolean;
  supplier: OrderSupplier | null;
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getNextDelivery(deliveryDays: number[]): string {
  if (!deliveryDays.length) return "No schedule";
  const today = new Date().getDay();
  const sorted = [...deliveryDays].sort((a, b) => a - b);
  const next = sorted.find((d) => d > today) ?? sorted[0];
  const daysUntil = next > today ? next - today : 7 - today + next;
  const date = new Date();
  date.setDate(date.getDate() + daysUntil);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ─── OrderItemRow ────────────────────────────────────────────────────────── */

export interface OrderItemRowProps {
  item: OrderLineItem;
  suppliers: OrderSupplier[];
  onRemove: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
  onChangeSupplier: (id: string, supplierId: string | null) => void;
}

/**
 * A single row in a supplier's order group.
 * Renders item name, AI-suggestion badge, editable quantity, supplier reassign
 * dropdown, and a hover-reveal remove button.
 */
export function OrderItemRow({
  item,
  suppliers,
  onRemove,
  onChangeQty,
  onChangeSupplier,
}: OrderItemRowProps) {
  const [qty, setQty] = React.useState(String(item.quantity));

  const commitQty = () => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) onChangeQty(item.id, parsed);
    else setQty(String(item.quantity));
  };

  return (
    <div className="p-4 bg-white dark:bg-zinc-900/60 border border-border dark:border-zinc-800 hover:border-primary/30 transition-all flex flex-row items-center justify-between rounded-2xl group/item">
      {/* Left: icon + name */}
      <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-muted dark:bg-zinc-800/60 flex items-center justify-center border border-border dark:border-zinc-700 group-hover/item:bg-primary/5 transition-colors shrink-0">
          <Package
            size={16}
            className="text-muted-foreground group-hover/item:text-primary transition-colors"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black uppercase text-sm tracking-tight text-foreground truncate">
            {item.rawName}
          </p>
          {item.isSystemSuggestion && (
            <div className="inline-flex flex-row items-center gap-1 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 mt-0.5">
              <Zap size={7} fill="currentColor" />
              <span className="text-[7px] font-black uppercase tracking-widest">
                AI Suggested
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: qty + supplier + remove */}
      <div className="flex flex-row items-center gap-3 shrink-0">
        {/* Quantity */}
        <div className="flex flex-row items-center gap-1 bg-muted dark:bg-zinc-800/60 p-1 rounded-xl border border-border dark:border-zinc-700/60">
          <input
            type="number"
            value={qty}
            min={0}
            step={0.5}
            onChange={(e) => setQty(e.target.value)}
            onBlur={commitQty}
            className="w-12 bg-transparent text-center font-black text-sm outline-none text-foreground"
          />
          <span className="text-[10px] font-black uppercase text-muted-foreground pr-3 border-l border-border dark:border-zinc-700/60 pl-2">
            {item.unit}
          </span>
        </div>

        {/* Supplier reassign */}
        <select
          value={item.supplier?.id ?? ""}
          onChange={(e) =>
            onChangeSupplier(item.id, e.target.value || null)
          }
          className="bg-muted dark:bg-zinc-800/60 border border-border dark:border-zinc-700 rounded-xl px-3 h-10 text-[10px] font-black uppercase appearance-none text-foreground min-w-[130px] outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">Move to...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Remove */}
        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.rawName}`}
          className="h-10 w-10 p-0 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex items-center justify-center"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

/* ─── SupplierOrderGroup ──────────────────────────────────────────────────── */

export interface SupplierOrderGroupProps {
  /** null means the "Unassigned Items" group. */
  supplier: OrderSupplier | null;
  items: OrderLineItem[];
  allSuppliers: OrderSupplier[];
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  onRemoveItem: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
  onChangeSupplier: (id: string, supplierId: string | null) => void;
}

/**
 * One supplier section of the living order list.
 *
 * Renders:
 *  - Supplier header with truck icon, name, next delivery date, cutoff time
 *  - "Place Order (N)" CTA button for assigned groups
 *  - List of `OrderItemRow` children
 *  - Spinner overlay while order is being placed
 */
export function SupplierOrderGroup({
  supplier,
  items,
  allSuppliers,
  isPlacingOrder,
  onPlaceOrder,
  onRemoveItem,
  onChangeQty,
  onChangeSupplier,
}: SupplierOrderGroupProps) {
  const isUnassigned = !supplier;

  return (
    <div className="flex flex-col gap-6">
      {/* Group header */}
      <div className="flex flex-row items-center justify-between px-2">
        <div className="flex flex-row items-center gap-4">
          <div
            className={[
              "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0",
              isUnassigned
                ? "bg-muted dark:bg-zinc-800/40 border-border dark:border-zinc-700"
                : "bg-sky-500/10 border-sky-500/20 shadow-[0_0_20px_rgba(14,165,233,0.1)]",
            ].join(" ")}
          >
            <Truck
              size={22}
              className={
                isUnassigned
                  ? "text-muted-foreground"
                  : "text-sky-500 dark:text-sky-400"
              }
            />
          </div>
          <div>
            <p className="font-black uppercase text-xl tracking-tighter text-foreground">
              {isUnassigned ? "Unassigned Items" : supplier.name}
            </p>
            {!isUnassigned && (
              <div className="flex flex-row items-center gap-3 mt-0.5">
                <div className="flex flex-row items-center gap-1.5 text-primary">
                  <Calendar size={11} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Next: {getNextDelivery(supplier.deliveryDays)}
                  </span>
                </div>
                <span className="text-muted-foreground/40 text-[10px]">•</span>
                <div className="flex flex-row items-center gap-1.5 text-muted-foreground">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Cutoff: {supplier.cutoffTime}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {!isUnassigned && (
          <button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 h-12 px-8 rounded-2xl shadow-xl shadow-primary/20 flex items-center gap-3 group transition-colors"
          >
            <Check
              size={16}
              className="text-primary-foreground group-hover:scale-110 transition-transform"
            />
            <span className="text-primary-foreground font-black uppercase text-xs tracking-widest">
              Place Order ({items.length})
            </span>
          </button>
        )}
      </div>

      {/* Items */}
      {isPlacingOrder ? (
        <div className="flex items-center justify-center py-10 text-primary gap-3">
          <Loader2 size={26} className="animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest">
            Placing Order…
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <OrderItemRow
              key={item.id}
              item={item}
              suppliers={allSuppliers}
              onRemove={onRemoveItem}
              onChangeQty={onChangeQty}
              onChangeSupplier={onChangeSupplier}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── EmptyOrderList ──────────────────────────────────────────────────────── */

/** Shown when there are no items in the living list. */
export function EmptyOrderList() {
  return (
    <div className="p-20 bg-muted/40 dark:bg-zinc-900/40 border border-border dark:border-zinc-800 border-dashed flex flex-col items-center justify-center rounded-[2.5rem]">
      <div className="w-24 h-24 rounded-full bg-muted dark:bg-zinc-800/40 flex items-center justify-center mb-6">
        <ShoppingBag
          size={48}
          className="text-muted-foreground/30 dark:text-zinc-700"
        />
      </div>
      <p className="text-muted-foreground font-black uppercase text-xs tracking-widest mb-2">
        Everything looks good
      </p>
      <p className="text-muted-foreground/60 text-sm max-w-xs text-center">
        Your living order list is empty. Add items as you notice they are low,
        or wait for system suggestions.
      </p>
    </div>
  );
}
````

## File: components/TwoToneHeader.tsx
````typescript
import * as React from "react";

/**
 * Props for the TwoToneHeader component.
 */
export interface TwoToneHeaderProps {
  /**
   * The full heading string. The first word is rendered in the default
   * foreground color; all remaining words are rendered in `text-primary`
   * (the brand cyan). Example: "Order Manager" → "Order" + " Manager".
   */
  title: string;
  /**
   * Optional breadcrumb line rendered above the heading.
   * Renders in muted-foreground at tiny tracking-widest caps.
   */
  breadcrumb?: string;
  /** Optional additional className applied to the outer wrapper. */
  className?: string;
}

/**
 * A reusable page-level heading that renders the first word of the title in
 * the default text color and all remaining words in the brand cyan (`text-primary`).
 *
 * Designed for the glass-frosted v2 aesthetic where headings use tight italic
 * uppercase tracking with a cyan accent split.
 *
 * @tenant-docs-export
 * # TwoToneHeader
 * Use this component for all primary page headings to maintain the
 * "Order **Manager**" / "Active **Orders**" visual brand pattern.
 *
 * ```tsx
 * import { TwoToneHeader } from "@soustools/ui";
 *
 * <TwoToneHeader breadcrumb="Procurement / Living Order List" title="Order Manager" />
 * ```
 */
export function TwoToneHeader({
  title,
  breadcrumb,
  className = "",
}: TwoToneHeaderProps) {
  const spaceIdx = title.indexOf(" ");
  const firstWord = spaceIdx === -1 ? title : title.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? "" : title.slice(spaceIdx); // includes leading space

  return (
    <div className={className}>
      {breadcrumb && (
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] mb-2">
          {breadcrumb}
        </p>
      )}
      <h1 className="text-4xl font-black uppercase tracking-tighter">
        <span className="text-foreground">{firstWord}</span>
        {rest && <span className="text-primary">{rest}</span>}
      </h1>
    </div>
  );
}
````

## File: utils/scaling.test.ts
````typescript
import { describe, it, expect } from "vitest";
import { convertUnit, calculateRecipeScale } from "./scaling";
import { RecipeIngredient } from "@soustools/api-types";

describe("convertUnit", () => {
  it("converts within the same unit", () => {
    expect(convertUnit(10, "g", "g")).toBe(10);
    expect(convertUnit(500, "ml", "ml")).toBe(500);
  });

  it("converts weight to weight", () => {
    expect(convertUnit(1.5, "kg", "g")).toBe(1500);
    expect(convertUnit(16, "oz", "lb")).toBeCloseTo(1.0, 4);
    expect(convertUnit(1, "lb", "g")).toBeCloseTo(453.592, 2);
  });

  it("converts volume to volume", () => {
    expect(convertUnit(1, "l", "ml")).toBe(1000);
    expect(convertUnit(3, "tsp", "tbsp")).toBeCloseTo(1.0, 4);
    expect(convertUnit(1, "cup", "ml")).toBeCloseTo(236.588, 2);
  });

  it("converts volume to weight using density", () => {
    // Water (density = 1.0): 1 cup of water = 236.588 ml = 236.588 g
    expect(convertUnit(1, "cup", "g", 1.0)).toBeCloseTo(236.588, 2);

    // Honey (density = 1.4): 100ml honey = 140g
    expect(convertUnit(100, "ml", "g", 1.4)).toBe(140);
  });

  it("converts weight to volume using density", () => {
    // Olive Oil (density = 0.92): 92g olive oil = 100ml
    expect(convertUnit(92, "g", "ml", 0.92)).toBeCloseTo(100, 2);
  });

  it("safely returns amount for count and percentage units", () => {
    expect(convertUnit(12, "count", "count")).toBe(12);
    expect(convertUnit(65, "%", "%")).toBe(65);
    expect(convertUnit(5, "count", "g")).toBe(5);
  });
});

describe("calculateRecipeScale", () => {
  const dummyIngredients: RecipeIngredient[] = [
    {
      id: "ing-1",
      recipeId: "rec-1",
      masterIngredientId: "flour-id",
      calculationType: "fixed_weight",
      baseCalculationGroup: true,
      amount: 500,
      unit: "g",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "flour-id",
        organizationId: "org-1",
        name: "Bread Flour",
        densityGMl: 0.57,
        nutritionMacros: { calories: 364, proteinG: 12, carbsG: 76, fatG: 1.5 },
        allergens: ["wheat"],
        createdAt: "",
        updatedAt: "",
      },
    },
    {
      id: "ing-2",
      recipeId: "rec-1",
      masterIngredientId: "water-id",
      calculationType: "bakers_percentage",
      baseCalculationGroup: false,
      amount: 60, // 60% hydration
      unit: "%",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "water-id",
        organizationId: "org-1",
        name: "Water",
        densityGMl: 1.0,
        nutritionMacros: { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 },
        allergens: [],
        createdAt: "",
        updatedAt: "",
      },
    },
    {
      id: "ing-3",
      recipeId: "rec-1",
      masterIngredientId: "butter-id",
      calculationType: "fixed_weight",
      baseCalculationGroup: false,
      amount: 50,
      unit: "g",
      prepNotes: null,
      createdAt: "",
      masterIngredient: {
        id: "butter-id",
        organizationId: "org-1",
        name: "Butter",
        densityGMl: 0.96,
        nutritionMacros: { calories: 717, proteinG: 1, carbsG: 0, fatG: 81 },
        allergens: ["dairy"],
        createdAt: "",
        updatedAt: "",
      },
    },
  ];

  it("scales recipe linearly by portion yield", () => {
    // Scaling from 10 portions to 20 portions (multiplier = 2.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetYield: 20,
    });

    expect(multiplier).toBe(2.0);

    // Flour (base group): 500g * 2 = 1000g
    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1000);
    expect(flourResult?.weightInGrams).toBe(1000);

    // Water (bakers_percentage, 60% of flour): 1000g flour * 0.60 = 600g water
    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(600);
    expect(waterResult?.scaledUnit).toBe("g");
    expect(waterResult?.weightInGrams).toBe(600);

    // Butter (fixed_weight): 50g * 2 = 100g
    const butterResult = items.find((i) => i.ingredientId === "ing-3");
    expect(butterResult?.scaledAmount).toBe(100);
    expect(butterResult?.weightInGrams).toBe(100);
  });

  it("scales recipe by vessel volumes", () => {
    // Default vessel is 2300ml, target vessel is 3300ml
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetVesselVolume: 3300,
      defaultVesselVolume: 2300,
    });

    expect(multiplier).toBeCloseTo(3300 / 2300, 4);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBeCloseTo(500 * (3300 / 2300), 2);
  });

  it("scales recipe by total target weight", () => {
    // Base total weight in grams:
    // Flour: 500g
    // Water: 500g * 0.60 = 300g
    // Butter: 50g
    // Total base weight: 850g
    // Target total weight: 1700g (multiplier = 2.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      targetTotalWeight: 1700,
    });

    expect(multiplier).toBe(2.0);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1000);

    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(600);

    const butterResult = items.find((i) => i.ingredientId === "ing-3");
    expect(butterResult?.scaledAmount).toBe(100);
  });

  it("scales recipe using custom anchor ingredient override", () => {
    // User overrides Flour (ing-1) to be 1500g (multiplier = 3.0)
    const { multiplier, items } = calculateRecipeScale(dummyIngredients, 10, {
      customIngredientWeights: {
        "ing-1": { amount: 1500, unit: "g" },
      },
    });

    expect(multiplier).toBe(3.0);

    const flourResult = items.find((i) => i.ingredientId === "ing-1");
    expect(flourResult?.scaledAmount).toBe(1500);

    const waterResult = items.find((i) => i.ingredientId === "ing-2");
    expect(waterResult?.scaledAmount).toBe(900); // 1500 * 0.60 = 900g
  });
});
````

## File: utils/scaling.ts
````typescript
import { RecipeIngredient } from "@soustools/api-types";

// Standard conversion rates to base units:
// Weight base unit: g (grams)
// Volume base unit: ml (milliliters)
const WEIGHT_CONVERSIONS: Record<string, number> = {
  g: 1.0,
  kg: 1000.0,
  oz: 28.349523125,
  lb: 453.59237,
};

const VOLUME_CONVERSIONS: Record<string, number> = {
  ml: 1.0,
  l: 1000.0,
  tsp: 4.92892,
  tbsp: 14.7868,
  cup: 236.588,
  gal: 3785.41,
  qt: 946.353,
};

const COUNT_UNITS = new Set(['each', 'case']);

/**
 * Converts a numeric amount from one unit of measurement to another.
 * Automatically handles mass-to-volume and volume-to-mass transitions using the ingredient density.
 *
 * @param amount The numerical value to convert
 * @param fromUnit The unit of the input amount
 * @param toUnit The target unit to convert to
 * @param densityGMl The density coefficient in grams per milliliter (default 1.0)
 * @param eachWeightG Optional weight in grams per single each unit
 * @param unitsPerCase Optional units per case for case conversion
 */
export function convertUnit(
  amount: number,
  fromUnit: string,
  toUnit: string,
  densityGMl: number = 1.0,
  eachWeightG?: number,
  unitsPerCase?: number
): number {
  const from = fromUnit.toLowerCase();
  const to = toUnit.toLowerCase();

  // Handle count units (each, case) → grams conversion
  if (COUNT_UNITS.has(from)) {
    if (eachWeightG === undefined || eachWeightG <= 0) {
      throw new Error(`Unit "${fromUnit}" requires eachWeightG to convert to mass/volume`);
    }
    const totalG =
      from === 'case'
        ? amount * (unitsPerCase ?? 1) * eachWeightG
        : amount * eachWeightG;
    if (to === 'g') return totalG;
    if (WEIGHT_CONVERSIONS[to] !== undefined) return totalG / WEIGHT_CONVERSIONS[to];
    if (VOLUME_CONVERSIONS[to] !== undefined) return (totalG / densityGMl) / VOLUME_CONVERSIONS[to];
    return totalG;
  }

  if (from === to) {
    return amount;
  }

  // Count/percentage units do not support conversion to mass/volume directly
  if (from === "count" || to === "count" || from === "%" || to === "%") {
    if (from === "count" && to === "count") return amount;
    if (from === "%" && to === "%") return amount;
    // Fallback if trying to convert incompatible units
    return amount;
  }

  const isFromWeight = from in WEIGHT_CONVERSIONS;
  const isFromVolume = from in VOLUME_CONVERSIONS;
  const isToWeight = to in WEIGHT_CONVERSIONS;
  const isToVolume = to in VOLUME_CONVERSIONS;

  if (!((isFromWeight || isFromVolume) && (isToWeight || isToVolume))) {
    return amount; // Unsupported units
  }

  // 1. Convert source to its base unit
  let baseAmount = amount;
  let isBaseWeight = isFromWeight;

  if (isFromWeight) {
    baseAmount = amount * WEIGHT_CONVERSIONS[from];
  } else {
    baseAmount = amount * VOLUME_CONVERSIONS[from];
  }

  // 2. Convert base unit if cross-dimension (weight <-> volume)
  if (isBaseWeight && isToVolume) {
    // Grams to Milliliters: ml = g / density
    baseAmount = baseAmount / densityGMl;
    isBaseWeight = false;
  } else if (!isBaseWeight && isToWeight) {
    // Milliliters to Grams: g = ml * density
    baseAmount = baseAmount * densityGMl;
    isBaseWeight = true;
  }

  // 3. Convert base unit to target unit
  if (isBaseWeight) {
    return baseAmount / WEIGHT_CONVERSIONS[to];
  } else {
    return baseAmount / VOLUME_CONVERSIONS[to];
  }
}

export interface ScaledIngredientResult {
  ingredientId: string;
  name: string;
  originalAmount: number;
  originalUnit: string;
  scaledAmount: number;
  scaledUnit: string;
  calculationType: "fixed_weight" | "bakers_percentage";
  baseCalculationGroup: boolean;
  percentageOfBase?: number; // Baker's percentage if applicable
  weightInGrams: number;      // Calculated final weight in grams
}

/**
 * Calculates scaled values for all recipe ingredients based on scaling inputs.
 */
export function calculateRecipeScale(
  ingredients: RecipeIngredient[],
  baseYield: number,
  options: {
    targetYield?: number;
    targetTotalWeight?: number;
    targetVesselVolume?: number;
    defaultVesselVolume?: number;
    customIngredientWeights?: Record<string, { amount: number; unit: string }>; // anchor overrides
  }
): { multiplier: number; items: ScaledIngredientResult[] } {
  if (ingredients.length === 0) {
    return { multiplier: 1, items: [] };
  }

  // 1. Calculate the weight of each ingredient in grams to find base total/flour weights
  const ingredientBaseWeightsG: Record<string, number> = {};
  const componentBaseFlourWeightsG: Record<string, number> = {};

  // Resolve fixed weight values first
  ingredients.forEach((ing) => {
    const density = ing.masterIngredient?.densityGMl ?? 1.0;
    if (ing.calculationType === "fixed_weight" || ing.baseCalculationGroup) {
      const weightG = convertUnit(ing.amount, ing.unit, "g", density);
      ingredientBaseWeightsG[ing.id] = weightG;
      if (ing.baseCalculationGroup) {
        const comp = ing.component || "Base Recipe";
        componentBaseFlourWeightsG[comp] = (componentBaseFlourWeightsG[comp] || 0) + weightG;
      }
    }
  });

  // Resolve baker's percentage values based on base flour weight
  ingredients.forEach((ing) => {
    if (ing.calculationType === "bakers_percentage" && !ing.baseCalculationGroup) {
      const comp = ing.component || "Base Recipe";
      const baseWeightG = componentBaseFlourWeightsG[comp] || 0;
      // Amount represents percentage (e.g. 60%)
      const weightG = baseWeightG * (ing.amount / 100);
      ingredientBaseWeightsG[ing.id] = weightG;
    }
  });

  // Calculate base total weight of the recipe
  const baseTotalWeightG = Object.values(ingredientBaseWeightsG).reduce((a, b) => a + b, 0);

  // 2. Determine the scaling multiplier
  let multiplier = 1.0;

  if (options.customIngredientWeights && Object.keys(options.customIngredientWeights).length > 0) {
    // Scaled relative to a specific ingredient weight override (anchoring)
    const [anchorId, targetWeight] = Object.entries(options.customIngredientWeights)[0];
    const anchorIng = ingredients.find((ing) => ing.id === anchorId);
    if (anchorIng) {
      const density = anchorIng.masterIngredient?.densityGMl ?? 1.0;
      const targetWeightG = convertUnit(targetWeight.amount, targetWeight.unit, "g", density);
      const baseWeightG = ingredientBaseWeightsG[anchorId] ?? 0;

      if (baseWeightG > 0) {
        multiplier = targetWeightG / baseWeightG;
      }
    }
  } else if (options.targetVesselVolume && options.defaultVesselVolume) {
    // Scaled relative to vessel volumes
    multiplier = options.targetVesselVolume / options.defaultVesselVolume;
  } else if (options.targetTotalWeight && baseTotalWeightG > 0) {
    // Scaled relative to total weight
    multiplier = options.targetTotalWeight / baseTotalWeightG;
  } else if (options.targetYield) {
    // Scaled relative to portions
    multiplier = options.targetYield / baseYield;
  }

  // Prevent divide-by-zero or negative multiplier issues
  if (isNaN(multiplier) || !isFinite(multiplier) || multiplier <= 0) {
    multiplier = 1.0;
  }

  // 3. Map ingredients to scaled outputs
  const items = ingredients.map((ing): ScaledIngredientResult => {
    const density = ing.masterIngredient?.densityGMl ?? 1.0;
    const name = ing.masterIngredient?.name ?? ing.rawName ?? "Unknown Ingredient";

    let scaledAmount = 0;
    let scaledUnit = ing.unit;
    let weightInGrams = 0;
    let percentageOfBase: number | undefined;

    if (ing.baseCalculationGroup || ing.calculationType === "fixed_weight") {
      scaledAmount = ing.amount * multiplier;
      weightInGrams = (ingredientBaseWeightsG[ing.id] ?? 0) * multiplier;
    } else {
      // bakers_percentage
      percentageOfBase = ing.amount; // Percentage stays constant
      const comp = ing.component || "Base Recipe";
      const targetFlourG = (componentBaseFlourWeightsG[comp] || 0) * multiplier;
      weightInGrams = targetFlourG * (ing.amount / 100);

      // Baker's percentage units in DB is '%'. For display, we can either return weight in grams or %
      if (ing.unit === "%") {
        // Output calculated target weight in grams
        scaledAmount = weightInGrams;
        scaledUnit = "g";
      } else {
        // If they had a specific unit, convert from grams
        scaledAmount = convertUnit(weightInGrams, "g", ing.unit, density);
      }
    }

    return {
      ingredientId: ing.id,
      name,
      originalAmount: ing.amount,
      originalUnit: ing.unit,
      scaledAmount,
      scaledUnit,
      calculationType: ing.calculationType,
      baseCalculationGroup: ing.baseCalculationGroup,
      percentageOfBase,
      weightInGrams,
    };
  });

  return { multiplier, items };
}
````

## File: index.ts
````typescript
/**
 * Entrypoint for the shared @soustools/ui package.
 * Exports theme tokens, utilities, and all shared components.
 */

export * from "./theme";
export { Button } from "./components/Button";
export type { ButtonProps } from "./components/Button";
export * from "./components/logos";
export * from "./utils/scaling";

// ── Procurement / Order Manager components ─────────────────────────────────
export { TwoToneHeader } from "./components/TwoToneHeader";
export type { TwoToneHeaderProps } from "./components/TwoToneHeader";

export { QuickAddBar, inferVendorForItem } from "./components/QuickAddBar";
export type {
  QuickAddBarProps,
  QuickAddSuggestion,
} from "./components/QuickAddBar";

export {
  SupplierOrderGroup,
  OrderItemRow,
  EmptyOrderList,
} from "./components/SupplierOrderGroup";
export type {
  SupplierOrderGroupProps,
  OrderItemRowProps,
  OrderSupplier,
  OrderLineItem,
} from "./components/SupplierOrderGroup";

export { InsightsSidebar } from "./components/InsightsSidebar";
export type { InsightsSidebarProps } from "./components/InsightsSidebar";
````

## File: theme.ts
````typescript
/**
 * Interface representing the structure of programmatic theme color tokens.
 * All values are specified in OKLCH format for perceptual uniformity.
 */
export interface ThemeColorTokens {
  /** Near-black base background — optimised for glare-heavy kitchen environments. */
  background: string;
  /** Near-white foreground content/text color. */
  foreground: string;
  /**
   * Brand primary — cyan/sky band (#4cc9f0).
   * Sourced from: v2/themes/glass-frosted.toml → directory style `#4cc9f0`
   *               v2/packages/ui/src/styles.css → --primary: 206 100% 50%
   */
  primary: string;
  /** Success status — emerald green for active/in-stock states. */
  success: string;
  /** Warning status — vivid amber for low-stock / pending order states. */
  warning: string;
  /** Solar orange highlight for interactive accent elements. */
  accent: string;
  /** Crimson destructive — sold-out states, interrupt actions. */
  destructive: string;
  /** Muted neutral for secondary descriptions and subtle borders. */
  muted: string;
  /**
   * Neon pink accent — sourced from glass-frosted.toml success_symbol `#f72585`.
   * Used as a secondary neon colour in dual-accent neon compositions.
   */
  neonPink: string;
}

/**
 * Dark/Cyan programmatic design token engine — the "glass-frosted" aesthetic.
 *
 * Token derivation:
 *   - Background/Foreground → v2/packages/ui/src/styles.css .dark block
 *   - Primary (cyan)        → v2/themes/glass-frosted.toml `#4cc9f0` + v2 sky-500 usage
 *   - Neon pink             → v2/themes/glass-frosted.toml `#f72585`
 *
 * Optimised for high-contrast visibility in bright, glare-heavy commercial kitchen displays.
 */
export const themeTokens = {
  colors: {
    background:  "oklch(0.12 0.01 240)",   /* zinc-950-equivalent dark plane  */
    foreground:  "oklch(0.98 0.005 240)",  /* near-white                       */
    primary:     "oklch(0.75 0.15 210)",   /* cyan #4cc9f0 band                */
    success:     "oklch(0.70 0.25 150)",   /* emerald green                    */
    warning:     "oklch(0.85 0.20 85)",    /* vivid amber                      */
    accent:      "oklch(0.65 0.25 45)",    /* solar orange                     */
    destructive: "oklch(0.60 0.25 25)",    /* pure crimson                     */
    muted:       "oklch(0.35 0.01 240)",   /* dark muted surface               */
    neonPink:    "oklch(0.58 0.28 340)",   /* #f72585 glass-frosted accent     */
  } as ThemeColorTokens,
};
````
