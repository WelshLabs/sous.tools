import { Injectable } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface RecordWastageDto {
  orgId: string;
  itemId: string;
  amountG: number;
  reason?: string;
  recordedBy?: string;
}

export interface WastageReportRow {
  id: string;
  itemId: string;
  itemName: string;
  amountG: number;
  reason: string | null;
  recordedAt: string;
}

@Injectable()
export class WastageService {
  async recordWastage(dto: RecordWastageDto): Promise<void> {
    const { error } = await supabase
      .from('wastage_ledger')
      .insert([
        {
          organization_id: dto.orgId,
          item_id: dto.itemId,
          amount_g: dto.amountG,
          reason: dto.reason || 'OTHER',
          recorded_by: dto.recordedBy || null,
        },
      ]);

    if (error) {
      throw new Error(error.message);
    }
  }

  async getWastageReport(
    orgId: string,
    startDate: string,
    endDate: string
  ): Promise<WastageReportRow[]> {
    const { data, error } = await supabase
      .from('wastage_ledger')
      .select('id, item_id, amount_g, reason, recorded_at, items (name)')
      .eq('organization_id', orgId)
      .gte('recorded_at', startDate)
      .lte('recorded_at', endDate)
      .order('recorded_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      itemId: row.item_id,
      itemName: row.items?.name || 'Unknown',
      amountG: row.amount_g,
      reason: row.reason,
      recordedAt: row.recorded_at,
    }));
  }
}
