import { clientConfig as config } from "@soustools/config/client";

let refreshPromise: Promise<boolean> | null = null;

export type AuthRefreshListener = () => void | Promise<void>;
const refreshListeners = new Set<AuthRefreshListener>();

/**
 * Register a callback to be invoked whenever auth session is refreshed.
 * Used to transparently reconnect WebSockets and subscriptions.
 */
export function onAuthRefreshed(listener: AuthRefreshListener): () => void {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

export function notifyAuthRefreshed(): void {
  for (const listener of refreshListeners) {
    try {
      const res = listener();
      if (res && typeof (res as Promise<void>).catch === "function") {
        (res as Promise<void>).catch((err: unknown) => {
          console.error(
            "[api-client] Async error in onAuthRefreshed listener:",
            err,
          );
        });
      }
    } catch (err) {
      console.error("[api-client] Error in onAuthRefreshed listener:", err);
    }
  }
}

/**
 * Centralized auth session refresh mutex.
 *
 * Ensures that if multiple transport clients (REST, GraphQL, WebSocket)
 * encounter an unauthenticated response simultaneously, only a single
 * refresh request is sent over the network. All concurrent callers wait
 * for the same promise to resolve.
 */
export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = config.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        if (
          typeof window !== "undefined" &&
          (response.status === 401 || response.status === 403) &&
          window.location.pathname !== "/login"
        ) {
          window.location.href = "/login";
        }
        return false;
      }

      notifyAuthRefreshed();
      return true;
    } catch (err) {
      console.error("[api-client] Auth session refresh error:", err);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}
