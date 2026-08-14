"use client";

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
        <div className="text-primary flex items-center justify-center gap-3 py-10">
          <Loader2 size={26} className="animate-spin" />
          <span className="text-xs font-black tracking-widest uppercase">
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
    <div className="bg-muted/40 dark:bg-card/40 border-border flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed p-20">
      <div className="bg-secondary mb-6 flex h-24 w-24 items-center justify-center rounded-full">
        <ShoppingBag
          size={48}
          className="text-muted-foreground/30 dark:text-muted-foreground/20"
        />
      </div>
      <p className="text-muted-foreground mb-2 text-xs font-black tracking-widest uppercase">
        Everything looks good
      </p>
      <p className="text-muted-foreground/60 max-w-xs text-center text-sm">
        Your living order list is empty. Add items as you notice they are low,
        or wait for system suggestions.
      </p>
    </div>
  );
}
