import "newrelic";
import initializeServerLogger from "@soustools/logger/server";
initializeServerLogger();

import "reflect-metadata";
import "./pre-bootstrap";
import { serverConfig as config } from "@soustools/config/server";

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

  /**
   * Trust the first proxy hop (Traefik) so that Express reads
   * X-Forwarded-Proto and considers the request HTTPS. Without this,
   * Express refuses to set Secure cookies because it thinks the
   * connection is plain HTTP.
   */
  const expressApp = app
    .getHttpAdapter()
    .getInstance() as import("express").Express;
  expressApp.set("trust proxy", 1);

  app.use(
    express.json({
      limit: "50mb",
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );
  app.use(
    express.urlencoded({
      limit: "50mb",
      extended: true,
      verify: (req: any, _res: any, buf: Buffer) => {
        req.rawBody = buf;
      },
    }),
  );

  // Parse cookies so guards can read HttpOnly session tokens
  app.use(cookieParser());

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Allow credentials for cookie-based auth.
  // In production we restrict origins to known frontends; in dev we reflect
  // the request origin so any localhost port works.
  const allowedOrigins = config.IS_PRODUCTION
    ? [
        "https://sous.tools",
        "https://app.sous.tools",
        "https://pos.sous.tools",
        "https://tv.sous.tools",
        "https://setup.sous.tools",
        "https://editor.sous.tools",
        "https://dev.sous.tools",
        "https://dev-api.sous.tools",
        "https://dev-pos.sous.tools",
        "https://dev-setup.sous.tools",
        "android-app://com.sous.wearos",
        "app://com.sous.wearos",
      ]
    : (
        origin: string | undefined,
        callback: (err: Error | null, allow?: any) => void,
      ) => {
        callback(null, origin || "*");
      };

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Setup Swagger / OpenAPI
  const options = new DocumentBuilder()
    .setTitle("Sous Tools API")
    .setDescription("The global API for Sous Tools")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync("openapi.json", JSON.stringify(document, null, 2));

  if (process.env.GENERATE_OPENAPI_ONLY === "true") {
    process.exit(0);
  }

  const port = config.PORT;
  await app.listen(config.PORT, "0.0.0.0");
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error(err, "Failed to start the application");
  process.exit(1);
});
