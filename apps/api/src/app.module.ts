import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { CacheModule } from "@nestjs/cache-manager";
// @ts-expect-error cache-manager-ioredis is missing types
import * as redisStore from "cache-manager-ioredis";
import { serverConfig as config } from "@soustools/config/server";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
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

import { AppGraphQLModule } from "./core/graphql/graphql.module";
import { HealthModule } from "./core/health/health.module";

/**
 * Root module of the NestJS application.
 *
 * Integrates controllers, queues, and providers for the core application.
 */

if (config.NODE_ENV === "production" && config.REDIS_HOST === "127.0.0.1") {
  throw new Error(
    `FATAL: REDIS_HOST resolved to '127.0.0.1' in production. ` +
      `Infisical must provide a real Redis hostname (e.g. 'redis').`,
  );
}

@Module({
  imports: [
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
    AppGraphQLModule,
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
  providers: [AppService],
})
export class AppModule {}
