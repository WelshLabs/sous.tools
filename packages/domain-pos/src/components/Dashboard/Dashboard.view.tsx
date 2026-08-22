"use client";

import {
  RevenueChart,
  TicketTimeChart,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  type RevenueData,
  type TicketTimeData,
} from "@soustools/design-system";
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

export interface DashboardViewProps {
  stats: DashboardStats;
  isLive?: boolean;
  isUpdating?: boolean;
}

export function DashboardView({
  stats,
  isLive = false,
  isUpdating: _isUpdating = false,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Operations Pulse
          </h1>
          <p className="dark:text-muted-foreground mt-1 text-sm text-zinc-500">
            Real-time telemetry and revenue performance across stations.
          </p>
        </div>

        {/* Live Indicator Badge */}
        <div className="flex items-center gap-2 rounded-full border border-black/5 bg-zinc-100/50 px-3 py-1.5 backdrop-blur-md dark:border-white/5 dark:bg-zinc-900/50">
          <span className="relative flex h-2.5 w-2.5">
            {isLive && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                isLive ? "bg-emerald-500" : "bg-zinc-500"
              }`}
            />
          </span>
          <span className="dark:text-muted-foreground font-mono text-xs font-semibold tracking-wider text-zinc-500 uppercase">
            {isLive ? "Live Sync" : "Connecting"}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="relative overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {card.title}
                </CardTitle>
                <div className="rounded-xl border border-black/5 bg-zinc-100 p-2 dark:border-white/5 dark:bg-zinc-900">
                  <Icon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                  {card.value}
                </div>
                <p className="dark:text-muted-foreground mt-1 text-xs text-zinc-500">
                  {card.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart data={stats.revenue} />
        <TicketTimeChart data={stats.ticketTimes} />
      </div>

      {/* Inventory Alerts Panel */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold tracking-wider uppercase">
            Critical Inventory Signals
          </CardTitle>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-400">
            {stats.inventoryAlerts.length} Action Items
          </span>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {stats.inventoryAlerts.map((alert) => (
              <div
                key={alert.item}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {alert.item}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground font-mono text-xs">
                    {alert.quantity} remaining
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                      alert.status === "CRITICAL"
                        ? "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                        : alert.status === "WARNING"
                          ? "border border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : "border border-sky-500/20 bg-sky-500/10 text-sky-400"
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
DashboardView.displayName = "DashboardView";
