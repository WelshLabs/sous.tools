import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { WastageService } from "./wastage.service";
import { WastageLogGQL, CreateWastageInputGQL } from "./items.types";

@Resolver(() => WastageLogGQL)
export class WastageResolver {
  constructor(private readonly wastageService: WastageService) {}

  private getOrgId(ctx: any): string {
    return (
      ctx.req?.user?.user_metadata?.organization_id ||
      ctx.req?.user?.app_metadata?.organization_id ||
      ctx.req?.user?.organization_id ||
      "d0000000-0000-0000-0000-000000000000"
    );
  }

  @Query(() => [WastageLogGQL], { name: "wastageLogs" })
  async getWastageLogs(
    @Args("startDate", { nullable: true }) startDate: string,
    @Args("endDate", { nullable: true }) endDate: string,
    @Context() ctx: any,
  ): Promise<any[]> {
    const orgId = this.getOrgId(ctx);
    const start = startDate || new Date(Date.now() - 30 * 86400000).toISOString();
    const end = endDate || new Date().toISOString();
    const rows = await this.wastageService.getWastageReport(orgId, start, end);
    return rows.map((r) => ({
      id: r.id,
      organization_id: orgId,
      item_id: r.itemId,
      quantity: r.amountG,
      reason: r.reason,
      created_at: r.recordedAt,
    }));
  }

  @Mutation(() => Boolean, { name: "createWastageLog" })
  async createWastageLog(
    @Args("input") input: CreateWastageInputGQL,
    @Context() ctx: any,
  ): Promise<boolean> {
    const orgId = this.getOrgId(ctx);
    const userId = ctx.req?.user?.id || ctx.req?.user?.sub;
    await this.wastageService.recordWastage({
      orgId,
      itemId: input.item_id || "",
      amountG: input.quantity,
      reason: input.reason,
      recordedBy: userId,
    });
    return true;
  }
}
