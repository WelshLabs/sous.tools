import "newrelic";
import initializeServerLogger from "@soustools/logger/server";
initializeServerLogger();

import "reflect-metadata";
import "./pre-bootstrap";
import { config } from "@soustools/config";

import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as fs from "fs";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./filters/all-exceptions.filter";
import cookieParser from "cookie-parser";

import * as express from "express";

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

  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ limit: "2mb", extended: true }));

  // Parse cookies so guards can read HttpOnly session tokens
  app.use(cookieParser());

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable CORS for frontend integration (allow credentials for cookie-based auth)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Setup Swagger / OpenAPI
  const options = new DocumentBuilder()
    .setTitle("Sous Tools API")
    .setDescription("The global API for Sous Tools")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  if (process.env.NODE_ENV !== 'production') {
    fs.writeFileSync('openapi.json', JSON.stringify(document));
  }
  
  const port = config.PORT;
  await app.listen(config.PORT, "0.0.0.0");
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error(err, "Failed to start the application");
  process.exit(1);
});
