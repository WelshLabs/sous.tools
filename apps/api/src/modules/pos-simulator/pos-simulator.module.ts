import { Module } from "@nestjs/common";
import { PosSimulatorController } from "./pos-simulator.controller";
import { SignageModule } from "../signage/signage.module";

@Module({
  imports: [SignageModule],
  controllers: [PosSimulatorController],
})
export class PosSimulatorModule {}
