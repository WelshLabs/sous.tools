import { Controller, Get } from "@nestjs/common";
import { config } from "@soustools/config";

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
