"use client";

import { Truck, Calendar, Check, ShoppingBag } from "lucide-react";
import type { OrderSupplier, OrderLineItem } from "./SupplierOrderGroup.types";

export interface SupplierHeaderProps {
  supplier: OrderSupplier | null;
  items: OrderLineItem[];
  isPlacingOrder: boolean;
  onPlaceOrder: () => void;
  onShopOrder?: () => void;
}

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

export function SupplierHeader({
  supplier,
  items,
  isPlacingOrder,
  onPlaceOrder,
  onShopOrder,
}: SupplierHeaderProps) {
  const isUnassigned = !supplier;

  return (
    <div className="flex flex-row items-center justify-between px-2">
      <div className="flex flex-row items-center gap-4">
        <div
          className={[
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition-all",
            isUnassigned
              ? "bg-muted dark:bg-secondary border-border"
              : "bg-accent/10 border-accent/20 shadow-glow-accent",
          ].join(" ")}
        >
          <Truck
            size={22}
            className={isUnassigned ? "text-muted-foreground" : "text-accent"}
          />
        </div>
        <div>
          <p className="text-foreground text-xl font-black tracking-tighter uppercase">
            {isUnassigned ? "Unassigned Items" : supplier?.name}
          </p>
          {!isUnassigned && supplier && (
            <div className="mt-0.5 flex flex-row items-center gap-3">
              <div className="text-primary flex flex-row items-center gap-1.5">
                <Calendar size={11} />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  Next: {getNextDelivery(supplier.deliveryDays)}
                </span>
              </div>
              <span className="text-muted-foreground/40 text-[10px]">•</span>
              <div className="text-muted-foreground flex flex-row items-center gap-1.5">
                <span className="text-[10px] font-black tracking-widest uppercase">
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
              className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground group border-border flex h-12 items-center gap-2 rounded-2xl border px-6 transition-colors"
            >
              <ShoppingBag
                size={16}
                className="transition-transform group-hover:scale-110"
              />
              <span className="text-xs font-black tracking-widest uppercase">
                Shop
              </span>
            </button>
          )}
          <button
            onClick={onPlaceOrder}
            disabled={isPlacingOrder}
            className="bg-primary hover:bg-primary/90 shadow-glow-sm group flex h-12 items-center gap-3 rounded-2xl px-8 transition-colors disabled:opacity-50"
          >
            <Check
              size={16}
              className="text-primary-foreground transition-transform group-hover:scale-110"
            />
            <span className="text-primary-foreground text-xs font-black tracking-widest uppercase">
              Place Order ({items.length})
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
