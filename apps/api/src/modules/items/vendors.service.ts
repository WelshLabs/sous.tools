import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateVendorDto {
  name: string;
  order_days?: string[];
  order_method?: 'EMAIL' | 'SMS' | 'MANUAL' | '';
  email?: string | null;
  phone?: string | null;
}

export type UpdateVendorDto = Partial<CreateVendorDto>;

@Injectable()
export class VendorsService {
  async findAll(orgId: string): Promise<Record<string, unknown>[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('organization_id', orgId)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(error?.message || `Vendor with ID ${id} not found`);
    }
    return data;
  }

  async create(orgId: string, dto: CreateVendorDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .insert([
        {
          organization_id: orgId,
          name: dto.name,
          order_days: dto.order_days || [],
          order_method: dto.order_method || null,
          email: dto.email || null,
          phone: dto.phone || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...dto,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async remove(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }
}
