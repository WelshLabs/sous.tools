# Active Sprint

## To Do

*   [ ] **Omnibar Uploads:** Implement file upload functionality for the omnibar, including options for file upload, camera access, and Google Drive integration. Allow copy/pasting files into the input. Ensure a visually appealing UI/UX. Add functionality to share to the PWA from other pages, taking the user to `/home` and pre-filling the omnibar. (Labels: enhancement, devops, frontend, design-system)
*   [ ] **New Relic Logging:** Integrate New Relic for logging across the application.
    *   Set up standard environment variables (`NEW_RELIC_NO_CONFIG_FILE: true`, `NEW_RELIC_LICENSE_KEY`, `NEW_RELIC_APP_NAME`).
    *   Configure New Relic as a Syslog TLS target in "Log Streams".
    *   Bypass Vercel free tier limitations by implementing isomorphic, application-level logging.
    *   Manage the New Relic ingest key securely via Infisical, adhering to Next.js compile-time inlining for `NEXT_PUBLIC_` variables.
    *   Build a shared monorepo package (`@soustools/logger`) using `pino` for global full-stack logging.
    *   Implement a global monkey-patching wrapper for `console.log`, `console.info`, `console.warn`, and `console.error`.
    *   Server Configuration (NestJS & Server Components): Format logs to structured JSON strings to standard out (stdout).
    *   Browser Configuration (Next.js Client Components): Use `pino.browser.transmit` to POST client runtime crashes asynchronously to New Relic's Log Endpoint. Optimize by only transmitting error-level logs.
    *   Next.js Frontend Integration: Import and execute the global logger initialization wrapper in the root layout of all Next.js applications. Embed Vercel `@vercel/analytics` and `@vercel/speed-insights` modules. Implement a global `error.tsx` boundary component.
    *   NestJS Backend API Integration: Import and execute the New Relic APM agent module on Line 1 of `main.ts`. Initialize the global logger wrapper below it. Implement a global NestJS `ExceptionFilter` to catch unhandled backend exceptions.
    *   Cloud Deployment & Log Pipelines: Store `NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY` in Infisical and sync secrets to Vercel or wrap build tasks with the Infisical CLI.
    *   Analyze and implement comprehensive New Relic monitoring on the Oracle Cloud infrastructure, distinguishing between production and remote development metrics.
    *   Offload network requests for logging to separate threads where possible.
    *   Utilize `instrumentation.ts` and `instrumentation-client.ts` in Next.js apps as needed. (Labels: enhancement, backend, devops, frontend)