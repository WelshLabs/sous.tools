import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../../lib/supabase';

export interface CreateItemDto {
  name: string;
  category?: string;
  purchase_unit?: string;
  units_per_case?: number;
  each_weight_g?: number;
  density_g_ml?: number;
  shelf_life_days?: number;
  allergens?: string[];
  is_animal_product?: boolean;
  is_meat?: boolean;
  is_seafood?: boolean;
  is_dairy?: boolean;
  is_egg?: boolean;
  is_gluten_source?: boolean;
  fdc_id?: number;
  nutrition_macros?: Record<string, unknown>;
}

export type UpdateItemDto = Partial<CreateItemDto>;

@Injectable()
export class ItemsService {
  async findAll(orgId: string, search?: string): Promise<Record<string, unknown>[]> {
    let q = supabase
      .from('items')
      .select('*')
      .eq('organization_id', orgId);

    if (search) {
      q = q.ilike('name', `%${search}%`);
    }

    const { data, error } = await q.order('name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data || [];
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(error?.message || `Item with ID ${id} not found`);
    }
    return data;
  }

  async create(orgId: string, dto: CreateItemDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .insert([
        {
          organization_id: orgId,
          name: dto.name,
          category: dto.category || 'INGREDIENT',
          purchase_unit: dto.purchase_unit || 'LB',
          units_per_case: dto.units_per_case,
          each_weight_g: dto.each_weight_g,
          density_g_ml: dto.density_g_ml ?? 1.0,
          shelf_life_days: dto.shelf_life_days,
          allergens: dto.allergens || [],
          is_animal_product: dto.is_animal_product ?? false,
          is_meat: dto.is_meat ?? false,
          is_seafood: dto.is_seafood ?? false,
          is_dairy: dto.is_dairy ?? false,
          is_egg: dto.is_egg ?? false,
          is_gluten_source: dto.is_gluten_source ?? false,
          fdc_id: dto.fdc_id,
          nutrition_macros: dto.nutrition_macros || {},
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  async update(id: string, dto: UpdateItemDto): Promise<Record<string, unknown>> {
    const { data, error } = await supabase
      .from('items')
      .update({
        ...dto,
        updated_at: new Date().toISOString(),
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
      .from('items')
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
