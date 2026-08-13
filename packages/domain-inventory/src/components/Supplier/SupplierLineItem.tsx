"use client";

import * as React from "react";
import { Package, Zap, Trash2 } from "lucide-react";
import type { OrderLineItem, OrderSupplier } from "./SupplierOrderGroup.types";

export interface OrderItemRowProps {
  item: OrderLineItem;
  suppliers: OrderSupplier[];
  onRemove: (id: string) => void;
  onChangeQty: (id: string, qty: number) => void;
  onChangeSupplier: (id: string, supplierId: string | null) => void;
}

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
    <div className="p-4 bg-card/60 border border-border hover:border-primary/30 transition-all flex flex-row items-center justify-between rounded-2xl group/item">
      {/* Left: icon + name */}
      <div className="flex flex-row items-center gap-4 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center border border-border group-hover/item:bg-primary/5 transition-colors shrink-0">
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
            <div className="inline-flex flex-row items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full border border-warning/20 mt-0.5">
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
        <div className="flex flex-row items-center gap-1 bg-secondary p-1 rounded-xl border border-border">
          <input
            type="number"
            value={qty}
            min={0}
            step={0.5}
            onChange={(e) => setQty(e.target.value)}
            onBlur={commitQty}
            className="w-12 bg-transparent text-center font-black text-sm outline-none text-foreground"
          />
          <span className="text-[10px] font-black uppercase text-muted-foreground pr-3 border-l border-border pl-2">
            {item.unit}
          </span>
        </div>

        <select
          value={item.supplier?.id ?? ""}
          onChange={(e) => onChangeSupplier(item.id, e.target.value || null)}
          className="bg-secondary border border-border rounded-xl px-3 h-10 text-[10px] font-black uppercase appearance-none text-foreground min-w-[130px] outline-none focus:border-primary/50 transition-colors"
        >
          <option value="">Move to...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

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
