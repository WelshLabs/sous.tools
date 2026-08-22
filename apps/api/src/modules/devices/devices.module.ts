import { Module } from "@nestjs/common";
import { DevicesService } from "./devices.service";
import { DevicesResolver } from "./devices.resolver";

@Module({
  controllers: [],
  providers: [DevicesService, DevicesResolver],
  exports: [DevicesService],
})
export class DevicesModule {}
