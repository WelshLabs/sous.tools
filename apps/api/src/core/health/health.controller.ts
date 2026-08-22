import { Public } from "../decorators/public.decorator";
import { Controller, Get } from "@nestjs/common";

import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
} from "@nestjs/terminus";

import { SkipThrottle } from "@nestjs/throttler";

import { serverConfig as config } from "@soustools/config/server";

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      () => this.memory.checkHeap("memory_heap", 300 * 1024 * 1024),
      () => this.memory.checkRSS("memory_rss", 500 * 1024 * 1024),
      () => ({
        app: {
          status: "up",
          version: config.APP_VERSION || "1.0.0",
          timestamp: new Date().toISOString(),
        },
      }),
    ]);
  }
}
