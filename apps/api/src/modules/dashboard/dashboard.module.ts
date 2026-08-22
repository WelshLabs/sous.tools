import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardResolver } from "./dashboard.resolver";

@Module({
  controllers: [],
  providers: [DashboardService, DashboardResolver],
  exports: [DashboardService],
})
export class DashboardModule {}
