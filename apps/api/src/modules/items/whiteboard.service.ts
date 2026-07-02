import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateWhiteboardItemDto {
  raw_name: string;
}

@Injectable()
export class WhiteboardService {
  private readonly defaultOrgId = 'd0000000-0000-0000-0000-000000000000';

  async findAllActive(): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('whiteboard_items')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async create(dto: CreateWhiteboardItemDto): Promise<Record<string, unknown>> {
    const { data: orgData } = await supabase
      .from('organizations')
      .select('id')
      .limit(1)
      .single();
      
    const orgId = orgData?.id || this.defaultOrgId;

    const { data, error } = await supabase
      .from('whiteboard_items')
      .insert([
        {
          organization_id: orgId,
          raw_name: dto.raw_name,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('whiteboard_items')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
