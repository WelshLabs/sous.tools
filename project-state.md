# Active Sprint

Here's a summary of the open issues for the current sprint:

## 🚀 Features & Enhancements

*   [ ] **Omnibar Uploads:**
    *   Implement attachment options (file upload, camera, Google Drive).
    *   Enable copy/paste file functionality into the input.
    *   Focus on visually appealing UI/UX for the omnibar.
    *   Add PWA share target functionality, directing to `/home` with context in the omnibar.
*   [ ] **New Relic Logging:**
    *   Integrate New Relic logging for comprehensive telemetry.
    *   Implement isomorphic, application-level logging to bypass Vercel free tier limitations.
    *   Centralize secret handling for the New Relic ingest key using Infisical.
    *   Build a shared `pino` logger package (`@soustools/logger`) for global full-stack logging.
    *   Configure server-side logging to output structured JSON to stdout.
    *   Configure client-side logging to transmit error-level logs asynchronously to New Relic.
    *   Initialize the logger wrapper in Next.js root layouts and NestJS `main.ts`.
    *   Integrate `@vercel/analytics` and `@vercel/speed-insights` into Next.js root layout.
    *   Implement `error.tsx` boundary for client-side error catching.
    *   Implement a global NestJS `ExceptionFilter` for backend error handling.
    *   Configure cloud deployment pipelines and ensure secrets are synced to Vercel or available during build.
    *   Offload network requests for logging to separate threads.
    *   Monitor Oracle Cloud infrastructure, including remote development environments.