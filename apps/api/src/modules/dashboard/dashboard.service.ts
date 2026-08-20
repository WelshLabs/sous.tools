import { Injectable } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import { DashboardStatsPayload } from "./dashboard.types";
import { pubSub } from "../../graphql/pubsub";

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

    const todayStr = new Date().toDateString();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    const isDateToday = (d?: string | null) =>
      d ? new Date(d).toDateString() === todayStr : false;
    const isDateYesterday = (d?: string | null) =>
      d ? new Date(d).toDateString() === yesterdayStr : false;

    // Filter for today's completed orders
    const todaysCompletedOrders = completedOrders.filter(
      (o) =>
        isDateToday(o.created_at) ||
        isDateToday(o.closed_at) ||
        isDateToday(o.updated_at),
    );

    // Filter for yesterday's completed orders
    const yesterdaysCompletedOrders = completedOrders.filter(
      (o) =>
        isDateYesterday(o.created_at) ||
        isDateYesterday(o.closed_at) ||
        isDateYesterday(o.updated_at),
    );

    // Helper: calculate net food/drink sales (excluding taxes and tips)
    const getOrderSales = (o: any): number => {
      const total = Number(o.total_money || 0);
      const tax = Number(o.total_tax_money || 0);
      const tips = Number((o as any).total_tip_money || 0);
      return Math.max(0, total - tax - tips);
    };

    // Calculate actual total daily revenue (sales only, excluding taxes and tips)
    const todaySalesVal = todaysCompletedOrders.reduce(
      (sum, o) => sum + getOrderSales(o),
      0,
    );
    const yesterdaySalesVal = yesterdaysCompletedOrders.reduce(
      (sum, o) => sum + getOrderSales(o),
      0,
    );

    const dailyRevenueStr = `$${todaySalesVal.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    let dailyRevenueChangeStr = "0% from yesterday";
    if (yesterdaySalesVal > 0) {
      const pct = Math.round(
        ((todaySalesVal - yesterdaySalesVal) / yesterdaySalesVal) * 100,
      );
      dailyRevenueChangeStr = `${pct >= 0 ? `+${pct}%` : `${pct}%`} from yesterday`;
    } else if (todaySalesVal > 0) {
      dailyRevenueChangeStr = `+$${todaySalesVal.toFixed(2)} from yesterday`;
    }

    // Calculate total orders and change comparison
    const todayOrdersCount = todaysCompletedOrders.length;
    const yesterdayOrdersCount = yesterdaysCompletedOrders.length;
    let totalOrdersChangeStr = "0% from yesterday";
    if (yesterdayOrdersCount > 0) {
      const pct = Math.round(
        ((todayOrdersCount - yesterdayOrdersCount) / yesterdayOrdersCount) *
          100,
      );
      totalOrdersChangeStr = `${pct >= 0 ? `+${pct}%` : `${pct}%`} from yesterday`;
    } else if (todayOrdersCount > 0) {
      totalOrdersChangeStr = `+${todayOrdersCount} from yesterday`;
    }

    // Helper: compute order duration in minutes
    const getOrderDurationMin = (o: any): number | null => {
      if (!o.created_at) return null;
      const endTime = o.closed_at || o.updated_at;
      if (!endTime) return null;
      const diffMs =
        new Date(endTime).getTime() - new Date(o.created_at).getTime();
      const diffMin = diffMs / (60 * 1000);
      if (diffMin >= 0 && diffMin < 180) {
        return diffMin;
      }
      return null;
    };

    // Calculate actual average ticket time for today
    let todayTotalMinutes = 0;
    let todayTimedCount = 0;
    todaysCompletedOrders.forEach((o) => {
      const dur = getOrderDurationMin(o);
      if (dur !== null) {
        todayTotalMinutes += dur;
        todayTimedCount++;
      }
    });

    // If no timed orders today, check all recent completed orders as fallback
    if (todayTimedCount === 0 && completedOrders.length > 0) {
      completedOrders.forEach((o) => {
        const dur = getOrderDurationMin(o);
        if (dur !== null) {
          todayTotalMinutes += dur;
          todayTimedCount++;
        }
      });
    }

    const todayAvgTicketMin =
      todayTimedCount > 0 ? Math.round(todayTotalMinutes / todayTimedCount) : 0;
    const averageTicketTimeStr = `${todayAvgTicketMin}m`;

    // Yesterday's avg ticket time for comparison
    let yesterdayTotalMinutes = 0;
    let yesterdayTimedCount = 0;
    yesterdaysCompletedOrders.forEach((o) => {
      const dur = getOrderDurationMin(o);
      if (dur !== null) {
        yesterdayTotalMinutes += dur;
        yesterdayTimedCount++;
      }
    });
    const yesterdayAvgTicketMin =
      yesterdayTimedCount > 0
        ? Math.round(yesterdayTotalMinutes / yesterdayTimedCount)
        : 0;

    let averageTicketTimeChangeStr = "0m from yesterday";
    if (yesterdayTimedCount > 0 && todayTimedCount > 0) {
      const diff = todayAvgTicketMin - yesterdayAvgTicketMin;
      averageTicketTimeChangeStr = `${diff >= 0 ? `+${diff}m` : `${diff}m`} from yesterday`;
    } else {
      averageTicketTimeChangeStr = `${todayAvgTicketMin}m avg today`;
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
      const orderDateStr = new Date(
        o.created_at || o.updated_at || "",
      ).toDateString();
      const bucket = dailyBuckets.find((b) => b.dateStr === orderDateStr);
      if (bucket) {
        const tax = Number(o.total_tax_money || 0);
        const tips = Number((o as any).total_tip_money || 0);
        const fee = Number((o as any).total_processing_fee_money || 0);
        const total = Number(o.total_money || 0);
        const sales = Math.max(0, total - tax - tips);

        bucket.value += total;
        bucket.tax += tax;
        bucket.tips += tips;
        bucket.processingFee += fee;
        bucket.sales += sales;
      }
    });

    const revenueChartData = dailyBuckets.map((b) => ({
      name: b.label,
      value: Number(b.value.toFixed(2)),
      sales: Number(b.sales.toFixed(2)),
      tax: Number(b.tax.toFixed(2)),
      tips: Number(b.tips.toFixed(2)),
      processingFee: -Number(b.processingFee.toFixed(2)), // Negative value for the chart
    }));

    // Compute hourly ticket times from today's orders (or recent fallback)
    const hoursMap: Record<string, { total: number; count: number }> = {};
    for (let i = 8; i <= 22; i++) {
      const h = `${String(i).padStart(2, "0")}:00`;
      hoursMap[h] = { total: 0, count: 0 };
    }

    const ordersForTicketChart =
      todaysCompletedOrders.length > 0
        ? todaysCompletedOrders
        : completedOrders;

    ordersForTicketChart.forEach((o) => {
      const dur = getOrderDurationMin(o);
      if (dur !== null && o.created_at) {
        const hourNum = new Date(o.created_at).getHours();
        const hour = `${String(hourNum).padStart(2, "0")}:00`;
        if (!hoursMap[hour]) {
          hoursMap[hour] = { total: 0, count: 0 };
        }
        hoursMap[hour].total += dur;
        hoursMap[hour].count++;
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
    const activeTablesSubtitle = `${activeTablesCount} active ${
      activeTablesCount === 1 ? "order" : "orders"
    }`;

    return {
      revenue: revenueChartData,
      ticketTimes: hourlyTicketTimes,
      inventoryAlerts: alerts.slice(0, 10),
      summary: {
        totalOrders: todayOrdersCount,
        averageTicketTime: averageTicketTimeStr,
        dailyRevenue: dailyRevenueStr,
        activeTables: activeTablesCount,
        dailyRevenueChange: dailyRevenueChangeStr,
        totalOrdersChange: totalOrdersChangeStr,
        averageTicketTimeChange: averageTicketTimeChangeStr,
        activeTablesSubtitle: activeTablesSubtitle,
      },
    };
  }

  async publishStatsUpdate(orgId?: string): Promise<void> {
    try {
      const stats = await this.getAggregatedStats(orgId);
      pubSub.publish("DASHBOARD_STATS_UPDATED", {
        dashboardStatsUpdated: stats,
        orgId,
      });
    } catch (err) {
      console.error("Failed to publish dashboard stats update:", err);
    }
  }
}
