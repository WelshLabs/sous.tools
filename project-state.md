# Active Sprint

Here's a summary of the currently open GitHub issues for the active sprint:

- [ ] **omnibar uploads** (enhancement, devops, frontend, design-system)
  - Implement file upload functionality for the omnibar.
  - Include options for file upload, camera access, and Google Drive integration.
  - Enable copy/paste file functionality into the input field.
  - Ensure a visually appealing UI/UX.
  - Add PWA sharing capability to send links to the app, opening the omnibar with context.

- [ ] **new relic logging** (enhancement, backend, devops, frontend)
  - Configure New Relic logging for the application.
  - Implement isomorphic, application-level logging to stream telemetry to New Relic without impacting the Vercel free tier.
  - Centralize secret handling for the New Relic ingest key using Infisical.
  - Utilize 'pino' for a shared monorepo logging utility.
  - Implement monkey-patching for `console.log`, `console.info`, `console.warn`, and `console.error`.
  - Format logs to structured JSON for server-side (stdout).
  - Use `pino.browser.transmit` for client-side error logging to New Relic's Log Endpoint.
  - Integrate logger initialization into Next.js root layouts.
  - Embed Vercel analytics and speed insights.
  - Implement an `error.tsx` boundary for client-side failures.
  - Integrate the New Relic APM agent into the NestJS backend (`main.ts`).
  - Implement a global NestJS `ExceptionFilter` for backend exceptions.
  - Store `NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY` in Infisical and sync to Vercel.
  - Analyze and leverage the New Relic free tier for comprehensive monitoring.
  - Ensure metrics for remote development environments are also reported and distinguished.
  - Offload network requests for logging to separate threads where possible.
  - Utilize `instrumentation.ts` and `instrumentation-client.ts` in Next.js apps.