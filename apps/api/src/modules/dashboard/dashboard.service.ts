import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { DashboardStatsPayload } from "./dashboard.types";

@Injectable()
export class DashboardService {
  async getAggregatedStats(orgId?: string): Promise<DashboardStatsPayload> {
    // 1. Fetch POS orders from Supabase Postgres
    let ordersQuery = supabase
      .from("pos_orders")
      .select(`
        *,
        pos_order_line_items (
          id,
          name,
          quantity,
          total_money,
          master_item_id,
          master_items (
            id,
            name,
            sku,
            category
          )
        )
      `);

    if (orgId) {
      ordersQuery = ordersQuery.eq("organization_id", orgId);
    }

    const { data: dbOrders } = await ordersQuery;
    const orders = dbOrders || [];

    // 2. Fetch inventory stock from Supabase Postgres
    let stockQuery = supabase
      .from("inventory_on_hand")
      .select(`
        id,
        item_id,
        quantity_g,
        items (
          name
        )
      `);

    if (orgId) {
      stockQuery = stockQuery.eq("organization_id", orgId);
    }

    const { data: dbStock } = await stockQuery;

    const completedOrders = orders.filter(
      (o) => o.state === "COMPLETED" || o.state === "CLOSED"
    );

    // Calculate actual total revenue
    const totalRevenueVal = completedOrders.reduce(
      (sum, o) => sum + Number(o.total_money || 0),
      0
    );
    const dailyRevenueStr = `$${totalRevenueVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

    // Calculate actual average ticket time
    let averageTicketTimeStr = "0m";
    let totalMinutes = 0;
    let timedOrdersCount = 0;
    completedOrders.forEach((o) => {
      if (o.closed_at && o.created_at) {
        const diffMs = new Date(o.closed_at).getTime() - new Date(o.created_at).getTime();
        const diffMin = diffMs / (60 * 1000);
        if (diffMin > 0 && diffMin < 180) {
          totalMinutes += diffMin;
          timedOrdersCount++;
        }
      }
    });
    if (timedOrdersCount > 0) {
      averageTicketTimeStr = `${Math.round(totalMinutes / timedOrdersCount)}m`;
    }

    // Compute weekly revenue breakdown from real orders
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyRevenueMap: Record<string, number> = {
      Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0
    };
    completedOrders.forEach((o) => {
      const day = daysOfWeek[new Date(o.created_at).getDay()];
      weeklyRevenueMap[day] = (weeklyRevenueMap[day] || 0) + Number(o.total_money || 0);
    });

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revenueChartData = orderedDays.map((day) => ({
      name: day,
      value: Math.round(weeklyRevenueMap[day] || 0),
    }));

    // Compute hourly ticket times from real orders
    const hoursMap: Record<string, { total: number; count: number }> = {};
    completedOrders.forEach((o) => {
      if (o.closed_at && o.created_at) {
        const hour = `${String(new Date(o.created_at).getHours()).padStart(2, "0")}:00`;
        const diffMs = new Date(o.closed_at).getTime() - new Date(o.created_at).getTime();
        const diffMin = diffMs / (60 * 1000);
        if (diffMin > 0) {
          if (!hoursMap[hour]) hoursMap[hour] = { total: 0, count: 0 };
          hoursMap[hour].total += diffMin;
          hoursMap[hour].count++;
        }
      }
    });

    const hourlyTicketTimes = Object.keys(hoursMap)
      .map((hour) => ({
        time: hour,
        minutes: Math.round(hoursMap[hour].total / hoursMap[hour].count),
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    // Real inventory low stock alerts
    const alerts = (dbStock || [])
      .filter((s: any) => s.quantity_g < 10000)
      .map((s: any) => {
        const itemName = s.items?.[0]?.name || s.items?.name || "Inventory Item";
        const quantityKg = (s.quantity_g / 1000).toFixed(1) + "kg";
        const isCritical = s.quantity_g < 3000;
        return {
          item: itemName,
          status: isCritical ? "Critical" : "Low",
          quantity: quantityKg,
        };
      });

    const activeTablesCount = orders.filter((o) => o.state === "OPEN").length;

    return {
      revenue: revenueChartData,
      ticketTimes: hourlyTicketTimes,
      inventoryAlerts: alerts.slice(0, 10),
      summary: {
        totalOrders: orders.length,
        averageTicketTime: averageTicketTimeStr,
        dailyRevenue: dailyRevenueStr,
        activeTables: activeTablesCount,
      },
    };
  }
}
