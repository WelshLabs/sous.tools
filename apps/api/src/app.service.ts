import { Injectable } from "@nestjs/common";
import { HelloResponse } from "@soustools/api-types";
import { serverConfig as config } from "@soustools/config/server";

const MOCK_NOTIFICATIONS = Array.from({ length: 55 }).map((_, i) => ({
  id: `notif-${i}`,
  title: `Notification ${i + 1}`,
  message: `This is the message for notification ${i + 1}.`,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  readAt: i % 3 === 0 ? new Date().toISOString() : null,
}));

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

  getNotifications(page: number = 1, limit: number = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = MOCK_NOTIFICATIONS.slice(startIndex, endIndex);
    
    return {
      data,
      total: MOCK_NOTIFICATIONS.length,
      page,
      limit,
      totalPages: Math.ceil(MOCK_NOTIFICATIONS.length / limit)
    };
  }

  getUnreadNotifications() {
    return MOCK_NOTIFICATIONS.filter((n) => !n.readAt);
  }
}
