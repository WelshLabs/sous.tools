"use client";

import { ShoppingBag } from "lucide-react";
import type { PurchaseOrder } from "@soustools/api-types";

interface HistoryTabProps {
  historyOrders: PurchaseOrder[];
  onShopOrder: (poId: string) => void;
}

export function OrdersHistoryTab({
  historyOrders,
  onShopOrder,
}: HistoryTabProps) {
  if (historyOrders.length === 0) {
    return (
      <div className="text-muted-foreground flex flex-col items-center justify-center py-32">
        <ShoppingBag size={64} className="mb-4 opacity-20" />
        <p className="text-sm font-black tracking-[0.2em] uppercase">
          No Order History
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {historyOrders.map((po) => {
        const isReceived =
          po.status === "RECEIVED" || po.status === "RECONCILED";
        return (
          <div
            key={po.id}
            className={`glass-panel border-border flex items-center justify-between rounded-2xl border p-6 transition-opacity ${isReceived ? "opacity-50" : ""}`}
          >
            <div>
              <h3 className="text-lg font-bold">
                {po.vendors?.name ?? "Unknown Vendor"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {new Date(po.created_at).toLocaleDateString()} - {po.status}
              </p>
            </div>
            <button
              onClick={() => onShopOrder(po.id)}
              className="bg-primary/10 text-primary hover:bg-primary/20 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
            >
              View Order
            </button>
          </div>
        );
      })}
    </div>
  );
}
