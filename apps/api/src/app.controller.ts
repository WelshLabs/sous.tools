import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiResponse, HelloResponse } from "@soustools/api-types";

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
}
