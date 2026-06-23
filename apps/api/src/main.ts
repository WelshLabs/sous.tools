import 'newrelic';
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "@soustools/config";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import { logger, patchConsole } from "@soustools/logger";

patchConsole();


/**
 * Boots the NestJS application.
 *
 * Configures the Nest application instance, enables cross-origin resource sharing (CORS),
 * and starts listening on the configured PORT.
 *
 * @returns {Promise<void>} Resolves when the application has successfully started.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS for frontend integration
  app.enableCors();

  const port = config.PORT;
  await app.listen(port);
  logger.info(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err: unknown) => {
  logger.error(err, "Failed to start the application");
  process.exit(1);
});
