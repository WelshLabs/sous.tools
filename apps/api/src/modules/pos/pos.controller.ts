import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { supabase } from '../../lib/supabase';
import { runControllerAction } from '../signage/response.helper';
import { ApiResponse } from '@soustools/api-types';
import { PosTransactionsService } from './pos-transactions.service';
import { PosGateway } from './pos.gateway';

@Controller('pos')
export class PosController {
  constructor(
    private readonly transactionsService: PosTransactionsService,
    private readonly posGateway: PosGateway,
  ) {}

  @Get('catalog')
  async getCatalog(@Query('orgId') orgId?: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const targetOrgId = orgId || 'd0000000-0000-0000-0000-000000000000';

      const [items, categories, modifierGroups, discounts] = await Promise.all([
        supabase
          .from('pos_items')
          .select('*, pos_item_modifier_groups(modifier_group_id)')
          .eq('organization_id', targetOrgId)
          .order('name'),
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
        .select('*, pos_order_line_items(*)')
        .eq('organization_id', targetOrgId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    });
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() body: { status: string; orgId?: string },
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const orgId = body.orgId || 'd0000000-0000-0000-0000-000000000000';
      if (body.status === 'COMPLETED') {
        await this.transactionsService.completeOrder(id, orgId);
      } else {
        const { data, error } = await supabase
          .from('pos_orders')
          .update({ state: body.status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select();
        if (error) throw new Error(error.message);
        this.posGateway.broadcastOrdersUpdate(orgId);
        return data;
      }
      this.posGateway.broadcastOrdersUpdate(orgId);
      return { success: true };
    });
  }

  @Patch('order-line-items/:id/status')
  async updateLineItemStatus(
    @Param('id') id: string,
    @Body() body: { status: string; orgId?: string },
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const orgId = body.orgId || 'd0000000-0000-0000-0000-000000000000';
      await this.transactionsService.updateLineItemStatus(id, body.status);
      this.posGateway.broadcastOrdersUpdate(orgId);
      return { success: true };
    });
  }

  @Post('transactions/bulk')
  async createTransactionsBulk(
    @Body() transactions: Array<{
      organization_id: string;
      pos_item_id?: string | null;
      quantity_sold: number;
      gross_revenue: number;
      transaction_time: string;
      source?: string;
    }>,
  ): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from('pos_transactions')
        .insert(transactions)
        .select();

      if (error) throw new Error(error.message);
      return data || [];
    });
  }

  @Get('modifier-groups/:id')
  async getModifierGroup(@Param('id') id: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from('pos_modifier_groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data;
    });
  }

  @Get('modifier-groups/:id/options')
  async getModifierGroupOptions(@Param('id') id: string): Promise<ApiResponse<any>> {
    return runControllerAction(async () => {
      const { data, error } = await supabase
        .from('pos_modifier_options')
        .select('*')
        .eq('modifier_group_id', id)
        .order('name');

      if (error) throw new Error(error.message);
      return data || [];
    });
  }
}

