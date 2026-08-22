import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { supabase } from "../../core/database/supabase";
import { SignageGateway } from "../signage/signage.gateway";
import {
  getMockItems,
  handleSquareStockToggle,
  resolveItemDetails,
} from "./pos-simulator.helpers";
import { PosItemGQL } from "../pos/pos.types";

@Resolver(() => PosItemGQL)
export class PosSimulatorResolver {
  private readonly defaultOrgId = "d0000000-0000-0000-0000-000000000000";

  constructor(private readonly gateway: SignageGateway) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      this.defaultOrgId
    );
  }

  @Query(() => [PosItemGQL], { name: "posSimulatorItems" })
  async getItems(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const { data, error } = await supabase
      .from("pos_items")
      .select("*")
      .eq("organization_id", orgId)
      .eq("pos_provider", "SQUARE");

    if (error) throw new Error(error.message);
    return data || [];
  }

  @Mutation(() => [PosItemGQL], { name: "seedPosSimulatorItems" })
  async seedItems(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const mockItems = getMockItems(orgId);

    const { data, error } = await supabase
      .from("pos_items")
      .upsert(mockItems, {
        onConflict: "organization_id,pos_provider,external_id",
      })
      .select();

    if (error) throw new Error(error.message);
    return data || [];
  }

  @Mutation(() => PosItemGQL, { name: "togglePosItemSoldOut" })
  async toggleSoldOut(
    @Args("itemId", { nullable: true }) itemId: string,
    @Args("squareId", { nullable: true }) squareId: string,
    @Args("isSoldOut") isSoldOut: boolean,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    const { orgId: resolvedOrgId, targetSquareId } = await resolveItemDetails(
      supabase,
      itemId,
      squareId,
      orgId,
    );

    const { data: integration } = await supabase
      .from("integrations")
      .select("access_token")
      .eq("organization_id", resolvedOrgId)
      .eq("provider", "SQUARE")
      .maybeSingle();

    if (integration && targetSquareId) {
      await handleSquareStockToggle(
        targetSquareId,
        isSoldOut,
        integration.access_token,
      );
    }

    let query = supabase.from("pos_items").update({
      is_sold_out: isSoldOut,
      updated_at: new Date().toISOString(),
    });

    if (itemId) {
      query = query.eq("id", itemId);
    } else if (targetSquareId) {
      query = query
        .eq("external_id", targetSquareId)
        .eq("pos_provider", "SQUARE");
    }

    const { data, error } = await query.select().single();
    if (error || !data) throw new Error(error?.message || "Item not found");

    const { data: decks } = await supabase
      .from("signage_decks")
      .select("id, config")
      .eq("organization_id", resolvedOrgId);

    const { data: allItems } = await supabase
      .from("pos_items")
      .select("*")
      .eq("organization_id", resolvedOrgId)
      .eq("pos_provider", "SQUARE");

    if (decks) {
      for (const deck of decks) {
        this.gateway.broadcastDeckUpdate(
          deck.id as string,
          deck.config as any,
        );
        this.gateway.broadcastItemsUpdate(deck.id as string, allItems || []);
      }
    }

    return data;
  }
}
