import { Injectable } from "@nestjs/common";
import { HelloResponse } from "@soustools/api-types";

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
      version: "1.0.0",
      status: "healthy",
    };
  }
}
