import React from "react";
import { clientConfig as config } from "@soustools/config/client";
import { graphqlClient } from "@soustools/api-client";
import {
  RevenueChart,
  TicketTimeChart,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@soustools/design-system";
import type { RevenueData, TicketTimeData } from "@soustools/design-system";
import { Activity, CircleDollarSign, Clock, Users } from "lucide-react";
import { LiveRefresher } from "./live-refresher";

export const dynamic = "force-dynamic";

interface DashboardStats {
  revenue: RevenueData[];
  ticketTimes: TicketTimeData[];
  inventoryAlerts: { item: string; status: string; quantity: string }[];
  summary: {
    totalOrders: number;
    averageTicketTime: string;
    dailyRevenue: string;
    activeTables: number;
  };
}

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
        averageTicketTime: "N/A",
        dailyRevenue: "$0",
        activeTables: 0,
      },
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-6 duration-500 md:p-8">
      <LiveRefresher />
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Kitchen Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Real-time metrics and operations overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Daily Revenue
            </CardTitle>
            <CircleDollarSign className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.dailyRevenue}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              +14% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Total Orders
            </CardTitle>
            <Activity className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.totalOrders}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              +8% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Avg Ticket Time
            </CardTitle>
            <Clock className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.averageTicketTime}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              -2m from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-muted-foreground text-sm font-medium">
              Active Tables
            </CardTitle>
            <Users className="text-primary h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.summary.activeTables}
            </div>
            <p className="text-muted-foreground mt-1 text-xs">82% capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={stats.revenue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ticket Times (Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketTimeChart data={stats.ticketTimes} />
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.inventoryAlerts.map((alert, idx) => (
                <div
                  key={idx}
                  className="bg-muted/50 border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex flex-col">
                    <span className="text-foreground font-semibold">
                      {alert.item}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Remaining: {alert.quantity}
                    </span>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      alert.status === "Critical"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {alert.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
