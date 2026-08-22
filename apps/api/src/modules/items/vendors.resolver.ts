import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { VendorsService } from "./vendors.service";
import {
  VendorGQL,
  CreateVendorInputGQL,
  UpdateVendorInputGQL,
} from "./items.types";

@Resolver(() => VendorGQL)
export class VendorsResolver {
  constructor(private readonly vendorsService: VendorsService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [VendorGQL], { name: "vendors" })
  async getVendors(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.vendorsService.findAll(orgId);
  }

  @Query(() => VendorGQL, { name: "vendor", nullable: true })
  async getVendor(@Args("id") id: string): Promise<any> {
    return this.vendorsService.findOne(id);
  }

  @Mutation(() => VendorGQL, { name: "createVendor" })
  async createVendor(
    @Args("input") input: CreateVendorInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.vendorsService.create(orgId, input as any);
  }

  @Mutation(() => VendorGQL, { name: "updateVendor" })
  async updateVendor(
    @Args("id") id: string,
    @Args("input") input: UpdateVendorInputGQL,
  ): Promise<any> {
    return this.vendorsService.update(id, input as any);
  }
}
