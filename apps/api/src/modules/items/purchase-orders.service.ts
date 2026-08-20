import { Injectable } from "@nestjs/common";
import { supabase } from "../../core/database/supabase";

export interface AddItemToDraftDto {
  vendor_id: string;
  raw_name: string;
  ordered_qty: number;
}

export interface UpdatePoItemDto {
  ordered_qty?: number;
}

@Injectable()
export class PurchaseOrdersService {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  private async getOrgId(): Promise<string> {
    const { data: orgData } = await supabase
      .from("organizations")
      .select("id")
      .limit(1)
      .single();
    return orgData?.id || this.defaultOrgId;
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from("purchase_orders")
      .select(
        `
        *,
        vendors (*),
        purchase_order_items (*)
      `,
      )
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("purchase_orders")
      .select(
        `
        *,
        vendors (*),
        purchase_order_items (*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async addItemToDraft(
    dto: AddItemToDraftDto,
  ): Promise<Record<string, unknown>> {
    const orgId = await this.getOrgId();

    // Find existing DRAFT PO for this vendor
    let { data: po } = await supabase
      .from("purchase_orders")
      .select("id")
      .eq("organization_id", orgId)
      .eq("vendor_id", dto.vendor_id)
      .eq("status", "DRAFT")
      .single();

    // If none exists, create one
    if (!po) {
      const { data: newPo, error: createErr } = await supabase
        .from("purchase_orders")
        .insert([
          {
            organization_id: orgId,
            vendor_id: dto.vendor_id,
            status: "DRAFT",
          },
        ])
        .select("id")
        .single();

      if (createErr) throw new Error(createErr.message);
      po = newPo;
    }

    // Insert the item
    const { data: insertedItem, error: itemErr } = await supabase
      .from("purchase_order_items")
      .insert([
        {
          po_id: po.id,
          raw_name: dto.raw_name,
          ordered_qty: dto.ordered_qty || 1,
          price_per_unit: 0,
        },
      ])
      .select()
      .single();

    if (itemErr) throw new Error(itemErr.message);
    return insertedItem;
  }

  async updateItem(
    itemId: string,
    dto: UpdatePoItemDto,
  ): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("purchase_order_items")
      .update(dto)
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async removeItem(itemId: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("purchase_order_items")
      .delete()
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // If the PO has no more items, we could optionally delete the PO here.
    return data;
  }

  async submitPo(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("purchase_orders")
      .update({ status: "SUBMITTED" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  async receivePo(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from("purchase_orders")
      .update({ status: "RECEIVED" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
}
