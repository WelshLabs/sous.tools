import { clientConfig as config } from "@soustools/config/client";

let refreshPromise: Promise<boolean> | null = null;

export type AuthRefreshListener = () => void | Promise<void>;
const refreshListeners = new Set<AuthRefreshListener>();

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
          console.error("[api-client] Async error in onAuthRefreshed listener:", err);
        });
      }
    } catch (err) {
      console.error("[api-client] Error in onAuthRefreshed listener:", err);
    }
  }
}

export async function refreshAuthSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const baseUrl = config.NEXT_PUBLIC_API_URL;
      const url = baseUrl.endsWith("/graphql") ? baseUrl : `${baseUrl.replace(/\/$/, "")}/graphql`;
      
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `mutation RefreshSession { refreshSession }`
        })
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
      
      const json = await response.json();
      if (json.errors || !json.data?.refreshSession) {
         if (
          typeof window !== "undefined" &&
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
