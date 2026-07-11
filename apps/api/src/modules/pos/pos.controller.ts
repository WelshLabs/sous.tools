import { Controller, Get, Query } from '@nestjs/common';
import { supabase } from '../../lib/supabase';
import { runControllerAction } from '../signage/response.helper';
import { ApiResponse } from '@soustools/api-types';

@Controller('pos')
export class PosController {
  @Get('catalog')
  async getCatalog(@Query('orgId') orgId?: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || 'd0000000-0000-0000-0000-000000000000';

      const [items, categories, modifierGroups, discounts] = await Promise.all([
        supabase.from('pos_items').select('*').eq('organization_id', targetOrgId).order('name'),
        supabase.from('pos_categories').select('*').eq('organization_id', targetOrgId).order('name'),
        supabase.from('pos_modifier_groups').select('*, pos_modifier_options(*)').eq('organization_id', targetOrgId),
        supabase.from('pos_discounts').select('*').eq('organization_id', targetOrgId).order('name'),
      ]);

      if (items.error) throw new Error(items.error.message);
      if (categories.error) throw new Error(categories.error.message);
      if (modifierGroups.error) throw new Error(modifierGroups.error.message);
      if (discounts.error) throw new Error(discounts.error.message);

      return {
        items: items.data || [],
        categories: categories.data || [],
        modifierGroups: modifierGroups.data || [],
        discounts: discounts.data || [],
      };
    });
  }

  @Get('transactions')
  async getTransactions(@Query('orgId') orgId?: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || 'd0000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('pos_transactions')
        .select(`
          *,
          pos_items (
            name
          )
        `)
        .eq('organization_id', targetOrgId)
        .order('transaction_time', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    });
  }

  @Get('orders')
  async getOrders(@Query('orgId') orgId?: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || 'd0000000-0000-0000-0000-000000000000';

      const { data, error } = await supabase
        .from('pos_orders')
        .select('*')
        .eq('organization_id', targetOrgId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    });
  }
}
