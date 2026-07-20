/**
 * Singleton API client for the web app.
 *
 * This file MUST live inside the Next.js app so that the compiler can inline
 * `process.env.NEXT_PUBLIC_API_URL` at build time.  Shared packages (e.g.
 * @soustools/api-client) are compiled outside Next.js and therefore never
 * receive the NEXT_PUBLIC_* substitution — which is why the singleton must
 * not live there.
 */
import { createApiClient } from "@soustools/api-client";

export const api = createApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
});
