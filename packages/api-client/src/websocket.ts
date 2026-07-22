import { io } from "socket.io-client";
import type { Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import { clientConfig as config } from "@soustools/config/client";
import { refreshAuthSession } from "./auth-session";

export interface WebSocketClientOptions {
  url?: string;
  namespace?: string;
  token?: string;
  query?: Record<string, string>;
  socketOptions?: Partial<ManagerOptions & SocketOptions>;
}

/**
 * Creates a generic, battle-hardened Socket.io WebSocket client instance.
 *
 * Automatically uses `config.NEXT_PUBLIC_API_URL` directly from `@soustools/config`.
 * Handles formatting credentials (`withCredentials: true`), connecting, and
 * automatically refreshing the auth session token via `refreshAuthSession()`
 * when encountering a 401 / Unauthorized exception.
 */
export function createWebSocketClient(
  options: WebSocketClientOptions = {}
): Socket {
  const baseUrl = options.url || config.NEXT_PUBLIC_API_URL;
  const namespace = options.namespace ? (options.namespace.startsWith("/") ? options.namespace : `/${options.namespace}`) : "";
  const targetUrl = `${baseUrl.replace(/\/$/, "")}${namespace}`;

  const socket = io(targetUrl, {
    auth: {
      token: options.token || "",
    },
    query: options.query,
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: true,
    ...options.socketOptions,
  });

  let isRefreshing = false;

  const handleAuthError = async (errorMsg: string) => {
    if (
      errorMsg.includes("Unauthorized") ||
      errorMsg.includes("expired") ||
      errorMsg.includes("No token provided")
    ) {
      if (isRefreshing) return;
      isRefreshing = true;

      try {
        console.warn("[api-client] WebSocket auth error encountered. Attempting session refresh...");
        const refreshed = await refreshAuthSession();

        if (refreshed) {
          console.log("[api-client] Auth session refreshed. Reconnecting WebSocket...");
          socket.disconnect();
          socket.connect();
          socket.emit("reauthenticated");
        } else {
          console.error("[api-client] Auth session refresh failed for WebSocket.");
        }
      } catch (err) {
        console.error("[api-client] Error during WebSocket auth refresh:", err);
      } finally {
        isRefreshing = false;
      }
    }
  };

  socket.on("exception", (error: { message?: string; status?: string }) => {
    const msg = error?.message || error?.status || "";
    handleAuthError(msg);
  });

  socket.on("connect_error", (error: Error) => {
    const msg = error?.message || "";
    handleAuthError(msg);
  });

  return socket;
}
