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
            "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-all",
            isUnassigned
              ? "bg-muted dark:bg-secondary border-border"
              : "bg-accent/10 border-accent/20 shadow-glow-accent",
          ].join(" ")}
        >
          <Truck
            size={22}
            className={
              isUnassigned
                ? "text-muted-foreground"
                : "text-accent"
            }
          />
        </div>
        <div>
          <p className="font-black uppercase text-xl tracking-tighter text-foreground">
            {isUnassigned ? "Unassigned Items" : supplier?.name}
          </p>
          {!isUnassigned && supplier && (
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
              className="bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground h-12 px-6 rounded-2xl flex items-center gap-2 group transition-colors border border-border"
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
            className="bg-primary hover:bg-primary/90 disabled:opacity-50 h-12 px-8 rounded-2xl shadow-glow-sm flex items-center gap-3 group transition-colors"
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
  );
}
