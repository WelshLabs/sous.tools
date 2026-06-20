import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { config } from "@soustools/config";

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

  // Enable CORS for frontend integration
  app.enableCors();

  const port = config.PORT;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error("Failed to start the application:", err);
  process.exit(1);
});
