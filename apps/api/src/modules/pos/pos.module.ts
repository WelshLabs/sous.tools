import { Module } from "@nestjs/common";
import { PosTransactionsService } from "./pos-transactions.service";
import { PosLinksService } from "./pos-links.service";
import { PosResolver } from "./pos.resolver";
import { PosGateway } from "./pos.gateway";
import { DashboardModule } from "../dashboard/dashboard.module";

@Module({
  imports: [DashboardModule],
  controllers: [],
  providers: [PosTransactionsService, PosLinksService, PosGateway, PosResolver],
  exports: [PosTransactionsService, PosLinksService, PosGateway],
})
export class PosModule {}
