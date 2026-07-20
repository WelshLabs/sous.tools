import createClient from "openapi-fetch";
// "io" and "Socket" are not directly used in this file, but are necessary for the WebSocket functionality to be available.
import type { paths } from "./schema.js";
import { config } from "@soustools/config";

declare const process: { env: Record<string, string | undefined> };

export interface ApiClientOptions {
  baseUrl?: string;
}

export type ExtendedApiClient = ReturnType<typeof createClient<paths>>;

export const getBrowserApiUrl = (origin: string): string => {
  try {
    const url = new URL(origin);
    const { hostname, protocol } = url;

    // Local development (localhost, 127.0.0.1, etc.)
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.startsWith("192.168.")
    ) {
      // If we're on a dev port, the API is always on 3001
      return `${protocol}//${hostname}:3001`;
    }

    // Deployed environments under sous.tools
    if (hostname.endsWith(".sous.tools") || hostname === "sous.tools") {
      // If it is dev.sous.tools / dev-pos.sous.tools / dev-setup.sous.tools
      if (hostname.includes("dev")) {
        return "https://dev-api.sous.tools";
      }
      // If it is staging.sous.tools
      if (hostname.includes("staging")) {
        return "https://staging-api.sous.tools";
      }
      // Production defaults
      return "https://api.sous.tools";
    }

    return "";
  } catch {
    return "";
  }
};

export const getDefaultBaseUrl = () => {
  if (typeof window !== "undefined") {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    if (envUrl && envUrl !== "undefined" && envUrl !== "") {
      return envUrl;
    }
    const derivedUrl = getBrowserApiUrl(window.location.origin);
    if (derivedUrl) {
      return derivedUrl;
    }
  }
  return (
    config.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001"
  );
};

export const createApiClient = (options: ApiClientOptions = {}) => {
  const baseUrl = options.baseUrl || getDefaultBaseUrl();
  
  const client = createClient<paths>({ 
    baseUrl,
    credentials: "include", // Ensure cookies are passed by default in openapi-fetch
  });

  client.use({
    onRequest: async ({ request }) => {
      let nextRequest = request;

      // Ensure credentials include for cookie passing
      if (nextRequest.credentials !== "include") {
        nextRequest = new Request(nextRequest, { credentials: "include" });
      }
        
      // Clone the request before it gets consumed by fetch() so we can replay it on 401
      (nextRequest as any)._retryClone = nextRequest.clone();
      return nextRequest;
    },
    onResponse: async ({ response, request }) => {
      // If we got a 401 and the request wasn't already trying to refresh the session
      if (
        response.status === 401 &&
        !request.url.includes("/auth/refresh") &&
        !request.url.includes("/auth/login")
      ) {
        try {
          // Attempt silent refresh using the strongly typed client
          const refreshRes = await client.POST("/auth/refresh");

          if (refreshRes.response.status === 401 || refreshRes.response.status === 403) {
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
            throw new Error("SessionExpiredError");
          }

          if (!refreshRes.error) {
            let retryReq = (request as any)._retryClone || request.clone();
            
            // Ensure credentials is set on retry
            if (retryReq.credentials !== "include") {
              retryReq = new Request(retryReq, { credentials: "include" });
            }

            return await fetch(retryReq);
          }
        } catch (err) {
          if (err instanceof Error && err.message === "SessionExpiredError") {
            throw err;
          }
          // Fallthrough: If refresh fails, we just return the original 401
          console.error("Session refresh interceptor caught an error:", err);
        }
      }
      return response;
    }
  });

  return client;
};

const defaultBaseUrl = getDefaultBaseUrl();

// Global singleton client for convenience in browser
export const api = createApiClient({ baseUrl: defaultBaseUrl });

// Encapsulated socket connection
// export const socket: Socket = io(defaultBaseUrl, {
//   withCredentials: true,
//   autoConnect: false,
// });

export async function uploadFile(
  file: File
): Promise<string> {
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    const { data, error } = await api.POST("/storage/upload-url", {
      body: { fileName: file.name },
    });

    if (error) {
      throw new Error(`Failed to retrieve signed upload URL: ${JSON.stringify(error)}`);
    }

    const payload = data as any;
    if (!payload?.data?.signedUrl || !payload?.data?.publicUrl) {
      throw new Error("Invalid response structure from API for signed URL");
    }

    const { signedUrl, publicUrl } = payload.data;

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
      credentials: "omit", // Omit credentials to prevent browser cookies from causing 401s on the storage gateway
    });

    if (uploadRes.status === 401 && attempt < maxAttempts - 1) {
      attempt++;
      try {
        const refreshRes = await api.POST("/auth/refresh");
        if (refreshRes.response.status === 401 || refreshRes.response.status === 403) {
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          throw new Error("SessionExpiredError");
        }
      } catch (refreshErr) {
        if (refreshErr instanceof Error && refreshErr.message === "SessionExpiredError") {
          throw refreshErr;
        }
        console.error("Token refresh failed during file upload retry:", refreshErr);
      }
      continue;
    }

    if (!uploadRes.ok) {
      throw new Error(`Direct upload failed with status ${uploadRes.status}`);
    }

    return publicUrl;
  }

  throw new Error("File upload failed after maximum retry attempts");
}

export type { paths };
