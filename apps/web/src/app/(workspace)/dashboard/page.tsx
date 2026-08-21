import React from "react";
import { DashboardContainer } from "@soustools/domain-pos";
import { api } from "@soustools/api-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats = {
    revenue: [],
    ticketTimes: [],
    inventoryAlerts: [],
    summary: {
      totalOrders: 0,
      averageTicketTime: "0m",
      dailyRevenue: "$0.00",
      activeTables: 0,
    },
  };

  try {
    const { data, error } = await (api.GET as any)("/pos/dashboard/stats", {
      cache: "no-store",
    });
    if (!error && data) {
      stats = (data as any).data || stats;
    }
  } catch (err) {
    console.error("Failed to load initial dashboard stats", err);
  }

  return (
    <div className="animate-fadeIn relative mx-auto max-w-7xl pb-12">
      <DashboardContainer initialStats={stats} />
    </div>
  );
}
