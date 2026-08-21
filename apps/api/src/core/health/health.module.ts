import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { HealthResolver } from "./health.resolver";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthResolver],
})
export class HealthModule {}
