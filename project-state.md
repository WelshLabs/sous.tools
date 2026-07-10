# Active Sprint

## To Do

*   [ ] omnibar uploads: Implement UI for file uploads (file, camera, Google Drive) and copy/paste functionality. Enable sharing PWA content to the omnibar.
*   [ ] knip: Integrate knip into CI/CD pipeline. Ensure results are visible to agents. Explore automatic GitHub issue creation for urgent issues.
*   [ ] api client: Generate a fully functional API client for frontends, including authentication and file upload helpers. Refactor codebase to universally use this client.
*   [ ] user profile button: Display actual user information instead of a hardcoded placeholder.
*   [ ] use-omni-socket.hoot.ts: Refactor to remove direct access to `process.env`.
*   [ ] test issue: (No details provided, likely a placeholder).
*   [ ] Supabase migrations: Update database connection methods to comply with Supabase's new requirements. Clean up unused Infisical keys.
*   [ ] Orders Page:
    *   Add dropdown for uploading orders (Google Drive, camera, image) with shared ingestion process.
    *   Implement filters for "open", "pending review", and "completed" orders on the slideout sheet. Paginate "completed" orders.
    *   Enable uploading invoices not associated with an order from the main orders page.
    *   Consider a modal window for the review screen using Next.js intercepting routes.
*   [ ] Recipes Page:
    *   Update header to "Recipes" from "Recipe Ingredients".
    *   Implement linking recipes to POS items.
    *   Redesign the status queue bar into a responsive toolbar under the header, including a search input.
    *   Remove "Status Queue" icon and text.
    *   Replace "APPROVED" tab with "All Recipes" (defaulting to approved recipes).
    *   Change tab titles to proper case and rename "Verification Queue" to "Pending Review".
    *   Ensure the "Pending Review" tab displays unverified recipes.
    *   Clarify that the ingestion queue page should show all ingestions, while individual pages show their specific ingestions.
    *   Link recipes in the verification queue to the review screen.
*   [ ] Users Page:
    *   Create an ADMIN-ONLY page to CRUD users, exposing new API routes with robust security.
    *   Admins should be able to add, edit, and remove users, and modify their profile values.
    *   Add a divider and admin-only links to the sidebar, visible only to admin users.
*   [ ] Square Integration:
    *   Fix the "Organization not loaded yet" error when connecting to Square.
    *   Display all sales data from Square on a dedicated screen.
    *   Implement an item catalog editor on a separate page to view and manage Square items (modifiers, groups, categories, discounts, units, etc.).
    *   Fetch orders from Square and display them on an orders page and the KDS.
    *   Create a transactions page to display Square transaction data.
    *   Design for driver-based implementation to support other integrations (Toast, Lightspeed, etc.).
*   [ ] rename pwa:
    *   Change the app's name to "sous.tools" or "Sous Tools".
    *   Correct the PWA titlebar to display "sous.tools".
    *   Style the chrome using standalone mode and window-controls-overlay.
    *   Add a proper app icon.
*   [ ] dark/light mode:
    *   Fix dark/light mode switching to include a system mode option.
    *   Ensure all components respond correctly to mode changes.
*   [ ] new relic logging:
    *   Configure environment variables for New Relic logging.
    *   Set up New Relic as a Syslog TLS target in "Log Streams".
    *   Implement isomorphic, application-level logging to bypass Vercel's free tier limitations.
    *   Manage the New Relic license key securely using Infisical and Next.js inlining.
    *   Build a shared package for global full-stack logging with 'pino'.
    *   Implement a global monkey-patching wrapper for console methods.
    *   Configure server-side logging to structured JSON to stdout.
    *   Implement client-side log transmission to New Relic's Log Endpoint for 'error' level logs.
    *   Integrate `@vercel/analytics` and `@vercel/speed-insights`.
    *   Implement a global `error.tsx` boundary component for client-side failures.
    *   Initialize New Relic APM agent and logger in NestJS backend.
    *   Implement a global NestJS `ExceptionFilter` for backend exceptions.
    *   Offload network requests for logging to separate threads.
*   [ ] Random Bugs:
    *   Orders page: Fix heading, responsiveness, content overflow, item saving errors.
    *   Fix failing migration causing vendor saving issues.
    *   Resolve recipe import failures.
    *   Ingestion queue: Rename, fix data fetching, implement status badges/indicators for processing and review readiness.
    *   Favicon: Update to blue lines, increase size, ensure transparent background.
    *   Settings page (Downloads tab): Reverse the order of Raspberry Pi Imager and Balena instructions.
    *   Settings page (General settings tab): Add visual confirmation for password confirmation, fix "infinite recursion detected" error when saving passwords.
    *   Remove redundant logout button in the sidebar.
    *   Order page autocomplete, duplicate checks, order history review, low inventory suggestions.
    *   KDS page: Remove weird vertical scrollbar.
    *   Vessel manager: Add option for inches, toggle volume to grams, fix saving vessels and toast notifications.
*   [ ] dashboard page:
    *   Implement "Financial Pulse" section: Real-Time Food Cost Percentage, Gross Profit (MTD), Total Sales.
    *   Implement "Purchasing & Cost Alerts" section: Ingredient Price Spikes, Low Par Levels, Pending Reconciliations, Today's Expected Deliveries.
    *   Implement "Menu Profitability & Engineering" section: Top Margin Drivers, Margin Bleeders, 86'd / Depleted Items.
    *   Implement "System & Hardware Health" section: Digital Signage Status, POS Sync Status.
    *   Utilize a grid layout with neon-glass UI design.
*   [ ] mobile app bar:
    *   Update to display: Dashboard, Recipes, Home icon, Orders.
    *   Consider an alert badge elsewhere on the screen, not in the app bar.
    *   Correctly route alerts to the appropriate page.