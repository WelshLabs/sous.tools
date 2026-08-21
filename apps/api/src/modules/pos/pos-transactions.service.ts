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

@Injectable()
export class PosTransactionsService {
  constructor(@Optional() private dashboardService?: DashboardService) {}

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
        await this.dashboardService.triggerDashboardUpdate(orgId);
      } catch (err) {
        console.error("Failed to trigger dashboard update:", err);
      }
    }

    return data;
  }

  async completeOrder(orderId: string, orgId: string) {
    const { data, error } = await supabase
      .from("pos_orders")
      .update({
        state: "COMPLETED",
        closed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select();

    if (error) {
      console.error("Failed to complete pos_order:", error);
      throw error;
    }

    if (this.dashboardService) {
      try {
        await this.dashboardService.triggerDashboardUpdate(orgId);
      } catch (err) {
        console.error("Failed to trigger dashboard update:", err);
      }
    }

    return data;
  }

  async updateLineItemStatus(lineItemId: string, status: string) {
    const { data, error } = await supabase
      .from("pos_order_line_items")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lineItemId)
      .select();

    if (error) {
      console.error("Failed to update pos_order_line_item status:", error);
      throw error;
    }

    return data;
  }
}
