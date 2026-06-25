import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface AdjustStockDto {
  orgId: string;
  itemId: string;
  quantityG: number;
  lotNumber?: string;
  lotExpiry?: string;
  location?: string;
}

export interface StockRow {
  id: string;
  itemId: string;
  itemName: string;
  quantityG: number;
  lotNumber: string | null;
  lotExpiry: string | null;
  location: string | null;
  daysUntilExpiry: number | null;
  currentCostPerG: number | null;
  purchaseUnit: string;
  eachWeightG: number | null;
}

@Injectable()
export class InventoryService {
  async getCurrentStock(orgId: string): Promise<StockRow[]> {
    const { data, error } = await supabase
      .from('inventory_on_hand')
      .select(`
        id,
        item_id,
        quantity_g,
        lot_number,
        lot_expiry,
        location,
        items (
          name,
          shelf_life_days,
          each_weight_g,
          purchase_unit,
          current_cost_per_g
        )
      `)
      .eq('organization_id', orgId);

    if (error) {
      throw new Error(error.message);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stocks: StockRow[] = (data || []).map((row: any) => {
      let daysUntilExpiry: number | null = null;
      if (row.lot_expiry) {
        const expiry = new Date(row.lot_expiry);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      return {
        id: row.id,
        itemId: row.item_id,
        itemName: row.items?.name || 'Unknown',
        quantityG: row.quantity_g,
        lotNumber: row.lot_number,
        lotExpiry: row.lot_expiry,
        location: row.location,
        daysUntilExpiry,
        currentCostPerG: row.items?.current_cost_per_g || null,
        purchaseUnit: row.items?.purchase_unit || 'LB',
        eachWeightG: row.items?.each_weight_g || null,
      };
    });

    return stocks.sort((a, b) => {
      if (a.lotExpiry && !b.lotExpiry) return -1;
      if (!a.lotExpiry && b.lotExpiry) return 1;
      if (a.lotExpiry && b.lotExpiry) {
        const ad = new Date(a.lotExpiry).getTime();
        const bd = new Date(b.lotExpiry).getTime();
        if (ad !== bd) return ad - bd;
      }
      return a.itemName.localeCompare(b.itemName);
    });
  }

  async adjustStock(dto: AdjustStockDto): Promise<void> {
    const lotNum = dto.lotNumber || 'default';
    const { error } = await supabase
      .from('inventory_on_hand')
      .upsert({
        organization_id: dto.orgId,
        item_id: dto.itemId,
        quantity_g: dto.quantityG,
        lot_number: lotNum,
        lot_expiry: dto.lotExpiry || null,
        location: dto.location || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,item_id,lot_number',
      });

    if (error) {
      throw new Error(error.message);
    }
  }
}
