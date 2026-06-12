import { Module } from "@nestjs/common";
import { SignageGateway } from "./signage.gateway";
import { LayoutsService } from "./layouts.service";
import { DisplaysService } from "./displays.service";
import { LayoutsController } from "./layouts.controller";
import { DisplaysController } from "./displays.controller";

@Module({
  controllers: [LayoutsController, DisplaysController],
  providers: [SignageGateway, LayoutsService, DisplaysService],
  exports: [SignageGateway, LayoutsService, DisplaysService],
})
export class SignageModule {}
