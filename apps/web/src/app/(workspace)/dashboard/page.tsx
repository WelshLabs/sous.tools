import React from "react";
import { config } from "@soustools/config";
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

export const dynamic = 'force-dynamic';

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

async function getDashboardStats(): Promise<DashboardStats> {
  const baseUrl = config.API_BASE_URL;
  try {
    const res = await fetch(`${baseUrl}/dashboard/stats`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch dashboard stats: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error("Dashboard fetch error:", err);
    // Return fallback mock data if API is down
    return {
      revenue: [],
      ticketTimes: [],
      inventoryAlerts: [],
      summary: {
        totalOrders: 0,
        averageTicketTime: 'N/A',
        dailyRevenue: '$0',
        activeTables: 0,
      }
    };
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Kitchen Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Real-time metrics and operations overview.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="neon-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Daily Revenue
            </CardTitle>
            <CircleDollarSign className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.dailyRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">+14% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">+8% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Ticket Time
            </CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.averageTicketTime}</div>
            <p className="text-xs text-muted-foreground mt-1">-2m from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Tables
            </CardTitle>
            <Users className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.summary.activeTables}</div>
            <p className="text-xs text-muted-foreground mt-1">82% capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
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
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{alert.item}</span>
                    <span className="text-xs text-muted-foreground">Remaining: {alert.quantity}</span>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                    alert.status === 'Critical' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-primary/10 text-primary'
                  }`}>
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
