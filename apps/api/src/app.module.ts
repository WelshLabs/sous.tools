import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
import { ClsModule } from "nestjs-cls";
import { ThrottlerModule } from "@nestjs/throttler";
import { LoggerModule } from "nestjs-pino";
import { ScheduleModule } from "@nestjs/schedule";
// @ts-expect-error cache-manager-ioredis is missing types
import * as redisStore from "cache-manager-ioredis";
import { serverConfig as config } from "@soustools/config/server";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { DatabaseModule } from "./core/database/database.module";
import { AppGraphQLModule } from "./core/graphql/graphql.module";
import { EventsModule } from "./core/events/events.module";
import { HealthModule } from "./core/health/health.module";
import { GqlThrottlerGuard } from "./core/guards/gql-throttler.guard";
import { SupabaseAuthGuard } from "./core/guards/supabase-auth.guard";

import { SignageModule } from "./modules/signage/signage.module";
import { PosSimulatorModule } from "./modules/pos-simulator/pos-simulator.module";
import { IntegrationsModule } from "./modules/integrations/integrations.module";
import { RecipeModule } from "./modules/recipe/recipe.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { NutritionModule } from "./modules/nutrition/nutrition.module";
import { ItemsModule } from "./modules/items/items.module";
import { PosModule } from "./modules/pos/pos.module";
import { UsersModule } from "./modules/users/users.module";
import { CommandsModule } from "./modules/commands/commands.module";
import { DevicesModule } from "./modules/devices/devices.module";
import { MetricsModule } from "./modules/metrics/metrics.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { StorageModule } from "./modules/storage/storage.module";
import { AuthModule } from "./modules/auth/auth.module";
import { Neo4jSyncModule } from "./modules/neo4j-sync/neo4j-sync.module";

/**
 * Root module of the NestJS application.
 *
 * Integrates enterprise middleware (CLS, Throttler, Terminus, Pino),
 * database providers, queues, and domain feature modules.
 */

if (config.NODE_ENV === "production" && config.REDIS_HOST === "127.0.0.1") {
  throw new Error(
    `FATAL: REDIS_HOST resolved to 127.0.0.1 in production. ` +
      `Infisical must provide a real Redis hostname (e.g. redis).`,
  );
}

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: any) =>
          req.headers?.["x-request-id"] ||
          req.headers?.["x-correlation-id"] ||
          crypto.randomUUID(),
        setup: (cls, req: any) => {
          const orgId =
            req.headers?.["x-org-id"] ||
            req.headers?.["x-organization-id"] ||
            req.query?.orgId ||
            req.body?.orgId ||
            req.body?.organization_id ||
            req.user?.user_metadata?.organization_id;
          if (orgId) {
            cls.set("orgId", orgId);
          }
          if (req.user?.id) {
            cls.set("userId", req.user.id);
          }
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 20,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 100,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 500,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        level: config.NODE_ENV === "production" ? "info" : "debug",
        transport:
          config.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        autoLogging: {
          ignore: (req) => req.url === "/health" || req.url === "/health/",
        },
        customProps: (req: any) => ({
          requestId: req.headers?.["x-request-id"] || req.id,
        }),
      },
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
    }),
    BullModule.forRoot({
      connection: {
        host: config.REDIS_HOST,
        port: config.REDIS_PORT,
        family: 4,
        retryStrategy: (times: number) => {
          console.warn(
            `[Redis] Connection failed (attempt ${times}). Retrying gracefully...`,
          );
          return Math.min(times * 100, 3000);
        },
      },
    }),
    DatabaseModule,
    AppGraphQLModule,
    EventsModule,
    HealthModule,
    SignageModule,
    PosSimulatorModule,
    IntegrationsModule,
    RecipeModule,
    IngestionModule,
    NutritionModule,
    ItemsModule,
    PosModule,
    UsersModule,
    CommandsModule,
    DevicesModule,
    MetricsModule,
    DashboardModule,
    StorageModule,
    AuthModule,
    Neo4jSyncModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: SupabaseAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
