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

export interface DashboardProps {
  initialStats: DashboardStats;
}

export function DashboardContainer({ initialStats }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isLive, setIsLive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const unsubscribe = graphqlClient.subscribe<{
      dashboardStatsUpdated: DashboardStats;
    }>({
      query: DASHBOARD_SUBSCRIPTION,
      onNext: (data) => {
        if (data?.dashboardStatsUpdated) {
          setIsLive(true);
          setIsUpdating(true);
          setStats(data.dashboardStatsUpdated);

          if (timer) clearTimeout(timer);
          timer = setTimeout(() => {
            setIsUpdating(false);
          }, 800);
        }
      },
      onError: (err) => {
        console.warn("GraphQL Dashboard subscription disconnected/error:", err);
        setIsLive(false);
      },
      onComplete: () => {
        setIsLive(false);
      },
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <DashboardView stats={stats} isLive={isLive} isUpdating={isUpdating} />
  );
}

export { DashboardContainer as Dashboard };
