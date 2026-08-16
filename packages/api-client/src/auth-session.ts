import { clientConfig as config } from "@soustools/config/client";

let refreshPromise: Promise<boolean> | null = null;

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
