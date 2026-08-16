import { io } from "socket.io-client";
import type { Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import { clientConfig as config } from "@soustools/config/client";
import { refreshAuthSession } from "./auth-session";

export interface WebSocketClientOptions {
  url?: string;
  namespace?: string;
  token?: string;
  getToken?: () => string | Promise<string>;
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
 *
 * Fixes stale socket token trap by dynamically updating socket.auth with the new token
 * before reconnecting.
 */
export function createWebSocketClient(
  options: WebSocketClientOptions = {},
): Socket {
  const baseUrl = options.url || config.NEXT_PUBLIC_API_URL;
  const namespace = options.namespace
    ? options.namespace.startsWith("/")
      ? options.namespace
      : `/${options.namespace}`
    : "";
  const targetUrl = `${baseUrl.replace(/\/$/, "")}${namespace}`;

  const socket = io(targetUrl, {
    // auth: {
    //   token: options.token || "",
    // },
    auth: async (cb) => {
      // This function runs every single time socket.connect() fires
      let token = options.token;
      if (options.getToken) {
        try {
          token = await options.getToken();
        } catch (err) {
          console.error("[api-client] Failed to retrieve token via getToken():", err);
        }
      }

      cb({ token: token || "" });
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
      errorMsg.includes("No token provided") ||
      errorMsg.includes("401") ||
      errorMsg.includes("jwt expired")
    ) {
      if (isRefreshing) return;
      isRefreshing = true;

      try {
        console.warn(
          "[api-client] WebSocket auth error encountered. Attempting session refresh...",
        );
        const refreshed = await refreshAuthSession();

        if (refreshed) {
          console.log(
            "[api-client] Auth session refreshed. Updating socket auth and reconnecting...",
          );
          socket.disconnect();

          let newToken = options.token;
          if (options.getToken) {
            try {
              newToken = await options.getToken();
            } catch (err) {
              console.error(
                "[api-client] Failed to retrieve new token via getToken():",
                err,
              );
            }
          }

          if (typeof socket.auth === "object" && socket.auth !== null) {
            socket.auth = {
              ...socket.auth,
              ...(newToken ? { token: newToken } : {}),
            };
          }

          socket.connect();
          socket.emit("reauthenticated");
        } else {
          console.warn(
            "[api-client] Auth session refresh returned false. Socket remains disconnected without forced logout.",
          );
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
