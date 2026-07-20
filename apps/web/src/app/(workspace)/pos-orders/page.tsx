import React from "react";
import { PosOrdersView } from "./PosOrdersView";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function PosOrdersPage() {
  let initialOrders = [];

  try {
    const { data, error } = await (api.GET as any)("/pos/orders", { cache: "no-store" });
    if (!error && data) {
      initialOrders = (data as any).data || data;
    }
  } catch (err) {
    console.error("Failed to fetch pos orders:", err);
  }

  return <PosOrdersView initialOrders={initialOrders} />;
}
