import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

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
  async recordTransaction(dto: RecordTransactionDto): Promise<void> {
    const { error } = await supabase
      .from('pos_transactions')
      .insert([
        {
          organization_id: dto.orgId,
          pos_item_id: dto.posItemId || null,
          quantity_sold: dto.quantitySold,
          gross_revenue: dto.grossRevenue,
          transaction_time: dto.transactionTime,
          source: dto.source || 'square',
          external_transaction_id: dto.externalTransactionId || null,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getSalesVelocity(orgId: string, days: 7 | 30): Promise<VelocityRow[]> {
    const tableName = days === 7 ? 'sales_velocity_7d' : 'sales_velocity_30d';
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('organization_id', orgId);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: { pos_item_id: string; units_7d?: number; units_30d?: number; revenue_7d?: number; revenue_30d?: number }) => ({
      posItemId: row.pos_item_id,
      units: Number(days === 7 ? row.units_7d : row.units_30d) || 0,
      revenue: Number(days === 7 ? row.revenue_7d : row.revenue_30d) || 0,
    }));
  }
}
