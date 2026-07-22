import { Injectable } from "@nestjs/common";
import { HelloResponse } from "@soustools/api-types";
import { serverConfig as config } from "@soustools/config/server";

/**
 * Service managing logic for base application endpoints.
 */
@Injectable()
export class AppService {
  /**
   * Fetches metadata for the API server greeting.
   *
   * @returns {HelloResponse} The greeting, version, and status metadata.
   */
  getHelloData(): HelloResponse {
    return {
      message: "Hello World from Sous Tools API!",
      version: config.APP_VERSION,
      status: "healthy",
    };
  }
}
