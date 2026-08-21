import { Query, Resolver, Subscription, Args } from "@nestjs/graphql";
import { DashboardService } from "./dashboard.service";
import { DashboardStatsPayload } from "./dashboard.types";
import { pubSub } from "../../core/graphql/pubsub";

@Resolver(() => DashboardStatsPayload)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Query(() => DashboardStatsPayload, { name: "dashboardStats" })
  async getDashboardStats(
    @Args("orgId", { type: () => String, nullable: true }) orgId?: string,
  ): Promise<DashboardStatsPayload> {
    return this.dashboardService.getAggregatedStats(orgId);
  }

  @Subscription(() => DashboardStatsPayload, {
    name: "dashboardStatsUpdated",
    filter: (payload, variables) => {
      if (!variables?.orgId) return true;
      return payload.orgId === variables.orgId;
    },
    resolve: (payload) => payload.dashboardStatsUpdated || payload,
  })
  dashboardStatsUpdated(
    @Args("orgId", { type: () => String, nullable: true }) _orgId?: string,
  ) {
    return pubSub.asyncIterableIterator("DASHBOARD_STATS_UPDATED");
  }
}
