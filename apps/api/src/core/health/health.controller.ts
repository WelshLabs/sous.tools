import { Controller, Get } from "@nestjs/common";
import { serverConfig as config } from "@soustools/config/server";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: config.APP_VERSION,
    };
  }
}
