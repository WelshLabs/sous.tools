import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { PurchaseOrdersService } from "./purchase-orders.service";
import {
  PurchaseOrderGQL,
  CreatePurchaseOrderInputGQL,
  UpdatePurchaseOrderInputGQL,
} from "./items.types";

@Resolver(() => PurchaseOrderGQL)
export class PurchaseOrdersResolver {
  constructor(
    private readonly purchaseOrdersService: PurchaseOrdersService,
  ) {}

  @Query(() => [PurchaseOrderGQL], { name: "purchaseOrders" })
  async getPurchaseOrders(): Promise<any[]> {
    return this.purchaseOrdersService.findAll();
  }

  @Query(() => PurchaseOrderGQL, { name: "purchaseOrder", nullable: true })
  async getPurchaseOrder(@Args("id") id: string): Promise<any> {
    return this.purchaseOrdersService.findOne(id);
  }

  @Mutation(() => PurchaseOrderGQL, { name: "createPurchaseOrder" })
  async createPurchaseOrder(
    @Args("input") input: CreatePurchaseOrderInputGQL,
  ): Promise<any> {
    const firstItem = input.items?.[0];
    return this.purchaseOrdersService.addItemToDraft({
      vendor_id: input.vendor_id,
      raw_name: firstItem?.custom_name || "Item",
      ordered_qty: firstItem?.quantity || 1,
    });
  }

  @Mutation(() => Boolean, { name: "updatePurchaseOrder" })
  async updatePurchaseOrder(
    @Args("id") id: string,
    @Args("input") input: UpdatePurchaseOrderInputGQL,
  ): Promise<boolean> {
    if (input.status === "SUBMITTED") {
      await this.purchaseOrdersService.submitPo(id);
    } else if (input.status === "RECEIVED") {
      await this.purchaseOrdersService.receivePo(id);
    }
    return true;
  }
}
