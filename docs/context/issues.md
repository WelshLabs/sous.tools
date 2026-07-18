---

---

---

---

---

---

author: conarwelsh
association: owner
edited: false
status: none
--

## Implementation Plan:

1.  **Fix Jest Configuration for CLI:**
    - Locate and modify the Jest configuration files within the `apps/cli` directory.
    - Ensure that Jest is correctly configured to detect and execute all unit tests within this package.
    - Verify that the CLI test runner is functioning as expected and reports a passing status.

2.  **Fix NestJS Tests for API:**
    - Identify the unit tests for the `apps/api` (NestJS) project.
    - Debug and correct any issues preventing these tests from running or causing them to fail.
    - Confirm that all API tests pass.

3.  **Expand Coverage for Domain Packages:**
    - Once both CLI and API test runners are confirmed to be passing, focus on the `@soustools/domain-*` packages.
    - For each component within these packages, generate comprehensive unit tests.
    - Adhere to the established Container/View testing philosophy when writing new tests.
    - Ensure that all newly added tests are executed and pass.

4.  **Final Verification:**
    - After implementing all the above steps, conduct a final review of all test suites across CLI, API, and domain packages.
    - Confirm that all tests are passing and that the overall code coverage meets the desired target.
      \--

---

---

author: conarwelsh
association: owner
edited: false
status: none
--

Here is my plan to address the issue:

**Step 1: Locate all `eslint-disable` comments**

I will perform a global search across the entire monorepo to find every instance of `// eslint-disable-next-line` and `/* eslint-disable */`. I will pay special attention to `packages/domain-pos` and `apps/api` as instructed.

**Step 2: Analyze and categorize each violation**

For each located comment, I will:

1.  Temporarily remove the `eslint-disable` comment.
2.  Run the linter to understand the specific rule being violated.
3.  Categorize the violation (e.g., `any` type usage, missing dependency, incorrect import path, architectural rule break).

**Step 3: Fix the underlying code issue**

Based on the violation category, I will implement the correct fix in accordance with the project's `.cursorrules`. This may involve:

- Adding proper TypeScript types to replace `any`.
- Installing missing dependencies in the correct `package.json`.
- Refactoring code to comply with the established container/view pattern.
- Ensuring all database access is properly isolated within `apps/api`.
- Moving domain-specific components out of the generic design system.

**Step 4: Verify the fix**

After applying the fix, I will run the linter and type-checker again to confirm that the original error is resolved and no new errors have been introduced.

**Step 5: Commit and document**

I will commit each fix individually with a clear message explaining the violation and the solution.

**Step 6: Update GitHub Issue**

Once all `eslint-disable` comments have been removed and the underlying issues fixed, I will post my final comment on the issue.
--

author: conarwelsh
association: owner
edited: false
status: none
--

Here is the implementation plan:

1.  **Identify Target Files:**
    - Use a tool to search for all files within `packages/domain-pos` and `apps/api` that contain `// eslint-disable-next-line` or `/* eslint-disable */` comments.

2.  **Analyze and Fix:**
    - For each identified `eslint-disable` comment:
      - Examine the surrounding code to understand why the disable comment was added.
      - Address the underlying TypeScript issue (e.g., incorrect types, missing dependencies, architectural violations). This may involve refactoring code, adding necessary types, or adjusting architectural patterns.
      - Remove the `eslint-disable` comment.

3.  **Verification:**
    - After addressing all `eslint-disable` comments, run the project's linting and type-checking tools to ensure no new errors have been introduced.
    - If applicable, run the project's test suite to ensure the code changes have not broken existing functionality.

4.  **Create Pull Request:**
    - Commit the changes with a clear message indicating that `eslint-disable` comments have been removed and underlying issues fixed.
    - Create a pull request for these changes.
      \--

---

---

---

---

author: conarwelsh
association: owner
edited: false
status: none
--

this also remains true for our packages/domain-* packages, they have the same issues
--

---

---

---

author: sous-tools
association: contributor
edited: false
status: none
--

This issue outlines the development of a comprehensive new tenant onboarding process. It starts with a registration page for new tenants, which also creates their tenant record. After login, users will follow a tutorial experience, eventually leading them to a tenant settings tab. This tab will facilitate Stripe integration for recurring billing and provide options to change their subscription plan, thereby influencing application functionality. Furthermore, the application needs to implement feature gating using Next.js `unauthorized.ts` files, guiding users to upgrade their plan for restricted features.
--

author: sous-tools
association: contributor
edited: false
status: none
--

## Diagnosis Report: Registration Page & Tenant Onboarding

This issue requires implementing a full tenant onboarding flow, from registration and tenant creation to billing setup and feature gating. The core involves creating new frontend pages, expanding backend API capabilities for tenant and billing management, updating the database schema, and integrating feature authorization across the application.

Here are the specific files that require modification or creation:

- **apps/web/src/app/register/page.tsx**
  This new Next.js page will host the user registration form, allowing new tenants to sign up and initiate the tenant creation process.

- **apps/web/src/app/actions/auth.ts**
  This file will need to be extended to include a server action for handling new user registration, which will interact with Supabase authentication and then trigger the backend tenant creation.

- **apps/web/src/app/layout.tsx**
  Logic should be added here to check if a newly registered user needs to be redirected to the tutorial experience (issue #45) immediately after login.

- **apps/web/src/app/(workspace)/settings/page.tsx**
  This existing settings page will be modified to include a new tab or section dedicated to tenant settings, billing information, and subscription plan management.

- **apps/web/src/app/(workspace)/settings/settings-client.tsx**
  The client-side logic for the settings page will be updated to manage the state and display of the new tenant and billing settings tab.

- **packages/domain-settings/src/tenant-billing-settings.tsx** (New File)
  A new React component will be created within the `domain-settings` package to encapsulate the UI for entering Stripe billing information and selecting/changing tiered subscription plans.

- **apps/web/src/app/(workspace)/unauthorized.ts** (New File)
  Following the specified convention, this file will be created to serve as a custom page or component displayed when a user attempts to access a feature that is not included in their current subscription plan.

- **apps/api/src/app.module.ts**
  The main API module will need to import and register new modules for handling tenant management and Stripe billing logic.

- **apps/api/src/modules/tenants/tenants.module.ts** (New File)
  A new NestJS module will be created to group all tenant-related controllers, services, and other components.

- **apps/api/src/modules/tenants/tenants.controller.ts** (New File)
  This controller will expose API endpoints for creating, retrieving, and updating tenant records, including their associated subscription plan.

- **apps/api/src/modules/tenants/tenants.service.ts** (New File)
  This service will contain the business logic for managing tenant data, linking new tenants to Supabase user IDs, and updating their subscription status.

- **apps/api/src/modules/billing/billing.module.ts** (New File)
  A new NestJS module for Stripe integration will be created, containing services and controllers to handle payment processing and subscription management.

- **apps/api/src/modules/billing/billing.controller.ts** (New File)
  This controller will provide API endpoints for initiating Stripe checkout sessions, handling webhook callbacks from Stripe, and managing subscriptions.

- **apps/api/src/modules/billing/billing.service.ts** (New File)
  This service will encapsulate the logic for interacting with the Stripe API to create customers, manage subscriptions, and update the internal database with billing status.

- **packages/api-types/src/index.ts**
  New TypeScript interfaces and types for `Tenant`, `Subscription`, and `BillingInfo` will need to be defined and exported here for use across the frontend and backend.

- **packages/supabase/schema.sql**
  The Supabase schema will be updated to include new tables for `tenants` and `subscriptions`, establishing relationships with the existing `auth.users` table.

- **supabase/migrations/YYYYMMDDHHMMSS_create_tenants_and_subscriptions.sql** (New File)
  A new SQL migration script will be generated to apply the necessary database schema changes for tenants and subscriptions.

- **apps/api/src/common/guards/feature-access.guard.ts** (New File)
  A custom NestJS guard will be implemented to check a user's subscription plan against the required access level for specific API routes, enforcing feature gating on the backend.
  \--
  author: conarwelsh
  association: owner
  edited: false
  status: none
  \--
  there is a link on the login page to go to the registration page, but it does not yet exist. A link will also need to be added with content as well from the marketing page.
  \--

---

author: conarwelsh
association: owner
edited: false
status: none
--

#### **Implementation Plan for the Agent:**

1. **Design System (Shadcn Primitives):**
   - Ensure the Shadcn `Popover` component is installed and resides in its own isolated folder at `packages/design-system/src/components/popover/`.

2. **Feature Folder Co-location:**
   - Create a grouped feature folder at `apps/web/src/features/tutorial/`. All tutorial-specific components must be co-located here.

3. **The View (`TutorialTip.tsx`):**
   - Create this file inside the `tutorial/` folder. It must be a pure, props-driven presentational component utilizing the Shadcn Popover.
   - Apply our Neon-Glass aesthetic (Frosted glass `backdrop-filter: blur()`, cyan/blue accent glowing shadows).
   - Animate its entrance using Framer Motion (`type: "spring", stiffness: 300, damping: 30`) and give it a continuous, slow 4-second breathing scale pulse (1.0 to 1.02).

4. **The Logic (`TutorialWrapper.container.tsx`):**
   - Create this file right next to the view inside the `tutorial/` folder.
   - This container must check the user's `completed_tutorials` string array. If the `stepKey` is missing, it renders the `TutorialTip`.
   - When the user dismisses the tip, the container MUST exclusively use `@soustools/api-client` to send a mutation to the backend to mark it complete. (Do not use native `fetch()`).

5. **Backend Updates:**
   - Update the NestJS API and Supabase infrastructure packages to support reading and appending a `stepKey` to the `completed_tutorials` array on the user profile.

--

---

author: sous-tools
association: contributor
edited: false
status: none
--

This issue proposes significant enhancements for the Recipes Page, focusing on improved user onboarding, recipe discovery, and management. Key requests include an initial tutorial for adding recipes via the omnibar and an informative empty state message. Further, it calls for a better recipe listing method and the introduction of core functionalities such as pinning, marking favorites, robust search capabilities, and advanced filtering options based on tags, categories, dietary restrictions, and cuisine types.
--

author: sous-tools
association: contributor
edited: false
status: none
--

### Diagnosis Report

This issue proposes significant enhancements to the Recipes Page, impacting both the web application's frontend and the API's backend. The core changes involve introducing advanced discovery features (search, filter, pin, favorite) and improving user onboarding with tutorials and informative empty states.

- **apps/web/src/app/(workspace)/recipes/page.tsx**
  This file, as the main entry point for the Recipes page, will need to implement the tutorial step for the omnibar, render the informative empty state when no recipes exist, and integrate the new search and filtering UI.

- **apps/web/src/app/(workspace)/recipes/RecipesClientPage.tsx**
  This client-side component will manage the state for search queries and filters, handle user interactions for pinning and favoriting recipes, and orchestrate the display of filtered/sorted recipes.

- **packages/domain-recipes/src/RecipeList.tsx**
  This component, responsible for rendering the list of recipes, will need to be updated to visually accommodate pinned and favorited recipes, and dynamically display results from search and filter operations.

- **packages/domain-recipes/src/RecipeCard.tsx**
  The individual recipe card component will require modifications to include UI elements that allow users to mark recipes as favorites or pin them, and to display their current pinned/favorited status.

- **packages/domain-recipes/src/RecipeFilter.tsx**
  This existing filter component will be extended to include new filtering options such as tags, categories, dietary restrictions, and cuisine type, and can also incorporate the search input functionality.

- **apps/api/src/modules/recipe/recipes.controller.ts**
  The API controller for recipes will need new or modified endpoints to accept search parameters, filter criteria, and requests to update the `isPinned` and `isFavorite` status of recipes.

- **apps/api/src/modules/recipe/recipes.service.ts**
  This service layer will implement the business logic for retrieving recipes based on search terms and multiple filter criteria, as well as updating the persistence layer with pin and favorite status changes.

- **packages/api-types/src/recipes.ts**
  The TypeScript interfaces and types defined here for recipes will need to be updated to include new properties such as `isPinned`, `isFavorite`, `tags`, `categories`, `dietaryRestrictions`, and `cuisineType`.

- **apps/api/apps/api/src/schema.gql**
  Assuming a GraphQL API, this schema definition will require updates to the `Recipe` type to expose the new `isPinned`, `isFavorite`, `tags`, and other filtering-related fields, along with corresponding query arguments for search and filter operations.

- **apps/web/e2e/recipe.spec.ts**
  New end-to-end tests should be added to this file to cover the functionality of the new tutorial/empty state, pinning, favoriting, recipe search, and various filtering options to ensure a robust user experience.
  \--
  author: conarwelsh
  association: owner
  edited: false
  status: none
  \--
  requires #44

--

---

author: sous-tools
association: contributor
edited: false
status: none
--

The KDS is experiencing significant functional issues related to live order management and display. Key problems include a broken link to live order data, the inability to show completed orders from real-time sources, and non-functional "all day counts." Furthermore, the critical functionality for completing individual items or entire tickets is not working as intended. These items indicate a need for immediate bug fixes in core KDS operations, alongside an important enhancement for displaying completed order history.
--

author: sous-tools
association: contributor
edited: false
status: none
--

### Diagnosis Report: KDS Functionality

The KDS is experiencing significant issues across its core functionalities, indicating problems in both frontend data display and backend order management logic. The issues stem from a lack of proper data fetching, real-time updates, and state management for orders and their completion status.

Here are the files identified for modification:

- **`apps/web/src/app/(fullscreen)/kds/page.tsx`**
  This file, as the KDS frontend, requires updates to correctly fetch and display live and completed orders, implement the UI for marking individual items or entire tickets as complete, and calculate/render "all day counts." It needs to ensure a robust connection to the backend for real-time data.

- **`apps/api/src/modules/pos/pos-transactions.service.ts`**
  This backend service is crucial for handling KDS data. It needs logic implemented or corrected to retrieve live orders, query completed orders, calculate "all day counts," and perform mutations to update the completion status of individual items or whole tickets in the database.

- **`apps/api/apps/api/src/schema.gql`**
  The GraphQL schema needs to be updated to define the necessary queries for fetching live orders, completed orders, and "all day counts," as well as mutations for marking items or tickets as complete. Without these definitions, the frontend cannot interact correctly with the backend.

- **`apps/api/src/modules/pos/pos.module.ts`**
  To ensure "live order management" is functional, this module should be enhanced to include a WebSocket Gateway (e.g., `PosGateway`) to provide real-time updates to connected KDS clients. The associated `pos-transactions.service.ts` would then emit events through this gateway upon order creation or status changes.

- **`apps/api/src/modules/integrations/webhooks.controller.ts`**
  If the "link to live orders" is broken at the source, this controller, responsible for ingesting data from external POS systems (like Square), may have issues in receiving or correctly processing incoming order webhooks. It needs to ensure new and updated orders are reliably captured and stored.

- **`packages/supabase/schema.sql`**
  The underlying database schema must be verified to ensure that order and order item tables accurately support status tracking (e.g., `live`, `completed`), completion timestamps, and other fields necessary for "all day counts" and historical data retrieval. Missing or incorrect schema definitions can lead to data integrity issues.
  \--
  author: conarwelsh
  association: owner
  edited: false
  status: none
  \--

* need to be wired up to real orders
  \--

---

author: sous-tools
association: contributor
edited: false
status: none
--

This issue outlines a critical enhancement for the POS system, focusing on deep integration with live data sources to ensure accuracy and real-time updates for categories and menu items. It requires developing a fully active and dynamic shopping cart experience for users. A significant design effort is needed to create visually appealing and user-friendly menus, including a beautiful display for all items and intuitive modifier options. This will greatly improve the user experience and data integrity of the POS functionality.
--

author: sous-tools
association: contributor
edited: false
status: none
--

### Diagnosis Report

This issue requires significant work across both the backend API and the frontend web application to transition the POS functionality from simulated data to live, interactive operations.

**Files Requiring Modification:**

- **`apps/api/src/modules/integrations/integrations.service.ts`**
  This service needs to be enhanced to manage the full lifecycle of POS data integration, including fetching, storing, and synchronizing live categories, items, and modifiers from external POS systems.
- **`apps/api/src/modules/integrations/square.driver.ts`**
  Assuming Square is the primary live POS, this driver must be extended to fetch comprehensive data, including item categories, detailed menu items with all attributes, and associated modifier lists directly from the Square API.
- **`apps/api/src/modules/integrations/square-mapper.helper.ts`**
  This helper will be critical for accurately transforming raw data received from the Square API into the application's standardized internal data models for menu categories, items, and modifiers.
- **`apps/api/src/modules/integrations/square-sync.helper.ts`**
  This helper will require updates to efficiently synchronize the newly fetched live categories, items, and modifiers into the application's database, ensuring data consistency and real-time availability.
- **`apps/api/src/modules/items/items.service.ts`**
  This service needs to provide methods to access and query the live POS data (categories, items, modifiers) from the integrated source, ensuring it is prepared for consumption by the frontend.
- **`apps/api/src/modules/items/items.controller.ts`**
  New or updated API endpoints must be implemented here to expose the live categories, menu items, and modifier options, allowing the frontend POS application to retrieve this data dynamically.
- **`apps/api/src/modules/pos/pos-transactions.service.ts`**
  This service will be central to managing the active cart state, including operations for adding items, applying modifiers, calculating real-time totals, and processing actual POS orders and transactions.
- **`apps/api/src/schema.gql`**
  If the API uses GraphQL, the schema will need to be updated to define the new types and operations (queries, mutations) necessary for managing live POS items, categories, modifiers, and cart functionality.
- **`apps/web/src/app/(fullscreen)/pos/page.tsx`**
  This is the primary page for the POS interface and requires significant development to implement the active cart functionality, display the live categories and menu items, and render interactive modifier menus.
- **`apps/pos-simulator/src/components/PosSimulator.tsx`**
  This file and related components like `PosItemCard.tsx` from the simulator application should be reviewed for existing UI patterns and logic that can be adapted, extracted, and migrated to the live `apps/web` POS implementation to ensure consistency and accelerate development.
- **`packages/design-system/src/index.ts` (and related components within `packages/design-system/src/components/`)**
  The design system will likely require new or updated UI components (e.g., for menu item cards, category navigation, modifier selection) to support the "beautiful menu" and "simple modifier menus" design requirements.
  \--
  author: conarwelsh
  association: owner
  edited: false
  status: none
  \--

* doesnt consume full height of the screen
* need to show real data
  \--

---
