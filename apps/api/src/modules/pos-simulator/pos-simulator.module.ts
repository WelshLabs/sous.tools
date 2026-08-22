import { Module } from "@nestjs/common";
import { PosSimulatorResolver } from "./pos-simulator.resolver";
import { SignageModule } from "../signage/signage.module";

@Module({
  imports: [SignageModule],
  controllers: [],
  providers: [PosSimulatorResolver],
  exports: [PosSimulatorResolver],
})
export class PosSimulatorModule {}
