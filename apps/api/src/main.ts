import "newrelic";
import "reflect-metadata";
import "./core/pre-bootstrap";
import { serverConfig as config } from "@soustools/config/server";

import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { Logger as PinoLogger } from "nestjs-pino";
import * as fs from "fs";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./core/filters/all-exceptions.filter";
import cookieParser from "cookie-parser";

import * as express from "express";

/**
 * Boots the NestJS application.
 *
 * Configures the Nest application instance with Pino logging, CORS, Swagger,
 * and starts listening on the configured PORT.
 *
 * @returns {Promise<void>} Resolves when the application has successfully started.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bufferLogs: true,
  });

  app.useLogger(app.get(PinoLogger));

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

  const allowedOrigins = (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean | string) => void,
  ) => {
    if (!origin) return callback(null, true);
    if (!config.IS_PRODUCTION) return callback(null, origin);
    try {
      const url = new URL(origin);
      if (
        url.hostname === "sous.tools" ||
        url.hostname.endsWith(".sous.tools") ||
        url.hostname.endsWith(".vercel.app") ||
        origin === "android-app://com.sous.wearos" ||
        origin === "app://com.sous.wearos"
      ) {
        return callback(null, origin);
      }
    } catch {
      // invalid url
    }
    return callback(new Error("CORS origin not allowed"), false);
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
  SwaggerModule.setup("api/docs", app, document);
  try {
    fs.writeFileSync("openapi.json", JSON.stringify(document, null, 2));
  } catch {
    // Non-fatal in read-only environments
  }

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
