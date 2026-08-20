import React from "react";
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

export interface DashboardStats {
  revenue: RevenueData[];
  ticketTimes: TicketTimeData[];
  inventoryAlerts: { item: string; status: string; quantity: string }[];
  summary: {
    totalOrders: number;
    averageTicketTime: string;
    dailyRevenue: string;
    activeTables: number;
    dailyRevenueChange?: string;
    totalOrdersChange?: string;
    averageTicketTimeChange?: string;
    activeTablesSubtitle?: string;
  };
}

interface DashboardViewProps {
  stats: DashboardStats;
  isLive?: boolean;
  isUpdating?: boolean;
}

export function DashboardView({
  stats,
  isLive = false,
  isUpdating = false,
}: DashboardViewProps) {
  const cards = [
    {
      title: "Daily Revenue",
      value: stats.summary.dailyRevenue,
      change: stats.summary.dailyRevenueChange || "0% from yesterday",
      icon: CircleDollarSign,
      neon: true,
    },
    {
      title: "Total Orders",
      value: stats.summary.totalOrders,
      change: stats.summary.totalOrdersChange || "0% from yesterday",
      icon: Activity,
      neon: false,
    },
    {
      title: "Avg Ticket Time",
      value: stats.summary.averageTicketTime,
      change: stats.summary.averageTicketTimeChange || "0m from yesterday",
      icon: Clock,
      neon: false,
    },
    {
      title: "Active Tables",
      value: stats.summary.activeTables,
      change:
        stats.summary.activeTablesSubtitle ||
        `${stats.summary.activeTables} active`,
      icon: Users,
      neon: false,
    },
  ];

  return (
    <div className="animate-in fade-in mx-auto w-full max-w-7xl space-y-8 p-6 duration-500 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Dashboard
          </h1>
          <p className="dark:text-muted-foreground mt-1 text-sm text-zinc-500">
            Real-time sales, order velocity, and inventory metrics.
          </p>
        </div>
        {isLive && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span>Live Subscription</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className={`transition-all duration-300 ${
                card.neon ? "neon-border" : ""
              }${isUpdating ? "ring-2 ring-cyan-500/50" : ""}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="text-primary h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold tracking-tight transition-all duration-500">
                  {card.value}
                </div>
                <p className="text-muted-foreground mt-1 text-xs font-medium">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
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
              {stats.inventoryAlerts.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-sm">
                  No critical inventory alerts at this time.
                </p>
              ) : (
                stats.inventoryAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 border-border hover:bg-muted/70 flex items-center justify-between rounded-lg border p-4 transition-all"
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
