import { Controller, Get, Post, Res, HttpCode } from "@nestjs/common";
import { type Response } from "express";
import { AppService } from "./app.service";
import { type ApiResponse, type HelloResponse } from "@soustools/api-types";

/**
 * Controller handling root application routes.
 */
@Controller()
export class AppController {
  /**
   * Initializes the controller with the application service.
   *
   * @param {AppService} appService The application service logic provider.
   */
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint exposing the root GET path.
   *
   * Renders the standard workspace-defined ApiResponse wrapping HelloResponse.
   *
   * @returns {ApiResponse<HelloResponse>} A structured API response.
   */
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
  @Get("notifications/unread")
  getUnreadNotifications(): ApiResponse<any[]> {
    return {
      success: true,
      data: [],
      timestamp: new Date().toISOString(),
    };
  }

  @Post("auth/logout")
  @HttpCode(200)
  logout(): ApiResponse<null> {
    return {
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    };
  }
}
