# Active Sprint

## Features & Enhancements

- [ ] **Omnibar Uploads**: Implement file upload functionality within the omnibar, including options for file upload, camera capture, and Google Drive integration. Allow copy/paste of files into the input. Also, enable sharing content from other pages to the PWA, directing to the omnibar with context. (enhancement, design-system, frontent)
- [ ] **knip CI/CD Integration**: Set up knip in the CI/CD pipeline. Results should be visible to all agents. Explore automatic GitHub issue creation for urgent findings.
- [ ] **API Client Generation**: Generate a comprehensive API client for frontend use, including authentication helpers and file upload capabilities. Refactor the codebase to universally adopt this client.
- [ ] **User Profile Button**: Display real user information instead of a hardcoded placeholder.
- [ ] **Orders Page**:
    - Add a button with a dropdown for uploading orders via Google Drive, camera, or image upload, using shared components.
    - Implement filters for "Open", "Pending Review", and "Completed" orders in the slideout sheet. Paginate "Completed" orders, display all "Open" orders.
    - Clicking a "Pending Review" order should navigate to the review screen.
    - Allow uploading invoices not associated with an order from the main orders page.
    - Consider using Next.js intercepting and parallel routes for a modal review screen.
- [ ] **Recipes Page**:
    - Change the header to "Recipes" from "Recipe Ingredients".
    - Implement linking Recipes to POS items.
    - Redesign the status queue bar into a responsive toolbar under the header.
    - Add a search input to filter recipes.
    - Rename "Verification Queue" tab to "Pending Review".
    - Ensure the "Pending Review" tab displays unverified recipes.
    - Synchronize ingestion queue to show all ingestions, with specific ingestions displayed on their respective upload pages.
    - Clicking an item in the "Pending Review" tab should navigate to the review screen.
- [ ] **Users Page (Admin Only)**:
    - Create a page for administrators to CRUD users.
    - Implement new API routes with necessary security for admin-only actions.
    - Admins should be able to add, edit, and remove users, as well as modify their profile values.
    - Add a divider in the sidebar with admin-only links, visible only to admin users.
- [ ] **Square Integration**:
    - Fix the "Organization not loaded yet" error when connecting to Square.
    - Load and display all sales data from Square on a dedicated screen.
    - Load all items from Square and create an item catalog editor page for viewing items, modifiers, groups, categories, discounts, and units.
    - Fetch orders from Square, display them on an orders page, and show them in the KDS.
    - Implement a transactions page to fetch data from Square.
    - Design for driver-based implementation to support other POS systems like Toast and Lightspeed.
- [ ] **Rename PWA**:
    - Change the shortcut name to "sous.tools" or "Sous Tools".
    - Correct the PWA titlebar to "sous.tools".
    - Style the Chrome using standalone mode and window-controls-overlay.
    - Add an app icon.
- [ ] **Dashboard Page**:
    - Implement "Real-Time Food Cost Percentage", "Gross Profit (MTD)", and "Total Sales" in the "Financial Pulse" section.
    - Display "Ingredient Price Spikes", "Low Par Levels", "Pending Reconciliations", and "Today's Expected Deliveries" in the "Purchasing & Cost Alerts" section.
    - Show "Top Margin Drivers", "Margin Bleeders", and "86'd / Depleted Items" in the "Menu Profitability & Engineering" section.
    - Include "Digital Signage Status" and "POS Sync Status" in the "System & Hardware Health" section.
    - Utilize a grid layout with neon-glass UI design for cards.

## Technical Debt & Infrastructure

- [ ] **knip Setup**: Set up knip in the CI/CD pipeline.
- [ ] **API Client Refactor**: Refactor the codebase to universally adopt the new API client.
- [ ] **Supabase Migrations & Connection Verification**: Update Supabase connection methods and verify all connections. Clean up unused Infisical keys.
- [ ] **Environment Variable Handling**: Address `process.env` access in `use-omni-socket.hoot.ts`.
- [ ] **New Relic Logging**: Implement isomorphic logging for New Relic, including server and browser configurations, Next.js frontend and NestJS backend integration, and cloud deployment setup.
- [ ] **Dark/Light Mode Fixes**: Resolve issues with dark/light mode not changing, lack of system mode option, and components not responding correctly to mode changes.

## Bug Fixes

- [ ] **Random Bugs**:
    - Fix Orders page heading, responsiveness, content overflow, and order item saving errors.
    - Resolve migration failures preventing vendor saving.
    - Fix recipe import issues.
    - Address Ingestion Queue: rename, fix data fetching, and implement status indicators.
    - Fix favicon display and size.
    - Correct the order of download instructions for Raspberry Pi Imager and Balena.
    - Implement visual confirmation for password confirmation and resolve the "infinite recursion detected" error when saving a new password.
    - Remove redundant logout button from the sidebar.
    - Add autocomplete to the Order page.
    - Check for duplicate orders and review order history.
    - Implement suggestions for low-inventory items.
    - Fix KDS page's vertical scrollbar.
    - Make Vessel Manager support inches and toggleable volume units (grams over ml).
    - Fix saving vessels in Vessel Manager.
- [ ] **Mobile App Bar**:
    - Correctly display "Dashboard", "Recipes", "Home icon", and "Orders".
    - Remove incorrect "Alerts" functionality from the app bar.
    - Implement an alert badge elsewhere on the screen.