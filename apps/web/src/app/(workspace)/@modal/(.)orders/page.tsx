"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { OrdersClient } from "@/app/(workspace)/orders/OrdersClient";
import type {
  Vendor,
  WhiteboardItem,
  PurchaseOrder,
} from "@soustools/api-types";

export const dynamic = "force-dynamic";

export default function InterceptedOrdersModal() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [whiteboardItems, setWhiteboardItems] = useState<WhiteboardItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [vRes, wRes, pRes] = await Promise.all([
          fetch("/api/vendors"),
          fetch("/api/whiteboard"),
          fetch("/api/purchase-orders"),
        ]);

        if (vRes.ok) {
          const vData = await vRes.json();
          if (isMounted) setVendors(vData.data || []);
        }
        if (wRes.ok) {
          const wData = await wRes.json();
          if (isMounted) setWhiteboardItems(wData.data || []);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          if (isMounted) setPurchaseOrders(pData.data || []);
        }
      } catch (err) {
        console.error("Failed to load orders modal data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return (
    <div
      className="bg-background/95 animate-in fade-in fixed inset-0 z-[var(--z-modal)] flex flex-col overflow-hidden backdrop-blur-md duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Top action bar */}
      <div className="border-border/40 bg-card/40 flex shrink-0 items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs font-black tracking-widest uppercase">
            Quick Access • Orders
          </span>
        </div>
        <button
          onClick={() => router.back()}
          className="border-border/50 bg-secondary/80 text-muted-foreground hover:bg-secondary hover:text-foreground flex cursor-pointer items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95"
          aria-label="Close orders modal"
        >
          <X className="h-4 w-4" />
          <span>Close</span>
          <kbd className="border-border bg-muted/60 text-muted-foreground ml-1 rounded border px-1.5 py-0.5 font-mono text-[10px]">
            Esc
          </kbd>
        </button>
      </div>

      {/* Main modal content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-muted-foreground flex h-96 flex-col items-center justify-center gap-3">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-xs font-black tracking-widest uppercase">
              Loading Living Order List…
            </p>
          </div>
        ) : (
          <OrdersClient
            initialVendors={vendors}
            initialWhiteboardItems={whiteboardItems}
            initialPurchaseOrders={purchaseOrders}
          />
        )}
      </div>
    </div>
  );
}
