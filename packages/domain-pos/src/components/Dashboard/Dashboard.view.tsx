"use client";

import { useState } from "react";
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
    weeklyOrders?: number;
    allTimeOrders?: number;
    averageTicketTime: string;
    weeklyAverageTicketTime?: string;
    dailyRevenue: string;
    weeklyRevenue?: string;
    allTimeRevenue?: string;
    activeTables: number;
    dailyRevenueChange?: string;
    totalOrdersChange?: string;
    averageTicketTimeChange?: string;
    activeTablesSubtitle?: string;
  };
}

export interface DashboardViewProps {
  stats: DashboardStats;
  isUpdating?: boolean;
}

export function DashboardView({
  stats,
  isUpdating = false,
}: DashboardViewProps) {
  const [revenueRange, setRevenueRange] = useState<"today" | "week" | "all">("today");
  const [ordersRange, setOrdersRange] = useState<"today" | "week" | "all">("today");
  const [speedRange, setSpeedRange] = useState<"today" | "week">("today");
  const [queueMode, setQueueMode] = useState<"active" | "alerts">("active");

  const revenueValue =
    revenueRange === "today"
      ? stats.summary.dailyRevenue
      : revenueRange === "week"
        ? stats.summary.weeklyRevenue || "$0.00"
        : stats.summary.allTimeRevenue || "$0.00";

  const revenueSubtitle =
    revenueRange === "today"
      ? stats.summary.dailyRevenueChange || "Today's net sales"
      : revenueRange === "week"
        ? "Past 7 days total sales"
        : "Lifetime gross sales";

  const ordersValue =
    ordersRange === "today"
      ? stats.summary.totalOrders
      : ordersRange === "week"
        ? stats.summary.weeklyOrders ?? 0
        : stats.summary.allTimeOrders ?? stats.summary.totalOrders;

  const ordersSubtitle =
    ordersRange === "today"
      ? stats.summary.totalOrdersChange || "Today's completed orders"
      : ordersRange === "week"
        ? "7-day order volume"
        : "Lifetime completed orders";

  const speedValue =
    speedRange === "today"
      ? stats.summary.averageTicketTime
      : stats.summary.weeklyAverageTicketTime || stats.summary.averageTicketTime;

  const speedSubtitle =
    speedRange === "today"
      ? stats.summary.averageTicketTimeChange || "Today's ticket average"
      : "7-day kitchen pace";

  const queueValue =
    queueMode === "active"
      ? stats.summary.activeTables
      : stats.inventoryAlerts.length;

  const queueSubtitle =
    queueMode === "active"
      ? stats.summary.activeTablesSubtitle || `${stats.summary.activeTables} active orders`
      : `${stats.inventoryAlerts.length} low stock alerts`;

  return (
    <div className="space-y-6 pt-2">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Revenue */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isUpdating ? "ring-2 ring-cyan-500/50" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {revenueRange === "today"
                  ? "Today's Sales"
                  : revenueRange === "week"
                    ? "7D Revenue"
                    : "All Time Revenue"}
              </CardTitle>
              <div className="flex items-center gap-1">
                {(["today", "week", "all"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRevenueRange(r)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      revenueRange === r
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "text-muted-foreground hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {r === "today" ? "Today" : r === "week" ? "7D" : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-black/5 bg-zinc-100 p-2 dark:border-white/5 dark:bg-zinc-900">
              <CircleDollarSign className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {revenueValue}
            </div>
            <p className="dark:text-muted-foreground mt-1 text-xs text-zinc-500">
              {revenueSubtitle}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Orders */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isUpdating ? "ring-2 ring-cyan-500/50" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {ordersRange === "today"
                  ? "Today's Orders"
                  : ordersRange === "week"
                    ? "7D Orders"
                    : "Total Orders"}
              </CardTitle>
              <div className="flex items-center gap-1">
                {(["today", "week", "all"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setOrdersRange(r)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      ordersRange === r
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "text-muted-foreground hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {r === "today" ? "Today" : r === "week" ? "7D" : "All"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-black/5 bg-zinc-100 p-2 dark:border-white/5 dark:bg-zinc-900">
              <Activity className="h-4 w-4 text-cyan-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {ordersValue}
            </div>
            <p className="dark:text-muted-foreground mt-1 text-xs text-zinc-500">
              {ordersSubtitle}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Avg Ticket Time */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isUpdating ? "ring-2 ring-cyan-500/50" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Avg Ticket Time
              </CardTitle>
              <div className="flex items-center gap-1">
                {(["today", "week"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setSpeedRange(r)}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                      speedRange === r
                        ? "bg-primary/20 text-primary border border-primary/40"
                        : "text-muted-foreground hover:bg-zinc-800 hover:text-zinc-200"
                    }`}
                  >
                    {r === "today" ? "Today" : "7D Avg"}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-black/5 bg-zinc-100 p-2 dark:border-white/5 dark:bg-zinc-900">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {speedValue}
            </div>
            <p className="dark:text-muted-foreground mt-1 text-xs text-zinc-500">
              {speedSubtitle}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Queue / Stock Alerts */}
        <Card
          className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isUpdating ? "ring-2 ring-cyan-500/50" : ""}`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {queueMode === "active" ? "Open Queue" : "Inventory"}
              </CardTitle>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQueueMode("active")}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                    queueMode === "active"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "text-muted-foreground hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setQueueMode("alerts")}
                  className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                    queueMode === "alerts"
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "text-muted-foreground hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
                >
                  Alerts
                </button>
              </div>
            </div>
            <div className="rounded-xl border border-black/5 bg-zinc-100 p-2 dark:border-white/5 dark:bg-zinc-900">
              <Users className="h-4 w-4 text-sky-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              {queueValue}
            </div>
            <p className="dark:text-muted-foreground mt-1 text-xs text-zinc-500">
              {queueSubtitle}
            </p>
          </CardContent>
        </Card>
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
            {stats.inventoryAlerts.length === 0 ? (
              <p className="text-muted-foreground py-4 text-xs italic">
                All inventory levels optimal. No low-stock thresholds exceeded.
              </p>
            ) : (
              stats.inventoryAlerts.map((alert) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
DashboardView.displayName = "DashboardView";
