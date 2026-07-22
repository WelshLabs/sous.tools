import { createRestClient } from "@soustools/api-client";

/**
 * Reads a specific cookie by name in a browser environment.
 */
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return decodeURIComponent(parts.pop()?.split(";").shift() || "");
  }
  return null;
}

/**
 * Clears the access token cookie by setting its expiration in the past.
 */
function clearCookie(name: string): void {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/**
 * Handles clearing credentials and redirecting to the login screen.
 */
export function onLogout(): void {
  clearCookie("soustools_access_token");
  clearCookie("sb-access-token");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Retrieve the current access token.
 */
export function getToken(): string | null {
  return getCookie("soustools_access_token") || getCookie("sb-access-token");
}

/**
 * Singleton API Client instance for the web frontend.
 * Totally disconnected from Supabase browser clients.
 */
export const api = createRestClient({
  credentials: "include",
});
