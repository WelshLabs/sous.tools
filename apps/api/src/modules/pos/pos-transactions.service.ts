import { Injectable, Optional } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";
import { DashboardService } from "../dashboard/dashboard.service";

export interface RecordTransactionDto {
  orgId: string;
  posItemId?: string;
  quantitySold: number;
  grossRevenue: number;
  transactionTime: string;
  source?: string;
  externalTransactionId?: string;
}

export interface VelocityRow {
  posItemId: string;
  units: number;
  revenue: number;
}

@Injectable()
export class PosTransactionsService {
  constructor(@Optional() private dashboardService?: DashboardService) {}

  async recordTransaction(dto: RecordTransactionDto): Promise<void> {
    const { error } = await supabase.from("pos_transactions").insert([
      {
        organization_id: dto.orgId,
        pos_item_id: dto.posItemId || null,
        quantity_sold: dto.quantitySold,
        gross_revenue: dto.grossRevenue,
        transaction_time: dto.transactionTime,
        source: dto.source || "square",
        external_transaction_id: dto.externalTransactionId || null,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    if (this.dashboardService) {
      try {
        await this.dashboardService.publishStatsUpdate(dto.orgId);
      } catch (err) {
        console.error("Failed to trigger dashboard update:", err);
      }
    }
  }

  async recordSale(dto: RecordTransactionDto) {
    const {
      orgId,
      posItemId,
      quantitySold,
      grossRevenue,
      transactionTime,
      source = "manual",
      externalTransactionId,
    } = dto;

    const { data, error } = await supabase.from("pos_transactions").insert({
      org_id: orgId,
      pos_item_id: posItemId,
      quantity_sold: quantitySold,
      gross_revenue: grossRevenue,
      transaction_time: transactionTime,
      source,
      external_transaction_id: externalTransactionId,
    });

    if (error) {
      console.error("Failed to record pos_transaction:", error);
      throw error;
    }

    if (this.dashboardService) {
      try {
        await this.dashboardService.publishStatsUpdate(orgId);
      } catch (err) {
        console.error("Failed to trigger dashboard update:", err);
      }
    }

    return data;
  }

  async getSalesVelocity(orgId: string, days: 7 | 30): Promise<VelocityRow[]> {
    const tableName = days === 7 ? "sales_velocity_7d" : "sales_velocity_30d";
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .eq("organization_id", orgId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(
      (row: {
        pos_item_id: string;
        units_7d?: number;
        units_30d?: number;
        revenue_7d?: number;
        revenue_30d?: number;
      }) => ({
        posItemId: row.pos_item_id,
        units: Number(days === 7 ? row.units_7d : row.units_30d) || 0,
        revenue: Number(days === 7 ? row.revenue_7d : row.revenue_30d) || 0,
      }),
    );
  }

  async completeOrder(orderId: string, orgId: string): Promise<void> {
    const closedAt = new Date().toISOString();
    const { error: orderError } = await supabase
      .from("pos_orders")
      .update({ state: "COMPLETED", closed_at: closedAt })
      .eq("id", orderId)
      .eq("organization_id", orgId);

    if (orderError) {
      throw new Error(orderError.message);
    }

    await supabase
      .from("pos_order_line_items")
      .update({ status: "COMPLETED", updated_at: closedAt })
      .eq("pos_order_id", orderId);

    const { data: lineItems } = await supabase
      .from("pos_order_line_items")
      .select("*")
      .eq("pos_order_id", orderId);

    if (lineItems && lineItems.length > 0) {
      const txRows = lineItems.map((item: any) => ({
        organization_id: orgId,
        pos_item_id: item.pos_item_id || null,
        quantity_sold: Number(item.quantity || 1),
        gross_revenue: Number(
          item.gross_sales_money || item.base_price_money || 0,
        ),
        transaction_time: closedAt,
        source: "kds",
      }));

      await supabase.from("pos_transactions").insert(txRows);
    }

    if (this.dashboardService) {
      try {
        await this.dashboardService.publishStatsUpdate(orgId);
      } catch (err) {
        console.error("Failed to trigger dashboard update:", err);
      }
    }
  }

  async updateLineItemStatus(
    lineItemId: string,
    status: string,
  ): Promise<void> {
    const { error } = await supabase
      .from("pos_order_line_items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", lineItemId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
