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
    <div className="p-4 bg-white dark:bg-card/60 border border-border dark:border-border hover:border-primary/30 transition-all flex flex-row items-center justify-between rounded-2xl group/item">
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
  onShopOrder?: () => void;
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
  onShopOrder,
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
          <div className="flex flex-row gap-3">
            {onShopOrder && (
              <button
                onClick={onShopOrder}
                className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground h-12 px-6 rounded-2xl flex items-center gap-2 group transition-colors border border-border dark:border-zinc-700"
              >
                <ShoppingBag
                  size={16}
                  className="group-hover:scale-110 transition-transform"
                />
                <span className="font-black uppercase text-xs tracking-widest">
                  Shop
                </span>
              </button>
            )}
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
          </div>
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
    <div className="p-20 bg-muted/40 dark:bg-card/40 border border-border dark:border-border border-dashed flex flex-col items-center justify-center rounded-[2.5rem]">
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
