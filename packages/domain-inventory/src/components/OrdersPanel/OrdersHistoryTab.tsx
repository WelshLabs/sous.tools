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
      <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
        <ShoppingBag size={64} className="mb-4 opacity-20" />
        <p className="text-sm font-black uppercase tracking-[0.2em]">
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
            className={`glass-panel p-6 rounded-2xl flex items-center justify-between border border-border transition-opacity ${isReceived ? "opacity-50" : ""}`}
          >
            <div>
              <h3 className="font-bold text-lg">
                {po.vendors?.name ?? "Unknown Vendor"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(po.created_at).toLocaleDateString()} - {po.status}
              </p>
            </div>
            <button
              onClick={() => onShopOrder(po.id)}
              className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 transition-colors"
            >
              View Order
            </button>
          </div>
        );
      })}
    </div>
  );
}
