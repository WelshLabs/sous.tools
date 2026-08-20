import React from "react";
import { clientConfig as config } from "@soustools/config/client";
import { graphqlClient } from "@soustools/api-client";
import { DashboardContainer } from "./DashboardContainer";
import type { DashboardStats } from "./DashboardView";

export const dynamic = "force-dynamic";

const DASHBOARD_GRAPHQL_QUERY = `
  query GetDashboardStats {
    dashboardStats {
      revenue {
        name
        value
        sales
        tax
        tips
        processingFee
      }
      ticketTimes {
        time
        minutes
      }
      inventoryAlerts {
        item
        status
        quantity
      }
      summary {
        totalOrders
        averageTicketTime
        dailyRevenue
        activeTables
        dailyRevenueChange
        totalOrdersChange
        averageTicketTimeChange
        activeTablesSubtitle
      }
    }
  }
`;

async function getDashboardStats(): Promise<DashboardStats> {
  // 1. Try GraphQL Query first via api-client
  try {
    const gqlRes = await graphqlClient.request<{
      dashboardStats: DashboardStats;
    }>(DASHBOARD_GRAPHQL_QUERY);
    if (gqlRes.data?.dashboardStats) {
      return gqlRes.data.dashboardStats;
    }
  } catch (gqlErr) {
    console.warn(
      "GraphQL Dashboard fetch failed, attempting REST fallback...",
      gqlErr,
    );
  }

  // 2. REST Fallback
  const baseUrl = config.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${baseUrl}/dashboard/stats`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error("Dashboard REST fetch error:", err);
    return {
      revenue: [],
      ticketTimes: [],
      inventoryAlerts: [],
      summary: {
        totalOrders: 0,
        averageTicketTime: "0m",
        dailyRevenue: "$0.00",
        activeTables: 0,
        dailyRevenueChange: "0% from yesterday",
        totalOrdersChange: "0% from yesterday",
        averageTicketTimeChange: "0m from yesterday",
        activeTablesSubtitle: "0 active orders",
      },
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return <DashboardContainer initialStats={stats} />;
}
