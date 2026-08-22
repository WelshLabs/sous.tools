import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { ItemsService } from "./items.service";
import { ItemGQL, CreateItemInputGQL, UpdateItemInputGQL } from "./items.types";

@Resolver(() => ItemGQL)
export class ItemsResolver {
  constructor(private readonly itemsService: ItemsService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [ItemGQL], { name: "items" })
  async getItems(
    @Args("search", { nullable: true }) search: string,
    @Context() ctx: any,
  ): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.itemsService.findAll(orgId, search);
  }

  @Query(() => ItemGQL, { name: "item", nullable: true })
  async getItem(@Args("id") id: string): Promise<any> {
    return this.itemsService.findOne(id);
  }

  @Mutation(() => ItemGQL, { name: "createItem" })
  async createItem(
    @Args("input") input: CreateItemInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.itemsService.create(orgId, input as any);
  }

  @Mutation(() => ItemGQL, { name: "updateItem" })
  async updateItem(
    @Args("id") id: string,
    @Args("input") input: UpdateItemInputGQL,
  ): Promise<any> {
    return this.itemsService.update(id, input as any);
  }

  @Mutation(() => ItemGQL, { name: "deleteItem" })
  async deleteItem(@Args("id") id: string): Promise<any> {
    return this.itemsService.remove(id);
  }
}
