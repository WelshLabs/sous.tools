/**
 * Singleton API client for the pos-simulator app.
 *
 * Lives inside the Next.js app so the compiler can inline
 * `process.env.NEXT_PUBLIC_API_URL` at build time.
 */
import { createApiClient } from "@soustools/api-client";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});
