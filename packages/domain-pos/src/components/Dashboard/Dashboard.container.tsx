"use client";

import { useEffect, useState } from "react";
import { graphqlClient } from "@soustools/api-client";
import { DashboardView, type DashboardStats } from "./Dashboard.view";

const DASHBOARD_SUBSCRIPTION = `
  subscription OnDashboardStatsUpdated {
    dashboardStatsUpdated {
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

export interface DashboardProps {
  initialStats?: DashboardStats;
}

export function DashboardContainer({ initialStats }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(
    initialStats || {
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
    },
  );
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch fresh stats on mount
  useEffect(() => {
    graphqlClient
      .request<{ dashboardStats: DashboardStats }>(GET_DASHBOARD_STATS_QUERY)
      .then((res) => {
        if (res.data?.dashboardStats) {
          setStats(res.data.dashboardStats);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch initial dashboard stats via GraphQL:", err);
      });
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const unsubscribe = graphqlClient.subscribe<{
      dashboardStatsUpdated: DashboardStats;
    }>({
      query: DASHBOARD_SUBSCRIPTION,
      onNext: (data) => {
        if (data?.dashboardStatsUpdated) {
          setIsUpdating(true);
          setStats(data.dashboardStatsUpdated);

          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            setIsUpdating(false);
          }, 800);
        }
      },
      onError: (err) => {
        console.warn("GraphQL Dashboard subscription notice:", err);
      },
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return <DashboardView stats={stats} isUpdating={isUpdating} />;
}

export { DashboardContainer as Dashboard };
