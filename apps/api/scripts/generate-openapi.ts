import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as fs from "fs";
import { AppModule } from "../src/app.module";

async function generate() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle("Sous Tools API")
    .setDescription("The global API for Sous Tools")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, options);
  fs.writeFileSync("../openapi.json", JSON.stringify(document, null, 2));
  process.exit(0);
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
