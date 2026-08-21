/* eslint-disable max-lines */
"use client";

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

export interface DashboardViewProps {
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
          {isUpdating && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-400" />
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Card
              key={idx}
              className={`group relative overflow-hidden transition-all duration-300 ${
                card.neon
                  ? "border-sky-500/30 bg-gradient-to-br from-sky-500/10 via-zinc-900/40 to-zinc-900/80 shadow-[0_0_25px_rgba(56,189,248,0.15)] hover:border-sky-500/50"
                  : "hover:border-black/15 dark:hover:border-white/15"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                  {card.title}
                </CardTitle>
                <div
                  className={`rounded-xl p-2.5 transition-colors ${
                    card.neon
                      ? "bg-sky-500/20 text-sky-400 group-hover:bg-sky-500/30"
                      : "bg-black/5 text-zinc-500 group-hover:text-zinc-900 dark:bg-white/5 dark:text-zinc-400 dark:group-hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {card.value}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
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

      {/* Inventory & Real-Time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold tracking-wider uppercase">
            Operational Discrepancies & Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-black/5 dark:divide-white/5">
            {stats.inventoryAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      alert.status === "CRITICAL"
                        ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                        : alert.status === "WARNING"
                          ? "bg-amber-500"
                          : "bg-sky-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
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
