import { Module } from "@nestjs/common";
import { SignageGateway } from "./signage.gateway";
import { LayoutsService } from "./layouts.service";
import { DisplaysService } from "./displays.service";
import { DevicesService } from "./devices.service";
import { LayoutsController } from "./layouts.controller";
import { DisplaysController } from "./displays.controller";
import { DevicesController } from "./devices.controller";

@Module({
  controllers: [LayoutsController, DisplaysController, DevicesController],
  providers: [SignageGateway, LayoutsService, DisplaysService, DevicesService],
  exports: [SignageGateway, LayoutsService, DisplaysService, DevicesService],
})
export class SignageModule {}
