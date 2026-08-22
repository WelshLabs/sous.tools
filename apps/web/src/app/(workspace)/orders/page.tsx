import React from "react";
import { OrdersPanelContainer } from "@soustools/domain-inventory";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  let vendors = [];
  let whiteboardItems = [];
  let purchaseOrders = [];

  try {
    const [vRes, wRes, pRes] = await Promise.all([
      (api.GET as any)("/vendors", { cache: "no-store" }),
      (api.GET as any)("/whiteboard", { cache: "no-store" }),
      (api.GET as any)("/purchase-orders", { cache: "no-store" }),
    ]);

    if (!vRes.error && vRes.data) {
      vendors = (vRes.data as any).data || vRes.data || [];
    }
    if (!wRes.error && wRes.data) {
      whiteboardItems = (wRes.data as any).data || wRes.data || [];
    }
    if (!pRes.error && pRes.data) {
      purchaseOrders = (pRes.data as any).data || pRes.data || [];
    }
  } catch (err) {
    console.error("Failed to load orders page data:", err);
  }

  return (
    <OrdersPanelContainer
      initialVendors={vendors}
      initialWhiteboardItems={whiteboardItems}
      initialPurchaseOrders={purchaseOrders}
    />
  );
}
