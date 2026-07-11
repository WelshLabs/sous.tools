import React from "react";
import { PosOrdersView } from "./PosOrdersView";

export const dynamic = "force-dynamic";

export default async function PosOrdersPage() {
  let initialOrders = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6001"}/pos/orders`, { cache: 'no-store' });
    if (res.ok) {
      initialOrders = await res.json();
    }
  } catch (err) {
    console.error("Failed to fetch pos orders:", err);
  }

  return <PosOrdersView initialOrders={initialOrders} />;
}
