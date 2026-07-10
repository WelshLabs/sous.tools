# Active Sprint

## Features & Enhancements

*   [ ] **Omnibar Uploads:**
    *   Implement attachment button functionality to reveal icons for file upload, camera, and Google Drive.
    *   Enable copy/paste file functionality within the input field.
    *   Ensure a visually appealing and user-friendly UI/UX.
    *   Add the ability to share content from other pages to the PWA, directing to `/home` with context in the omnibar.
*   [ ] **Knip Integration:**
    *   Set up Knip in the CI/CD pipeline.
    *   Display Knip results within the agent context.
    *   Plan for automatic GitHub issue creation based on urgency levels.
*   [ ] **API Client:**
    *   Generate a fully featured API client for front-end use, including auth helpers and file upload capabilities.
    *   Refactor the codebase to universally adopt the new API client.
*   [ ] **User Profile Button:**
    *   Replace hardcoded user initials ("CW") with actual user information.
*   [ ] **Supabase Migrations:**
    *   Address Supabase's updated database connection methods.
    *   Correct any incorrect migration URLs (e.g., `SUPABASEPOLLER_URL`).
    *   Verify and ensure all connections are working with the new methods.
    *   Clean up any unnecessary Infisical keys.
*   [ ] **Orders Page:**
    *   Add a dropdown with options to upload orders via Google Drive, camera, or image upload, utilizing shared components for ingestion into the queue with document type parameter.
    *   Implement filters on the slideout order view: open, pending review, and completed.
    *   Paginate completed orders, display all open orders.
    *   Navigate to the review screen when clicking on a pending review order.
    *   Allow uploading invoices not associated with an order from the main orders page via the dropdown.
    *   Consider using Next.js intercepting/parallel routes for a modal-based review screen.
*   [ ] **Recipes Page:**
    *   Change the header to "Recipes" from "Recipe Ingredients."
    *   Implement linking recipes to POS items (consider potential naming variations).
    *   Redesign the status queue bar into a toolbar under the header.
    *   Add a search input to filter recipes.
    *   Make the toolbar responsive.
    *   Remove the "Status Queue" tab and the associated icon.
    *   Replace the "APPROVED" tab with an "All Recipes" tab (defaulting to approved recipes).
    *   Use title case for tab names (e.g., "Pending Review" instead of "VERIFICATION QUEUE").
    *   Ensure the "Verification Queue" tab displays recipes pending verification.
    *   Clarify that the ingestion queue should show all ingestions, but specific pages should only show their own.
    *   Direct users to the review screen from the recipes page verification queue tab.
*   [ ] **Users Page:**
    *   Create an ADMIN-ONLY page for CRUD operations on users.
    *   Implement new API routes with robust security for admin-only actions.
    *   Admins should be able to add, edit, and remove users, as well as modify their profile values.
    *   Add a divider in the sidebar with admin-only links appearing below, visible only to admin users.
*   [ ] **Square Integration:**
    *   Fix the "Organization not loaded yet. Please refresh the page." error when connecting to Square.
    *   Load and display all sales data from Square on a dedicated sales screen.
    *   Load and display all items from Square, including modifiers, groups, categories, discounts, and units, in an item catalog editor page.
    *   Fetch and display orders from Square on an orders page and in the KDS.
    *   Create a transactions page to display Square transaction data.
    *   Implement a driver-based architecture to support integrations with other platforms like Toast and Lightspeed.
*   [ ] **Rename PWA:**
    *   Change the shortcut name to "sous.tools" or "Sous Tools".
    *   Update the PWA title bar from "Sous Tools Kitch-Sous Tools-Kitchen App" to "sous.tools".
    *   Style the browser chrome using standalone mode and `window-controls-overlay`.
    *   Add an app icon.
*   [ ] **Dark/Light Mode:**
    *   Ensure the UI correctly switches between dark and light modes.
    *   Implement a "system mode" option.
    *   Fix components to respond consistently to mode changes.
*   [ ] **New Relic Logging:**
    *   Configure New Relic with environment variables (`NEW_RELIC_NO_CONFIG_FILE: true`, `NEW_RELIC_LICENSE_KEY`, `NEW_RELIC_APP_NAME`).
    *   Set up New Relic as a Syslog TLS target endpoint in "Log Streams".
    *   Ensure isomorphic application-level logging bypasses Vercel's free tier limitations.
    *   Manage `NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY` securely via Infisical and Next.js inlining.
    *   Build a shared monorepo package (`@soustools/logger`) using 'pino' for full-stack logging.
    *   Implement global monkey-patching for `console.log`, `console.info`, `console.warn`, and `console.error`.
    *   Server: Format logs to structured JSON strings to stdout.
    *   Browser: Use `pino.browser.transmit` to capture client runtime crashes and POST errors to New Relic's Log Endpoint.
    *   Integrate logger initialization in root layout of Next.js apps.
    *   Install and embed `@vercel/analytics` and `@vercel/speed-insights`.
    *   Implement a global `error.tsx` boundary for client-side failures.
    *   Backend: Import `newrelic` on line 1 of `main.ts` and initialize the logger.
    *   Implement a global NestJS `ExceptionFilter` for backend exceptions.
    *   Offload network requests to separate threads where possible.
*   [ ] **Random Bugs:**
    *   Correct the Orders page heading from "Whiteboard."
    *   Address content overflow and responsiveness issues on the Orders page.
    *   Fix saving errors for order items.
    *   Resolve migration failures preventing vendor saving.
    *   Ensure recipes are importing correctly.
    *   Rename the "Ingestion Queue" and fix its data fetching/processing issues.
    *   Implement status indicators (processing, ready for review) on the ingestion queue page and review screens.
    *   Update the favicon to the blue lines icon with a transparent background and ensure it's appropriately sized.
    *   Reverse the order of Raspberry Pi Imager and Balena in the download instructions.
    *   Add visual confirmation for password confirmation on the settings page.
    *   Resolve the "infinite recursion detected in policy for relation 'org_members'" error when saving a new password.
    *   Remove the redundant logout button from the sidebar.
    *   Add autocomplete and duplicate checks to the Orders page.
    *   Implement order history checks and low inventory suggestions on the Orders page.
    *   Address the vertical scrollbar on the KDS page.
    *   Make the Vessel Manager configurable for imperial units (inches) and toggleable for volume display (ml/grams).
    *   Fix saving functionality for vessels and implement toast notifications and list updates.
*   [ ] **Dashboard Page:**
    *   Implement a "Financial Pulse" section with Real-Time Food Cost Percentage, Gross Profit (MTD), and Total Sales.
    *   Create a "Purchasing & Cost Alerts" section for Ingredient Price Spikes, Low Par Levels, Pending Reconciliations, and Today's Expected Deliveries.
    *   Develop a "Menu Profitability & Engineering" section including Top Margin Drivers, Margin Bleeders, and 86'd / Depleted Items.
    *   Add a "System & Hardware Health" section for Digital Signage Status and POS Sync Status.
    *   Utilize a grid layout with span-2 cards for key metrics and smaller cards for alerts and health checks.
    *   Employ a neon-glass UI design with blue accents for actionable alerts.
*   [ ] **Mobile App Bar:**
    *   Update the app bar to display: Dashboard, Recipes, Home icon, Orders.
    *   Remove the incorrect "Alerts" link and its association with the signage page.
    *   Consider displaying an alert badge elsewhere on the screen, not in the app bar.