import { Query, Resolver, Args } from "@nestjs/graphql";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsPayload } from "./dashboard.types";

@Resolver(() => DashboardStatsPayload)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardStatsPayload, { name: "dashboardStats" })
  async getDashboardStats(
    @Args("orgId", { type: () => String, nullable: true }) orgId?: string,
  ): Promise<DashboardStatsPayload> {
    return this.dashboardService.getAggregatedStats(orgId);
  }
}
