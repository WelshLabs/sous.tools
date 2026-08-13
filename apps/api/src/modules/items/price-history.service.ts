import { Injectable } from "@nestjs/common";
import { supabase } from "../../lib/supabase";

export interface RecordPriceDto {
  itemId: string;
  orgId: string;
  purchaseUnit: string;
  unitCost: number;
  vendorId?: string;
  purchaseOrderId?: string;
  effectiveDate?: string;
  note?: string;
}

@Injectable()
export class PriceHistoryService {
  async recordPrice(dto: RecordPriceDto): Promise<void> {
    const { error } = await supabase.from("price_history").insert([
      {
        item_id: dto.itemId,
        organization_id: dto.orgId,
        purchase_unit: dto.purchaseUnit,
        unit_cost: dto.unitCost,
        vendor_id: dto.vendorId || null,
        purchase_order_id: dto.purchaseOrderId || null,
        effective_date:
          dto.effectiveDate || new Date().toISOString().split("T")[0],
        note: dto.note || null,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getHistory(itemId: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("item_id", itemId)
      .order("effective_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }
}
