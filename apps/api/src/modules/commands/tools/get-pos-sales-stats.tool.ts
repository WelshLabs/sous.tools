import { randomUUID } from "crypto";
import { supabase } from "../../../core/database/supabase";
import { Command } from "../command.decorator";
import { CommandTool, CommandExecutionContext } from "../command.interface";
import { getPosSalesStatsTool } from "../commands-tools";

@Command(getPosSalesStatsTool)
export class GetPosSalesStatsTool implements CommandTool {
  async execute(_args: any, context: CommandExecutionContext) {
    const agentMessageContent = `Querying real POS sales from Postgres database...`;
    if (context.emitMessage) {
      context.emitMessage({
        id: randomUUID(),
        role: "agent_step",
        content: agentMessageContent,
        timestamp: new Date(),
      });
    }

    const { data: dbOrders } = await supabase
      .from("pos_orders")
      .select("*")
      .eq("state", "COMPLETED");

    const orders = dbOrders || [];
    const totalRevenueVal = orders.reduce(
      (sum, o) => sum + Number(o.total_money || 0),
      0,
    );

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyRevenueMap: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };
    orders.forEach((o) => {
      const day = daysOfWeek[new Date(o.created_at).getDay()];
      weeklyRevenueMap[day] =
        (weeklyRevenueMap[day] || 0) + Number(o.total_money || 0);
    });

    const orderedDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const revenueChartData = orderedDays.map((day) => ({
      name: day,
      value: Math.round(weeklyRevenueMap[day] || 0),
    }));

    return {
      success: true,
      totalRevenue: totalRevenueVal.toFixed(2),
      totalCompletedOrders: orders.length,
      weeklyBreakdown: revenueChartData,
    };
  }
}
