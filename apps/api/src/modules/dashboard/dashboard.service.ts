import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";
import { DashboardStatsPayload } from "./dashboard.types";

@Injectable()
export class DashboardService {
  async getAggregatedStats(orgId?: string): Promise<DashboardStatsPayload> {
    // 1. Fetch POS orders from Supabase Postgres
    let ordersQuery = supabase.from("pos_orders").select("*");

    if (orgId) {
      ordersQuery = ordersQuery.eq("organization_id", orgId);
    }

    const { data: dbOrders } = await ordersQuery;
    const orders = dbOrders || [];

    // 2. Fetch inventory stock from Supabase Postgres
    let stockQuery = supabase.from("inventory_on_hand").select(`
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
      (o) => o.state === "COMPLETED" || o.state === "CLOSED",
    );

    // Filter for today's completed orders for daily metrics
    const todayStr = new Date().toDateString();
    const todaysCompletedOrders = completedOrders.filter(
      (o) => o.created_at && new Date(o.created_at).toDateString() === todayStr,
    );

    // Calculate actual total daily revenue
    const totalRevenueVal = todaysCompletedOrders.reduce(
      (sum, o) => sum + Number(o.total_money || 0),
      0,
    );
    const dailyRevenueStr = `$${totalRevenueVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

    // Calculate actual average ticket time for today
    let averageTicketTimeStr = "0m";
    let totalMinutes = 0;
    let timedOrdersCount = 0;
    todaysCompletedOrders.forEach((o) => {
      if (o.closed_at && o.created_at) {
        const diffMs =
          new Date(o.closed_at).getTime() - new Date(o.created_at).getTime();
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

    // Compute weekly revenue breakdown for the past 7 days (ending today)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0); // Start of today
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // Go back 6 days to get a 7-day window

    // Initialize array of last 7 days in chronological order
    const daysOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyBuckets: {
      dateStr: string;
      label: string;
      value: number;
      sales: number;
      tax: number;
      tips: number;
      processingFee: number;
    }[] = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toDateString(); // e.g. "Tue Aug 11 2026"
      const label = `${daysOfWeekNames[d.getDay()]} ${d.getMonth() + 1}/${d.getDate()}`;
      dailyBuckets.push({
        dateStr,
        label,
        value: 0,
        sales: 0,
        tax: 0,
        tips: 0,
        processingFee: 0,
      });
    }

    completedOrders.forEach((o) => {
      const orderDateStr = new Date(o.created_at).toDateString();
      const bucket = dailyBuckets.find((b) => b.dateStr === orderDateStr);
      if (bucket) {
        bucket.value +=
          Number(o.total_money || 0) + Number((o as any).total_tip_money || 0);
        bucket.tax += Number(o.total_tax_money || 0);
        bucket.tips += Number((o as any).total_tip_money || 0);
        bucket.processingFee += Number(
          (o as any).total_processing_fee_money || 0,
        );
        bucket.sales +=
          Number(o.total_money || 0) - Number(o.total_tax_money || 0);
      }
    });

    const revenueChartData = dailyBuckets.map((b) => ({
      name: b.label,
      value: Math.round(b.value),
      sales: Math.round(b.sales),
      tax: Math.round(b.tax),
      tips: Math.round(b.tips),
      processingFee: -Math.round(b.processingFee), // Negative value for the chart
    }));

    // Compute hourly ticket times from TODAY'S real orders
    const hoursMap: Record<string, { total: number; count: number }> = {};
    // Pre-populate hours to ensure chart renders a line/axis
    for (let i = 8; i <= 22; i++) {
      const h = `${String(i).padStart(2, "0")}:00`;
      hoursMap[h] = { total: 0, count: 0 };
    }

    todaysCompletedOrders.forEach((o) => {
      if (o.closed_at && o.created_at) {
        const hour = `${String(new Date(o.created_at).getHours()).padStart(2, "0")}:00`;
        const diffMs =
          new Date(o.closed_at).getTime() - new Date(o.created_at).getTime();
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
        minutes:
          hoursMap[hour].count > 0
            ? Math.round(hoursMap[hour].total / hoursMap[hour].count)
            : 0,
      }))
      .sort((a, b) => a.time.localeCompare(b.time));

    // Real inventory low stock alerts
    const alerts = (dbStock || [])
      .filter((s: any) => s.quantity_g < 10000)
      .map((s: any) => {
        const itemName =
          s.items?.[0]?.name || s.items?.name || "Inventory Item";
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
        totalOrders: todaysCompletedOrders.length,
        averageTicketTime: averageTicketTimeStr,
        dailyRevenue: dailyRevenueStr,
        activeTables: activeTablesCount,
      },
    };
  }
}
