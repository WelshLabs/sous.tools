# CTO Daily Summary - 2026-07-23

## Key Findings:

**End-to-End Tests:**

- Critical builds for `web`, `pos-simulator`, `@soustools/setup-portal`, `api`, and `cli` are failing due to missing Infisical credentials or other build issues. Many packages are missing build cache.
- Tests in `@soustools/domain-pos`, `@soustools/domain-inventory`, and `@soustools/domain-signage` are failing due to a missing `@vitest/coverage-v8` dependency.

**Linting:**

- Three files in `@soustools/design-system` exceed the 200-line limit. Multiple packages show `MODULE_TYPELESS_PACKAGE_JSON` warnings.

**Type Checking:**

- A type error exists in `@soustools/design-system/use-omni-actions.hook.ts` regarding an unknown property `itemId`.
- Several packages failed type-checking steps.

**Unit Tests & Coverage:**

- Tests are failing in `@soustools/domain-pos`, `@soustools/domain-recipes`, `@soustools/domain-signage`, `@soustools/domain-inventory`, `@soustools/design-system`, and `@soustools/domain-settings` due to missing `@vitest/coverage-v8` and Vite warnings.
- `@soustools/logger:build` failed with `[ELIFECYCLE] Command failed.`

**Open Issues & Tech Debt:**

- **Authentication & Credentials:** Missing Infisical credentials block critical builds.
- **Testing Infrastructure:** Issues with Vite deprecation, missing dependencies (`@vitest/coverage-v8`), and failing Jest/NestJS configurations hinder testing.
- **Code Quality:** `eslint-disable` comments are prevalent, especially in `packages/domain-pos` and `apps/api`, indicating significant tech debt. Long file violations in `@soustools/design-system` also noted.
- **Component Structure:** Components like `InsightsSidebar`, `quick add bar`, and `TopProgress` are misplaced and need relocation.
- **UI/UX Debt:** Several UI issues require attention: Waffle Menu overlay, KDS display, POS menu/cart improvements.
- **Feature Development:** Tenant onboarding, feature gating, and tutorials are pending implementation.
- **Live Data Integration:** Significant work is needed for POS and KDS systems to use live data, including cart functionality and order management.

## Prioritized Action Plan:

1.  **Blocker: Resolve Infisical Credentials:** Immediately fix missing Infisical credentials to unblock builds for `web`, `pos-simulator`, `@soustools/setup-portal`, `api`, and `cli`.
2.  **Blocker: Fix Testing Dependencies:** Resolve the missing `@vitest/coverage-v8` and Vite warnings to enable unit testing and coverage for domain packages. Fix `@soustools/logger:build`.
3.  **Address Code Quality & Configuration:** Fix Jest/NestJS test configurations. Remove `eslint-disable` comments by fixing underlying code. Address long file violations and type errors in `@soustools/design-system`.
4.  **Investigate Build Failures:** Debug remaining build failures in packages not covered by Infisical credential fixes.
5.  **Core Feature Development:** Start backend work for tenant onboarding and POS live data integration. Address critical KDS bugs.
6.  **Enhancements:** Implement UI/UX improvements (Waffle Menu, KDS, POS) and move misplaced components.
7.  **Cleanup:** Address unused code and dependencies from Knip report. Investigate build cache issues.

**Next Steps:**

- Assign owners and timelines for high-priority fixes.
- Review KDS/POS bug details and backend integration requirements.
