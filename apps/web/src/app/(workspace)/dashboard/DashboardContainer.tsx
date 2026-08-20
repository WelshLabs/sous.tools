"use client";

import React, { useEffect, useState } from "react";
import { graphqlClient } from "@soustools/api-client";
import { DashboardView, type DashboardStats } from "./DashboardView";

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

interface DashboardContainerProps {
  initialStats: DashboardStats;
}

export function DashboardContainer({ initialStats }: DashboardContainerProps) {
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
          }, 1000);
        }
      },
      onError: (err) => {
        console.warn("[Dashboard] GraphQL subscription error:", err);
      },
    });

    setIsLive(true);

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  return (
    <DashboardView stats={stats} isLive={isLive} isUpdating={isUpdating} />
  );
}
