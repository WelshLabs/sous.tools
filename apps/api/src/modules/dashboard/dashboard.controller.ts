import { Controller, Get, Query } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";

@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("stats")
  async getStats(@Query("orgId") orgId?: string) {
    return this.dashboardService.getAggregatedStats(orgId);
  }
}
