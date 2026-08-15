import { Controller, Get, Res, Query } from "@nestjs/common";
import { ApiQuery, ApiOperation } from "@nestjs/swagger";
import type { Response } from "express";
import { AppService } from "./app.service";
import { type ApiResponse, type HelloResponse } from "@soustools/api-types";

/**
 * Controller handling root application routes.
 *
 * Auth routes (login, logout, session, refresh, OAuth) have been consolidated
 * into `modules/auth/auth.controller.ts` per the Supabase Firewall rule.
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

  @Get("notifications")
  @ApiOperation({ summary: "Get paginated notifications" })
  @ApiQuery({ name: "page", required: false, type: String })
  @ApiQuery({ name: "limit", required: false, type: String })
  getNotifications(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    
    const paginatedResult = this.appService.getNotifications(pageNum, limitNum);
    return {
      success: true,
      data: paginatedResult,
      timestamp: new Date().toISOString(),
    };
  }

  @Get("notifications/unread")
  getUnreadNotifications(): ApiResponse<any[]> {
    const data = this.appService.getUnreadNotifications();
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }
}
