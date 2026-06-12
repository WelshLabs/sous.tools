import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { SignageModule } from "./modules/signage/signage.module";
import { PosSimulatorModule } from "./modules/pos-simulator/pos-simulator.module";

/**
 * Root module of the NestJS application.
 *
 * Integrates controllers and providers for the core application.
 */
@Module({
  imports: [SignageModule, PosSimulatorModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
