import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { VesselsService } from "./vessels.service";
import {
  VesselProfileGQL,
  CreateVesselInputGQL,
  UpdateVesselInputGQL,
} from "./recipe.types";

@Resolver(() => VesselProfileGQL)
export class VesselsResolver {
  constructor(private readonly vesselsService: VesselsService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [VesselProfileGQL], { name: "vesselProfiles" })
  async getVesselProfiles(@Context() ctx: any): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    return this.vesselsService.findAll(orgId);
  }

  @Mutation(() => VesselProfileGQL, { name: "createVesselProfile" })
  async createVesselProfile(
    @Args("input") input: CreateVesselInputGQL,
    @Context() ctx: any,
  ): Promise<any> {
    const orgId = this.getOrgId(ctx);
    return this.vesselsService.create(orgId, input as any);
  }

  @Mutation(() => VesselProfileGQL, { name: "updateVesselProfile" })
  async updateVesselProfile(
    @Args("id") id: string,
    @Args("input") input: UpdateVesselInputGQL,
  ): Promise<any> {
    return this.vesselsService.update(id, input as any);
  }

  @Mutation(() => VesselProfileGQL, { name: "deleteVesselProfile" })
  async deleteVesselProfile(@Args("id") id: string): Promise<any> {
    return this.vesselsService.remove(id);
  }
}
