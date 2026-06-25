import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";
import { config } from "@soustools/config";
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

import { AppGraphQLModule } from "./graphql/graphql.module";
import { HealthModule } from "./health/health.module";

/**
 * Root module of the NestJS application.
 *
 * Integrates controllers, queues, and providers for the core application.
 */
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host:
          config.REDIS_HOST === "localhost" ? "127.0.0.1" : config.REDIS_HOST,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
