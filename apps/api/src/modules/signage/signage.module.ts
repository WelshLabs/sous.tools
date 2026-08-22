import { Module } from "@nestjs/common";
import { SignageGateway } from "./signage.gateway";
import { LayoutsService } from "./layouts.service";
import { DisplaysService } from "./displays.service";
import { SignageResolver } from "./signage.resolver";

@Module({
  controllers: [],
  providers: [SignageGateway, LayoutsService, DisplaysService, SignageResolver],
  exports: [SignageGateway, LayoutsService, DisplaysService],
})
export class SignageModule {}
