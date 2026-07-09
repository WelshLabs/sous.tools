"use client";

import * as React from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { SupplierHeader } from "./SupplierHeader";
import { OrderItemRow } from "./SupplierLineItem";
import type { OrderSupplier, OrderLineItem } from "./SupplierOrderGroup.types";

export type { OrderSupplier, OrderLineItem };

export interface SupplierOrderGroupProps {
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
  return (
    <div className="flex flex-col gap-6">
      <SupplierHeader
        supplier={supplier}
        items={items}
        isPlacingOrder={isPlacingOrder}
        onPlaceOrder={onPlaceOrder}
        onShopOrder={onShopOrder}
      />
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
