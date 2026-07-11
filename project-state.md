# Active Sprint

Here's a summary of the active issues for this sprint:

- [ ] **omnibar uploads**
  - Add file upload, camera, and Google Drive icons after clicking the attachment button.
  - Implement copy/paste file functionality in the input.
  - Ensure visually appealing UI/UX for omnibar uploads.
  - Add PWA sharing functionality to share social pages or webpages to the omnibar.
- [ ] **new relic logging**
  - Implement isomorphic, application-level logging to stream telemetry to New Relic.
  - Manage the New Relic ingest key securely using Infisical.
  - Build a shared monorepo package (`@soustools/logger`) using 'pino' for global full-stack logging.
  - Intercept and format logs (JSON to stdout for server, transmit errors to New Relic for browser).
  - Integrate logger initialization in Next.js root layout and NestJS entry point.
  - Implement global error handling (`error.tsx` boundary and NestJS `ExceptionFilter`).
  - Offload network requests for logging to separate threads where possible.
  - Configure New Relic APM agent in NestJS.
  - Ensure proper integration with Vercel analytics and speed insights.
  - Analyze and utilize New Relic's free tier capabilities for comprehensive monitoring.
  - Distinguish metrics from the development codebase running on the same machine as production.