import React from "react";
import { DashboardContainer } from "@soustools/domain-pos";
import { graphqlClient } from "@soustools/api-client";

export const dynamic = "force-dynamic";

const GET_DASHBOARD_STATS_QUERY = `
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
        weeklyOrders
        allTimeOrders
        averageTicketTime
        weeklyAverageTicketTime
        dailyRevenue
        weeklyRevenue
        allTimeRevenue
        activeTables
        dailyRevenueChange
        totalOrdersChange
        averageTicketTimeChange
        activeTablesSubtitle
      }
    }
  }
`;

export default async function DashboardPage() {
  let stats = {
    revenue: [],
    ticketTimes: [],
    inventoryAlerts: [],
    summary: {
      totalOrders: 0,
      weeklyOrders: 0,
      allTimeOrders: 0,
      averageTicketTime: "0m",
      weeklyAverageTicketTime: "0m",
      dailyRevenue: "$0.00",
      weeklyRevenue: "$0.00",
      allTimeRevenue: "$0.00",
      activeTables: 0,
    },
  };

  try {
    const res = await graphqlClient.request<{ dashboardStats: any }>(
      GET_DASHBOARD_STATS_QUERY,
    );
    if (res.data?.dashboardStats) {
      stats = res.data.dashboardStats;
    }
  } catch (err) {
    console.warn("Failed to load initial dashboard stats via GraphQL:", err);
  }

  return (
    <div className="animate-fadeIn relative mx-auto max-w-7xl pb-12">
      <DashboardContainer initialStats={stats} />
    </div>
  );
}
