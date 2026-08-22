import { Controller, Get, Res } from "@nestjs/common";
import type { Response } from "express";
import { AppService } from "./app.service";
import { type ApiResponse, type HelloResponse } from "@soustools/api-types";

/**
 * Controller handling root application routes.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): ApiResponse<HelloResponse> {
    const helloData = this.appService.getHelloData();
    return {
      success: true,
      data: helloData,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("favicon.ico")
  getFavicon(@Res() res: Response) {
    const pixel = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      "base64",
    );
    res.type("image/png").send(pixel);
  }
}
