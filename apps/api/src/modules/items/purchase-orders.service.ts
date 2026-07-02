import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreatePurchaseOrderDto {
  vendor_id: string;
  items: {
    whiteboard_id: string;
    raw_name: string;
    ordered_qty: number;
    price_per_unit: number;
  }[];
}

@Injectable()
export class PurchaseOrdersService {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  async createPo(dto: CreatePurchaseOrderDto): Promise<Record<string, unknown>> {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();
      
    const orgId = orgData?.id || this.defaultOrgId;

    const { data: po, error: poErr } = await supabase
      .from('purchase_orders')
      .insert([
        {
          organization_id: orgId,
          vendor_id: dto.vendor_id,
          status: 'DRAFT',
        },
      ])
      .select()
      .single();

    if (poErr) {
      throw new Error(poErr.message);
    }

    const itemsToInsert = dto.items.map((i) => ({
      po_id: po.id,
      raw_name: i.raw_name,
      ordered_qty: i.ordered_qty,
      price_per_unit: i.price_per_unit,
    }));

    const { error: itemsErr } = await supabase
      .from('purchase_order_items')
      .insert(itemsToInsert);

    if (itemsErr) {
      throw new Error(itemsErr.message);
    }

    // Mark whiteboard items as inactive
    for (const item of dto.items) {
      await supabase
        .from('whiteboard_items')
        .update({ is_active: false })
        .eq('id', item.whiteboard_id);
    }

    return po;
  }
}
