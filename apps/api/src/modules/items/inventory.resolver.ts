import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { InventoryService } from "./inventory.service";
import {
  InventoryOnHandGQL,
  ReconcileInventoryInputGQL,
} from "./items.types";

@Resolver(() => InventoryOnHandGQL)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [InventoryOnHandGQL], { name: "inventoryOnHand" })
  async getInventoryOnHand(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const stocks = await this.inventoryService.getCurrentStock(orgId);
    return stocks.map((s) => ({
      id: s.id,
      organization_id: orgId,
      item_id: s.itemId,
      quantity_on_hand: s.quantityG,
      storage_location: s.location,
    }));
  }

  @Mutation(() => Boolean, { name: "reconcileInventory" })
  async reconcileInventory(
    @Args("input") input: ReconcileInventoryInputGQL,
    @Context() ctx: any,
  ): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    await this.inventoryService.adjustStock({
      orgId,
      itemId: input.item_id,
      quantityG: input.physical_count,
      location: input.storage_location,
    });
    return true;
  }
}
