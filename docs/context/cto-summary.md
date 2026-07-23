# CTO Daily Summary

**Date:** 2026-07-23

**Key Findings & Tech Debt:

- **End-to-End Tests:** Currently running in 20 packages with remote caching disabled. Builds for several packages (`@soustools/api-types`, `@soustools/config`, `@soustools/logger`, `@soustools/supabase`) are cached, but others (`cli`, `api`, `pos-simulator`, `web`, `@soustools/setup-portal`) are missing build cache, leading to slower rebuilds. The `pos-simulator` and `web` builds encountered Next.js warnings regarding `MODULE_TYPELESS_PACKAGE_JSON` and ESLint configuration. The `web` build also shows significant first load JS sizes for many routes.
- **Knip Report:** Identifies 104 unused files, with a preview showing many in `apps/setup-portal`, `apps/storybook`, `apps/web/public`, and various `apps/web/src` locations. This indicates potential for cleanup and reduced build times.
- **Lighthouse Report:** Passed health checks, indicating no major immediate issues with Chrome installation or configuration.
- **Linting:** All packages were linted successfully, with no reported errors or warnings being enforced (`--max-warnings 0`). However, several packages (`pos-simulator`, `cli`, `api`, `web`) show `MODULE_TYPELESS_PACKAGE_JSON` warnings, suggesting potential issues with their `package.json` configuration.
- **Type Checking:** All packages passed type checking. Some builds (`@soustools/api-types`, `@soustools/config`, `@soustools/logger`) are utilizing cache, while others are performing fresh checks.
- **Unit Test Coverage:** Significant issues were reported:
  - **@soustools/domain-pos, @soustools/domain-recipes, @soustools/domain-signage, @soustools/domain-inventory, @soustools/design-system, @soustools/domain-settings:** Failed tests due to missing `@vitest/coverage-v8` dependency and Vite-related warnings. Coverage reports are not generated.
  - **@soustools/logger:build:** Failed with "[ELIFECYCLE] Command failed."
- **Issues & Tech Debt:**
  - **CLI/API Tests:** Need configuration fixes for Jest (CLI) and NestJS (API) tests to run successfully.
  - **Domain Package Coverage:** Unit test coverage needs to be significantly expanded for `@soustools/domain-*` packages, following the Container/View testing philosophy.
  - **`eslint-disable` Violations:** Numerous `eslint-disable` comments exist, particularly in `packages/domain-pos` and `apps/api`, indicating underlying code quality or architectural issues that need to be addressed by fixing the code and removing the comments.
  - **Component Relocation:** `packages/design-system/src/components/InsightsSidebar` and `quick add bar` should move to `packages/domain-inventory`. `TopProgress` should move to `Loader`.
  - **Waffle Menu:** Needs a click-out listener that spans the full viewport to close the menu correctly.
  - **Tenant Onboarding:** Requires implementation of a new registration page, tutorial, Stripe integration for billing, feature gating using Next.js unauthorized pages. This involves frontend, backend, API types, Supabase schema, and new guard implementations.
  - **Recipes Page Enhancements:** Adding tutorial, empty state message, pinning, favorites, robust search, and filtering (tags, categories, dietary, cuisine). Affects frontend, API controllers/services, API types, GraphQL schema, and E2E tests.
  - **KDS Functionality:** Broken live order management, inability to display completed orders, non-functional "all day counts," and failure to complete items/tickets. Requires fixes in frontend KDS page, API POS service, GraphQL schema, WebSocket integration, and potentially webhook handling and Supabase schema.
  - **POS System Live Integration:** Transitioning the POS from simulated to live data, including cart functionality and UI enhancements. Involves extensive backend integration with live POS systems, updating item services, POS transaction logic, and potentially GraphQL schema updates. Frontend POS and design system components may also need updates.

**Prioritized Action Plan:**

1.  **Immediate Fixes (Blockers):
    - **Unit Test Dependencies:** Resolve the missing `@vitest/coverage-v8` dependency and related Vite warnings for `@soustools/domain-*` packages to enable unit testing and coverage generation. Fix the failing build for `@soustools/logger:build`.
    - **CLI/API Test Configuration:** Fix Jest and NestJS test configurations to ensure tests pass for CLI and API.
    - **`eslint-disable` Violations:** Prioritize fixing the underlying code issues and removing `eslint-disable` comments, especially in `packages/domain-pos` and `apps/api`, as these indicate significant tech debt.

2.  **Core Feature Development & Bug Fixes:
    - **KDS Functionality:** Address the critical bugs in live order management, completed orders, and item/ticket completion.
    - **POS Live Data Integration:** Begin the transition to live POS data integration, starting with API-level changes for fetching and mapping data from Square.
    - **Tenant Onboarding:** Implement the core registration flow and basic tenant creation backend logic.

3.  **Enhancements & Refinements:
    - **Recipes Page Enhancements:** Implement search, filtering, and pinning/favoriting functionality.
    - **Component Relocation:** Migrate `InsightsSidebar`, `quick add bar`, and `TopProgress` to their correct locations.
    - **Waffle Menu Fix:** Implement the full-viewport click-out functionality.
    - **Tenant Onboarding (Billing/Features):** Continue development on Stripe integration and feature gating.

4.  **Cleanup & Optimization:
    - **Unused Code & Dependencies:** Address the identified unused files, dependencies, exports, and duplicate exports from the Knip report.
    - **Build Cache:** Investigate and implement build caching for packages that are currently missing it.
    - **Linting Warnings:** Resolve Next.js ESLint plugin detection warnings and add `"type": "module"` to affected `package.json` files.

**Next Steps:**

- Focus on resolving the unit test dependency issues and test configuration problems.
- Begin addressing the high-priority `eslint-disable` violations and KDS bugs.
- Initiate backend development for the tenant onboarding and POS live data integration.
