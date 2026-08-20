"use client";

import * as React from "react";
import { Package, Zap, Trash2 } from "lucide-react";
import type { OrderLineItem, OrderSupplier } from "./SupplierOrderGroup.types";

const COMMON_UNITS = [
  "ea",
  "cs",
  "lb",
  "oz",
  "kg",
  "g",
  "gal",
  "qt",
  "pt",
  "bx",
  "pk",
  "bag",
  "btl",
  "can",
  "dz",
];

export interface OrderItemRowProps {
  item: OrderLineItem;
  suppliers: OrderSupplier[];
  onRemove: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
  onChangeSupplier: (id: string, supplierId: string | null) => void;
  onChangeUnit?: (id: string, unit: string) => void;
}

export function OrderItemRow({
  item,
  suppliers,
  onRemove,
  onChangeQty,
  onChangeSupplier,
  onChangeUnit,
}: OrderItemRowProps) {
  const [qty, setQty] = React.useState(String(item.quantity));

  const commitQty = () => {
    const parsed = parseFloat(qty);
    if (!isNaN(parsed) && parsed > 0) onChangeQty(item.id, parsed);
    else setQty(String(item.quantity));
  };

  return (
    <div className="bg-card/60 border-border hover:border-primary/30 group/item flex flex-row items-center justify-between rounded-2xl border p-4 transition-all">
      {/* Left: icon + name */}
      <div className="flex min-w-0 flex-1 flex-row items-center gap-4">
        <div className="bg-secondary border-border group-hover/item:bg-primary/5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors">
          <Package
            size={16}
            className="text-muted-foreground group-hover/item:text-primary transition-colors"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground truncate text-sm font-black tracking-tight uppercase">
            {item.rawName}
          </p>
          {item.isSystemSuggestion && (
            <div className="text-warning bg-warning/10 border-warning/20 mt-0.5 inline-flex flex-row items-center gap-1 rounded-full border px-2 py-0.5">
              <Zap size={7} fill="currentColor" />
              <span className="text-[7px] font-black tracking-widest uppercase">
                AI Suggested
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right: qty + supplier + remove */}
      <div className="flex shrink-0 flex-row items-center gap-3">
        <div className="bg-secondary border-border flex flex-row items-center gap-1 rounded-xl border p-1">
          <input
            type="number"
            value={qty}
            min={0}
            step={0.5}
            onChange={(e) => setQty(e.target.value)}
            onBlur={commitQty}
            aria-label="Quantity"
            className="text-foreground w-12 bg-transparent text-center text-sm font-black outline-none"
          />
          <select
            value={item.unit || "ea"}
            onChange={(e) => onChangeUnit?.(item.id, e.target.value)}
            aria-label="Unit"
            className="text-muted-foreground border-border hover:text-foreground cursor-pointer border-l bg-transparent pr-2 pl-2 text-[10px] font-black uppercase outline-none"
          >
            {item.unit && !COMMON_UNITS.includes(item.unit) && (
              <option value={item.unit}>{item.unit}</option>
            )}
            {COMMON_UNITS.map((u) => (
              <option key={u} value={u} className="bg-card text-foreground">
                {u}
              </option>
            ))}
          </select>
        </div>

        <select
          value={item.supplier?.id ?? ""}
          onChange={(e) => onChangeSupplier(item.id, e.target.value || null)}
          className="bg-secondary border-border text-foreground focus:border-primary/50 h-10 min-w-[130px] appearance-none rounded-xl border px-3 text-[10px] font-black uppercase transition-colors outline-none"
        >
          <option value="">Move to...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id} className="bg-card text-foreground">
              {s.name}
            </option>
          ))}
        </select>

        <button
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.rawName}`}
          className="hover:bg-destructive/10 hover:text-destructive text-muted-foreground flex h-10 w-10 items-center justify-center rounded-full p-0 opacity-0 transition-opacity group-hover/item:opacity-100"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}
