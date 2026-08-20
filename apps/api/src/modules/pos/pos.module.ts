import { Module } from "@nestjs/common";
import { PosTransactionsService } from "./pos-transactions.service";
import { PosLinksService } from "./pos-links.service";
import { PosController } from "./pos.controller";
import { PosGateway } from "./pos.gateway";
import { DashboardModule } from "../dashboard/dashboard.module";

@Module({
  imports: [DashboardModule],
  controllers: [PosController],
  providers: [PosTransactionsService, PosLinksService, PosGateway],
  exports: [PosTransactionsService, PosLinksService, PosGateway],
})
export class PosModule {}
