import createClient from "openapi-fetch";
import { io, type Socket } from "socket.io-client";
import type { paths } from "./schema";
import { config } from "@soustools/config";

export const createApiClient = (options: { baseUrl?: string } = {}) => {
  const baseUrl = options.baseUrl || config.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  const client = createClient<paths>({ baseUrl });

  client.use({
    onRequest: ({ request }) => {
      // Ensure all requests include credentials for cookie passing
      const nextRequest = request.credentials !== "include" 
        ? new Request(request, { credentials: "include" })
        : request;
        
      // Clone the request before it gets consumed by fetch() so we can replay it on 401
      (nextRequest as any)._retryClone = nextRequest.clone();
      return nextRequest;
    },
    onResponse: async ({ response, request }) => {
      // If we got a 401 and the request wasn't already trying to refresh the session
      if (response.status === 401 && !request.url.includes("/auth/refresh")) {
        try {
          // Attempt silent refresh using the strongly typed client
          const refreshRes = await client.POST("/auth/refresh");

          if (!refreshRes.error) {
            // Retry the original request using the unconsumed clone
            const retryReq = (request as any)._retryClone || request.clone();
            return await fetch(retryReq);
          }
        } catch (err) {
          // Fallthrough: If refresh fails, we just return the original 401
          console.error("Session refresh interceptor caught an error:", err);
        }
      }
      return response;
    }
  });

  return client;
};

const defaultBaseUrl = config.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Global singleton client for convenience in browser
export const api = createApiClient({ baseUrl: defaultBaseUrl });

// Encapsulated socket connection
export const socket: Socket = io(defaultBaseUrl, {
  withCredentials: true,
  autoConnect: false,
});

export async function uploadFile(file: File): Promise<string> {
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
        await api.POST("/auth/refresh");
      } catch (refreshErr) {
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
