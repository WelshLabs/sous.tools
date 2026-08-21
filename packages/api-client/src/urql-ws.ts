import {
  createClient as createWsClient,
  type Client as WsClient,
} from "graphql-ws";
import { clientConfig as config } from "@soustools/config/client";
import { onAuthRefreshed } from "./auth-session";

let activeWsClient: WsClient | null = null;
let activeWsUrl: string | null = null;

export function getDefaultWsUrl(): string {
  if (config.NEXT_PUBLIC_API_URL) {
    return (
      config.NEXT_PUBLIC_API_URL.replace(/^http/, "ws").replace(/\/$/, "") +
      "/graphql"
    );
  }
  return "ws://localhost:3000/graphql";
}

/**
 * Retrieves or creates a singleton `graphql-ws` WebSocket client for subscriptions.
 */
export function getSubscriptionWsClient(
  wsUrl?: string,
  headers?: Record<string, string>,
): WsClient | null {
  if (typeof window === "undefined") {
    return null;
  }

  const targetWsUrl = wsUrl || getDefaultWsUrl();

  if (!activeWsClient || activeWsUrl !== targetWsUrl) {
    activeWsUrl = targetWsUrl;
    activeWsClient = createWsClient({
      url: targetWsUrl,
      connectionParams: async () => ({
        headers: headers || {},
      }),
      retryAttempts: Infinity,
      shouldRetry: () => true,
    });
  }

  return activeWsClient;
}

/**
 * Disposes active subscription WebSocket client to force immediate reconnect.
 */
export function reconnectSubscriptionWs(): void {
  if (activeWsClient) {
    try {
      activeWsClient.dispose();
    } catch {
      // Non-fatal
    }
    activeWsClient = null;
    activeWsUrl = null;
  }
}

if (typeof window !== "undefined") {
  onAuthRefreshed(() => {
    reconnectSubscriptionWs();
  });
}
