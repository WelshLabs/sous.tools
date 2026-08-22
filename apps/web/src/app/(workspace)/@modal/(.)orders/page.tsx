"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Loader2 } from "lucide-react";
import { OrdersPanelContainer } from "@soustools/domain-inventory";
import { graphqlClient } from "@soustools/api-client";
import type {
  Vendor,
  WhiteboardItem,
  PurchaseOrder,
} from "@soustools/api-types";

export const dynamic = "force-dynamic";

const GET_ORDERS_MODAL_QUERY = `
  query GetOrdersModalData {
    vendors {
      id
      organization_id
      name
      rep_name
      rep_phone
      rep_email
      order_method
      cutoff_time
      minimum_order
      delivery_days
      created_at
      updated_at
    }
    whiteboard {
      id
      organization_id
      item_id
      custom_name
      quantity
      unit
      suggested_vendor_id
      status
      created_by
      created_at
      updated_at
    }
    purchaseOrders {
      id
      organization_id
      vendor_id
      status
      total_amount
      order_date
      delivery_date
      created_at
      updated_at
      purchase_order_items {
        id
        po_id
        item_id
        custom_name
        quantity
        unit
        unit_price
        created_at
      }
    }
  }
`;

export default function InterceptedOrdersModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [whiteboardItems, setWhiteboardItems] = useState<WhiteboardItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // If the user navigates to another page, dismiss the parallel intercepted route
  if (pathname !== "/orders") {
    return null;
  }

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const res = await graphqlClient.request<{
          vendors: any[];
          whiteboard: any[];
          purchaseOrders: any[];
        }>(GET_ORDERS_MODAL_QUERY);

        if (isMounted && res.data) {
          setVendors(res.data.vendors || []);
          setWhiteboardItems(res.data.whiteboard || []);
          setPurchaseOrders(res.data.purchaseOrders || []);
        }
      } catch (err) {
        console.error("Failed to load orders modal data via GraphQL:", err);
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
      className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          router.back();
        }
      }}
    >
      <div className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-[#0a0d16] shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-card/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-pulse" />
            <h2 className="text-base font-extrabold text-foreground tracking-tight">
              Living Order List & Purchasing
            </h2>
            <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
              Quick Access
            </span>
          </div>
          <button
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-bold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all active:scale-95 shadow-sm"
            aria-label="Close modal"
          >
            <X className="h-4 w-4 text-primary" />
            <span>Close</span>
            <kbd className="ml-1 rounded border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              Esc
            </kbd>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto bg-[#070911]/90">
          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-xs font-black tracking-widest uppercase">
                Loading Living Order List…
              </p>
            </div>
          ) : (
            <OrdersPanelContainer
              initialVendors={vendors}
              initialWhiteboardItems={whiteboardItems}
              initialPurchaseOrders={purchaseOrders}
            />
          )}
        </div>
      </div>
    </div>
  );
}
