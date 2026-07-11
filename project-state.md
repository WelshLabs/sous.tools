# Active Sprint

## :hammer: In Progress

### Frontend
- [ ] **omnibar uploads**
    - Implement attachment options (file upload, camera, Google Drive).
    - Enable copy/paste file functionality into the input.
    - Design visually appealing UI/UX for the omnibar.
    - Implement PWA share target functionality to share to the omnibar with context.

### DevOps & Backend
- [ ] **new relic logging**
    - Implement isomorphic, application-level logging to stream telemetry to New Relic.
    - Securely manage `NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY` via Infisical.
    - Build a shared monorepo package (`@soustools/logger`) using 'pino' for global full-stack logging.
    - Implement a global monkey-patching wrapper for `console.log`, `info`, `warn`, `error`.
    - Configure server-side logging to format logs to standard out (stdout) as structured JSON.
    - Configure browser-side logging with `pino.browser.transmit` to POST client runtime crashes to New Relic's Log Endpoint (error level only).
    - Integrate logger initialization in the root layout of Next.js applications.
    - Embed `@vercel/analytics` and `@vercel/speed-insights` into the root DOM tree layout.
    - Implement a global `error.tsx` boundary component for Next.js client-side failures.
    - Initialize New Relic APM agent and logger wrapper in NestJS `main.ts`.
    - Implement a global NestJS `ExceptionFilter` for unhandled backend exceptions.
    - Configure Infisical secrets sync to Vercel or use Infisical CLI for build tasks.
    - Offload network requests for logging to separate threads (queues/workers).
    - Analyze and implement full New Relic monitoring capabilities on the free tier.
    - Ensure metrics from remote development environment (`code-server`) are reported and distinguished.