import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { supabase } from "../../core/database/supabase";
import { PosTransactionsService } from "./pos-transactions.service";
import { PosGateway } from "./pos.gateway";
import {
  PosCatalogPayloadGQL,
  PosOrderGQL,
  PosTransactionGQL,
  PosModifierGroupGQL,
  BulkTransactionInputGQL,
} from "./pos.types";

@Resolver(() => PosOrderGQL)
export class PosResolver {
  constructor(
    private readonly transactionsService: PosTransactionsService,
    private readonly posGateway: PosGateway,
  ) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => PosCatalogPayloadGQL, { name: "posCatalog" })
  async getPosCatalog(@Context() ctx: any): Promise<PosCatalogPayloadGQL> {
    const orgId = this.getOrgId(ctx);

    const [items, categories, modifierGroups, discounts] = await Promise.all([
      supabase
        .from("pos_items")
        .select("*, pos_item_modifier_groups(modifier_group_id)")
        .eq("organization_id", orgId)
        .order("name"),
      supabase
        .from("pos_categories")
        .select("*")
        .eq("organization_id", orgId)
        .order("name"),
      supabase
        .from("pos_modifier_groups")
        .select("*, pos_modifier_options(*)")
        .eq("organization_id", orgId),
      supabase
        .from("pos_discounts")
        .select("*")
        .eq("organization_id", orgId)
        .order("name"),
    ]);

    if (items.error) throw new Error(items.error.message);
    if (categories.error) throw new Error(categories.error.message);
    if (modifierGroups.error) throw new Error(modifierGroups.error.message);
    if (discounts.error) throw new Error(discounts.error.message);

    return {
      items: (items.data as any) || [],
      categories: (categories.data as any) || [],
      modifierGroups: (modifierGroups.data as any) || [],
      discounts: (discounts.data as any) || [],
    };
  }

  @Query(() => [PosOrderGQL], { name: "posOrders" })
  async getPosOrders(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const { data, error } = await supabase
      .from("pos_orders")
      .select("*, pos_order_line_items(*)")
      .eq("organization_id", orgId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  @Query(() => [PosTransactionGQL], { name: "posTransactions" })
  async getPosTransactions(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const { data, error } = await supabase
      .from("pos_transactions")
      .select("*, pos_items(name)")
      .eq("organization_id", orgId)
      .order("transaction_time", { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }

  @Query(() => PosModifierGroupGQL, {
    name: "posModifierGroup",
    nullable: true,
  })
  async getPosModifierGroup(@Args("id") id: string): Promise<any> {
    const { data, error } = await supabase
      .from("pos_modifier_groups")
      .select("*, pos_modifier_options(*)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  @Mutation(() => Boolean, { name: "updatePosOrderStatus" })
  async updatePosOrderStatus(
    @Args("id") id: string,
    @Args("status") status: string,
    @Context() ctx: any,
  ): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    if (status === "COMPLETED") {
      await this.transactionsService.completeOrder(id, orgId);
    } else {
      const updatePayload: Record<string, unknown> = {
        state: status,
        updated_at: new Date().toISOString(),
      };
      if (status === "OPEN") {
        updatePayload.closed_at = null;
        await supabase
          .from("pos_order_line_items")
          .update({ status: "OPEN", updated_at: new Date().toISOString() })
          .eq("pos_order_id", id);
      }

      const { error } = await supabase
        .from("pos_orders")
        .update(updatePayload)
        .eq("id", id);
      if (error) throw new Error(error.message);
    }

    this.posGateway.broadcastOrdersUpdate(orgId);
    return true;
  }

  @Mutation(() => Boolean, { name: "updatePosLineItemStatus" })
  async updatePosLineItemStatus(
    @Args("id") id: string,
    @Args("status") status: string,
    @Context() ctx: any,
  ): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    await this.transactionsService.updateLineItemStatus(id, status);
    this.posGateway.broadcastOrdersUpdate(orgId);
    return true;
  }

  @Mutation(() => [PosTransactionGQL], { name: "createPosTransactionsBulk" })
  async createPosTransactionsBulk(
    @Args("transactions", { type: () => [BulkTransactionInputGQL] })
    transactions: BulkTransactionInputGQL[],
    @Context() ctx: any,
  ): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const rows = transactions.map((t) => ({ ...t, organization_id: orgId }));
    const { data, error } = await supabase
      .from("pos_transactions")
      .insert(rows)
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }
}
