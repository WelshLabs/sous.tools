### #77: Task: eslint and typecheck

**Labels:** approval:go

**Description:**

### Objective

we need to get the lint and typecheck fully passing so that we can move on to other issues. this may be an involved task since we added a lot of new rules that were designed to reduce our tech debt. we should not be taking shortcuts and disabling the files, we should be fixing it the correct way.

### Agent Definition of Done (DoD)

- [x] Create a new feature branch (`feature/issue-[id]`).
- [x] Write the code strictly conforming to `.cursorrules` and `docs/ARCHITECTURAL_PROTOCOL.md`.
- [x] Run `pnpm turbo lint` and ensure 0 errors.
- [x] Run `pnpm turbo typecheck` and ensure perfect compilation.
- [x] Push the branch and open a PR.
- [x] The PR body MUST include the raw output of the lint and typecheck commands to prove verification.
- [x] Post a comment on this issue linking to the PR.

**Comments:**

> **conarwelsh**: I have reviewed the project documentation and the issue details. Here is my implementation plan:
>
> ### Implementation Plan
>
> 1.  **Establish a Baseline:** I'll start by running `pnpm turbo lint` and `pnpm turbo typecheck` to get a complete picture of all the current errors. This will help me to understand the scope of the task and to formulate a strategy for tackling the errors. I'll save the output of these commands to a file for later reference.
>
> 2.  **Analyze and Prioritize:** I'll analyze the error logs to identify any recurring patterns or common issues. This will allow me to address the errors more efficiently. I'll prioritize fixing errors that are present in multiple packages, as this will have the most significant impact on the overall health of the codebase.
>
> 3.  **Systematic Correction:** I'll work through the errors package by package, starting with the foundational `packages` and then moving on to the `apps`. For each error, I will carefully consider the best approach to fix it, adhering to the project's coding standards and architectural guidelines. I will avoid using quick fixes or disabling rules, as this would defeat the purpose of the task.
>
> 4.  **Continuous Verification:** As I fix the errors, I will continuously re-run the `lint` and `typecheck` commands to ensure that my changes are having the desired effect and not introducing any new issues. This will help me to maintain a high level of quality throughout the process.
>
> 5.  **Pull Request and Documentation:** Once all the errors have been resolved, I will create a pull request with my changes. The pull request will include a detailed summary of the work I have done, as well as the raw output of the final `lint` and `typecheck` commands to demonstrate that the task has been completed successfully.

---

### #76: Tech Debt: Fix Failing Test Suites & Achieve Coverage

**Labels:** tech debt

**Description:**
Our unit test suites for api and cli are currently crashing or reporting "No tests found", and our domain packages lack coverage. Objective: Fix the test runners and expand coverage.

Agent Instructions:

- Fix the Jest configuration in apps/cli so it actually detects and runs its tests
- Fix the NestJS tests in apps/api.
- Once the runners are green, begin generating unit tests for all components in @soustools/domain-* ensuring we adhere to the Container/View testing philosophy.

**Comments:**

---

### #75: Tech Debt: Audit and Purge Unused Code (Knip)

**Labels:** tech debt

**Description:**
According to our knip-report.txt, we have dozens of unused files, exports, and dependencies. Objective: Safely audit the dead code.

Agent Instructions: DO NOT ARBITRARILY DELETE FILES.

- Read docs/audits/knip-report.txt
- Audit the listed "unused files" (like the display blocks and home dashboard components).
- Post a comment on this issue categorizing what is genuinely dead legacy code vs. what is newly written code that just hasn't been wired into a Next.js route yet. Stop and wait for my human approval before deleting anything.

**Comments:**

---

### #74: Tech Debt: Eradicate eslint-disable Bypasses

**Labels:** bug, enhancement, agent:plan

**Description:**
We have a strict "Zero Tech Debt" policy. Bypassing linting or type rules is forbidden. Objective: Hunt down and remove all eslint-disable comments.

Agent Instructions:

- Scan the entire Turborepo (especially packages/domain-pos and apps/api) for // eslint-disable-next-line or /* eslint-disable */
- Remove the comments.
- Properly fix the underlying TypeScript any types, missing dependencies, or architectural violations that the comment was hiding. Do not use shortcuts.

**Comments:**

> **conarwelsh**: Here is my plan to address the issue:
>
> **Step 1: Locate all `eslint-disable` comments**
>
> I will perform a global search across the entire monorepo to find every instance of `// eslint-disable-next-line` and `/* eslint-disable */`. I will pay special attention to `packages/domain-pos` and `apps/api` as instructed.
>
> **Step 2: Analyze and categorize each violation**
>
> For each located comment, I will:
>
> 1.  Temporarily remove the `eslint-disable` comment.
> 2.  Run the linter to understand the specific rule being violated.
> 3.  Categorize the violation (e.g., `any` type usage, missing dependency, incorrect import path, architectural rule break).
>
> **Step 3: Fix the underlying code issue**
>
> Based on the violation category, I will implement the correct fix in accordance with the project's `.cursorrules`. This may involve:
>
> - Adding proper TypeScript types to replace `any`.
> - Installing missing dependencies in the correct `package.json`.
> - Refactoring code to comply with the established container/view pattern.
> - Ensuring all database access is properly isolated within `apps/api`.
> - Moving domain-specific components out of the generic design system.
>
> **Step 4: Verify the fix**
>
> After applying the fix, I will run the linter and type-checker again to confirm that the original error is resolved and no new errors have been introduced.
>
> **Step 5: Commit and document**
>
> I will commit each fix individually with a clear message explaining the violation and the solution.
>
> **Step 6: Update GitHub Issue**
>
> Once all `eslint-disable` comments have been removed and the underlying issues fixed, I will post my final comment on the issue.

---

### #73: Environment-Aware Transparent Favicons

**Labels:** bug, enhancement, devops, design-system

**Description:**
Our current favicons render with a black background instead of transparency, and we cannot easily differentiate between our environments. Objective: Fix the background transparency and wire up environment colors.

Agent Instructions:

- Refactor scripts/generate-icons.mjs to ensure the generated PNG/ICO/SVG files have strict transparent backgrounds
- Add logic to the script (or packages/design-system/src/utils/favicon-canvas.ts) to apply environment colors: Green for Dev, Orange for Staging, standard gradient for Prod
- Ensure apps/web/src/app/layout.tsx dynamically loads the correct generated icon based on process.env.NODE_ENV

**Comments:**

---

### #72: rpi os image

**Labels:** devops

**Description:**
need to get a properly working rpi os image built and deployed so it can be used at the cafe in production mode

**Comments:**

> **sous-tools**: The primary objective is to build and deploy a robust and fully functional Raspberry Pi OS image. This image must be specifically configured and optimized for reliable operation within a cafe's production environment. The task involves ensuring the OS is stable, secure, and correctly set up to support all necessary applications and services without interruption. Achieving this is critical for maintaining smooth and efficient cafe operations.

> **sous-tools**: ### Diagnosis Report
>
> The issue "need to get a properly working rpi os image built and deployed so it can be used at the cafe in production mode" points to potential misconfigurations or incomplete steps within the Raspberry Pi OS image generation and deployment pipeline. To achieve a robust, functional, and production-ready image, the following files require architectural or logic changes:
>
> - **`deploy/pi/pi-gen/stage4/00-soustools/00-run.sh`**
>   This script needs to be thoroughly reviewed to ensure all Sous Tools dependencies and application binaries are correctly installed and configured during the image build, specifically optimizing for a production cafe environment. Verify that all required system modifications and file placements are handled robustly.
>
> - **`deploy/pi/pi-gen/stage4/00-soustools/files/signage-kiosk.service`**
>   The systemd service definition for the signage kiosk must be hardened with appropriate restart policies (e.g., `Restart=always, RestartSec=5s`) and user permissions to guarantee continuous, unsupervised operation in a production setting. Ensure it correctly launches the intended kiosk script with all necessary environment variables.
>
> - **`deploy/pi/pi-gen/stage4/00-soustools/files/kiosk.sh`**
>   This shell script, which likely launches the web browser in kiosk mode, requires verification to ensure it reliably points to the correct production web application URL and handles diverse display configurations and potential network outages gracefully. Optimizations for browser performance and resource usage should also be considered.
>
> - **`deploy/pi/stage-sous/01-run.sh`**
>   This critical stage script should be examined for any missing fundamental system configurations, essential package installations, or security hardening steps necessary for the base OS to be stable and secure in a production environment. Ensure it properly sets up user accounts, permissions, and other system-wide defaults.
>
> - **`deploy/pi/stage-sous/files/chromium-kiosk@.service`**
>   The templated systemd service for launching Chromium in kiosk mode must be configured to correctly pass the production application URL, utilize appropriate browser flags for stability and security, and run as an unprivileged user. It should also include robust error handling and logging for debugging.
>
> - **`deploy/pi/stage-sous/files/sous-setup-portal.service`**
>   This service responsible for launching the setup portal needs to ensure the portal starts reliably, ideally after network interfaces are active, to facilitate initial device pairing and configuration (like Wi-Fi) without manual intervention. It should gracefully handle network state changes and provide clear status.
>
> - **`deploy/pi/stage-sous/files/sous-ota.service`**
>   The Over-The-Air (OTA) update service is crucial for production maintenance; its logic must be verified to ensure secure, reliable, and non-disruptive application of updates. This includes proper authentication, download, and installation procedures, with fallback mechanisms in case of failure.
>
> - **`deploy/pi/stage-sous/files/sous-ota.timer`**
>   This timer unit, which schedules the OTA update service, needs to be configured with an appropriate interval for production environments, balancing update frequency with operational stability. Ensure the timer is robust and does not interfere with critical cafe operations.
>
> - **`apps/setup-portal/src/app/api/wifi/route.ts`**
>   The API logic within this file, which manages Wi-Fi configuration during initial device setup, needs comprehensive testing to ensure it can securely connect to various types of cafe networks (e.g., WPA2-PSK, WPA3) and handles invalid credentials or network unavailability gracefully. It is vital for seamless device onboarding.
>
> - **`deploy/ansible/playbook.yml`**
>   The main Ansible playbook needs to be audited to ensure it covers all post-image deployment configurations, including setting up specific cafe-level variables, API keys, and verifying the operational status of all critical services on the newly deployed Raspberry Pi. It should be idempotent and robust against network fluctuations.
>
> - **`deploy/ansible/group_vars/all/vars.yml`**
>   This file needs to accurately define all non-sensitive, production-specific configuration variables required by the Raspberry Pi devices in a cafe environment, ensuring consistency and ease of management across multiple deployments. Verify that all required variables for the RPi applications are present and correctly formatted.

---

### #71: Feature: WearOS App Functionality & Sideload Deployment

**Labels:** bug, enhancement, devops, frontend

**Description:**
The WearOS application needs its final polish so we can sideload it to the physical watches in dev and prod.

Objective: Ensure core watch functionalities are wired to the backend API and build variants are configured.

Agent Instructions:

- Verify ApiClient.kt correctly pulls environment-specific endpoints via Infisical secrets for dev/prod
- Ensure VoiceCommandComplicationService.kt and MainTileService.kt are correctly routing their payloads to the NestJS backend
- Verify the build.gradle.kts is properly configured to output signed APKs for both environments

**Comments:**

---

### #70: tech debt

**Labels:** enhancement, devops, agent:plan

**Description:**
get all our tech debt monitoring tools to be green lit across the entire repo

**Comments:**

> **sous-tools**: This issue focuses on fully activating and integrating our tech debt monitoring tools across the entire codebase. The objective is to ensure these tools are 'green lit,' meaning they are operational, correctly configured, and providing comprehensive coverage for identifying and tracking technical debt. Achieving this will significantly enhance our ability to proactively manage code health and improve long-term maintainability. This initiative will provide crucial insights for reducing future development friction.

> **sous-tools**: ### Diagnosis Report
>
> The objective is to fully activate and integrate tech debt monitoring tools across the entire repository to achieve a 'green lit' status. This requires a comprehensive review and configuration of existing code quality tools, ensuring consistent application, comprehensive coverage, and integration into development workflows.
>
> Here are the key files that require modification and the necessary changes:
>
> - **`eslint.config.mjs`**
>   - This global ESLint configuration needs to be updated to define or extend a consistent and robust set of code quality and style rules that apply across the entire monorepo, integrating shared configurations from `packages/eslint-config`. It should ensure comprehensive linting coverage for all relevant codebases.
> - **`knip.jsonc`**
>   - The Knip configuration must be updated to scan all applications and packages within the monorepo effectively. This will enable comprehensive detection of unused files, exports, and dependencies, directly addressing dead code as a form of technical debt.
> - **`sonar-project.properties`**
>   - This file needs to be configured to accurately define the scope of code to be analyzed by SonarQube/SonarCloud, ensuring it covers all relevant source directories across `apps/` and `packages/`. This will enable comprehensive static analysis for identifying bugs, vulnerabilities, and technical debt metrics.
> - **`.husky/pre-commit`**
>   - The pre-commit hook should be enhanced to execute relevant tech debt monitoring checks (e.g., linting, formatting, type-checking) on staged files before commits are allowed. This ensures that new technical debt is caught and addressed early in the development cycle.
> - **`turbo.json`**
>   - As the monorepo coordinator, `turbo.json` should be configured to define and orchestrate consistent `lint` and `typecheck` tasks across all workspaces. This will ensure that tech debt monitoring tools run efficiently and uniformly during development and CI/CD pipelines.
> - **`package.json`** (root)
>   - The `scripts` section in the root `package.json` (and similar files in `apps/` and `packages/`) needs to be updated to include commands that execute all configured tech debt monitoring tools consistently. This ensures that these tools are integrated into standard build and verification processes.
> - **`packages/tsconfig/base.json`** (and other `packages/tsconfig/*.json` files)
>   - These base TypeScript configurations should be reviewed and updated to enforce stricter type-checking rules. This will proactively prevent type-related technical debt and ensure consistent type safety across all TypeScript projects in the monorepo.
> - **`apps/wearos/app/lint.xml`**
>   - For the Wear OS application, this Android Lint configuration needs to be verified and potentially expanded to enforce Android-specific best practices and detect common mobile development technical debt. This ensures platform-specific code quality is monitored.
> - **`.agents/skills/quality-enforcement/SKILL.md`**
>   - The definition of the `quality-enforcement` agent skill should be reviewed to align its capabilities with the goal of "green lighting" tech debt tools. This involves integrating the agent's logic to leverage the configured monitoring tools and report on their status and findings.

> **conarwelsh**: I have mistakenly tried to read the comments for a pull request instead of the issue. I will now read the comments for issue #70.

> **conarwelsh**: alright, I will read the comments on the issue now and then create a plan to post on the issue.

> **conarwelsh**: Here is a step-by-step implementation plan to systematically address the tech debt within the `sous.tools` repository and achieve a "green" status across all our monitoring tools, in compliance with our established architecture.
>
> ### **Phase 1: Comprehensive Diagnostics & Baseline**
>
> First, we need to fully understand the scope of the problem.
>
> 1.  **Linting Audit:** Run a global `eslint` check across the entire monorepo to capture all current violations.
> 2.  **Dead Code Analysis:** Execute `knip` to generate a complete report of all unused files, exports, and dependencies.
> 3.  **Type-Safety Check:** Run `tsc --noEmit` within each workspace to identify all TypeScript errors.
> 4.  **Consolidated Report:** Collate all findings into a single report. This document will be our baseline and guide for the next phases.
>
> ### **Phase 2: Code Style & Linting Compliance**
>
> Next, we'll bring the codebase into alignment with our style guide.
>
> 1.  **Eliminate `eslint-disable`:** Search and destroy all instances of `eslint-disable`. Each instance must be replaced with a proper code fix.
> 2.  **Automated Fixes:** Run `eslint --fix` to resolve all auto-fixable issues.
> 3.  **Manual Correction:** Manually address the remaining, more complex linting violations.
>
> ### **Phase 3: Dead Code Removal**
>
> With a clean slate from linting, we can now safely remove unused code.
>
> 1.  **File Deletion:** Based on the `knip` report, delete all identified unused files.
> 2.  **Dependency Pruning:** Remove all unused dependencies from the root and workspace `package.json` files.
> 3.  **Export Removal:** Eliminate all unused exports to tighten our module APIs.
>
> ### **Phase 4: Enhancing Type Safety**
>
> Now, we will focus on strengthening our TypeScript implementation.
>
> 1.  **Error Resolution:** Go through each workspace and fix all TypeScript errors reported by `tsc`.
> 2.  **Stricter Typing:** Identify and refactor any usage of `any` or areas with weak type definitions to improve overall type safety.
>
> ### **Phase 5: Architectural Integrity Refactoring**
>
> This is the most critical phase, where we enforce our core architectural principles.
>
> 1.  **Enforce DDD Boundaries:**
>     - Audit `apps/*` and `packages/domain-*` to ensure no direct database client imports.
>     - Verify all network requests are exclusively handled by `packages/api-client`.
> 2.  **Thin Server Components:**
>     - Refactor Next.js pages to be minimal entry points, moving all significant logic and UI to the appropriate `packages/domain-*` packages.
> 3.  **Centralized Configuration:**
>     - Scan for any usage of `process.env` outside of `@soustools/config` and refactor to import the typed `config` object.
> 4.  **Unified `tsconfig.json`:**
>     - Ensure every `tsconfig.json` correctly extends our base configuration from `packages/tsconfig`.
> 5.  **Container/View Pattern Adherence:**
>     - Review and refactor components to strictly enforce the separation of concerns between presentation (`*.tsx`) and logic (`*.container.tsx`).
> 6.  **Design System Compliance:**
>     - Audit our styling to eliminate hardcoded colors and values, enforcing the use of semantic CSS variables and our "Midnight Slate" palette.
>
> ### **Final Verification**
>
> Upon completion of all phases, we will re-run all our tech debt monitoring tools (`eslint`, `knip`, `tsc`) to confirm that the entire repository is "green".
>
> This plan will guide our efforts to systematically eliminate tech debt and improve the overall quality and maintainability of our codebase. Let's begin with Phase 1.

---

### #68: Refactor: Thin Next.js Routing Shells & Domain Extraction

**Labels:** enhancement, refactor

**Description:**
Next.js apps (apps/web, apps/pos-simulator) must act purely as routing and orchestration shells. Objective: Strip domain-specific business logic out of the router. Agent Instructions: Data fetching inside Next.js Server Components is allowed and encouraged. However, domain-specific knowledge, heavy data transformations, and complex UI state must be extracted.

- Audit files like apps/pos-simulator/src/app/page.tsx and apps/web/src/app/(workspace)/recipes/[id]/kitchen/page.tsx
- Move core business logic and heavy container setups into their respective packages/domain-* packages.
- Ensure Next.js pages only contain minimal instructions specific to routing and invoking those domain packages.

**Comments:**

---

### #67: convert to drizzle??

**Labels:** enhancement, question, backend, database

**Description:**
should we convert the sql to use drizzle or is that too much at this point?

**Comments:**

> **sous-tools**: This issue proposes evaluating a strategic migration to Drizzle ORM for database interactions. While Drizzle offers significant benefits like improved type safety, better developer experience with TypeScript, and potentially enhanced maintainability for SQL queries, it entails a substantial refactoring effort. The core question is whether the current project phase and resource availability make this a feasible and opportune time for such an architectural change. A thorough cost-benefit analysis considering the immediate impact versus long-term advantages is essential before proceeding.

> **sous-tools**: ### Diagnosis Report
>
> The issue "convert to drizzle??" proposes a strategic migration to Drizzle ORM. This is a significant architectural change that would impact how the application interacts with its database, primarily affecting schema definition, database client instantiation, and all database query logic. The current setup appears to use Supabase, which typically involves direct SQL or a lightweight client. Drizzle would introduce a type-safe ORM layer.
>
> Here are the files that would require modification for this conversion:
>
> - **`packages/supabase/schema.sql`**: This file currently defines the database schema using raw SQL. With Drizzle, the canonical schema definition would shift to TypeScript files, meaning this SQL schema would primarily serve as a reference for initial Drizzle schema generation or be fully replaced by Drizzle's TypeScript definitions.
> - **`packages/supabase/src/index.ts`**: This file likely contains the primary logic for initializing and exporting the Supabase client for database interactions. It would need to be refactored to initialize and export the Drizzle ORM client, configured to connect to the Supabase PostgreSQL database.
> - **`apps/api/src/lib/supabase.ts`**: As a utility file related to Supabase, this file likely consumes the database client provided by `packages/supabase/src/index.ts`. It will need to be updated to integrate with and utilize the new Drizzle ORM client for its database operations.
> - **`apps/api/src/modules/items/items.service.ts`**: This service file (and many others across `apps/api/src/modules/`) is a prime candidate for containing database interaction logic. All existing SQL queries or client calls within this file would need to be rewritten using Drizzle's type-safe query builder API.
> - **`apps/api/src/modules/recipe/recipes.service.ts`**: Similar to `items.service.ts`, this service likely performs extensive database operations for managing recipes. It would require substantial refactoring to replace direct SQL or Supabase client calls with Drizzle ORM's methods, leveraging the newly defined Drizzle schema.
> - **`apps/api/package.json`**: This file will require the addition of Drizzle ORM-related dependencies, such as `drizzle-orm` and potentially `drizzle-kit` for migration management, along with the appropriate database driver (e.g., `pg`).
> - **`packages/supabase/package.json`**: Similar to the API package, this package's `package.json` will need to include Drizzle ORM and its associated client dependencies, especially if it becomes the central point for Drizzle client instantiation.
> - **`apps/api/tsconfig.json`**: This TypeScript configuration file might need adjustments to accommodate Drizzle's type generation capabilities and ensure proper type inference across the codebase after the ORM integration.
> - **`supabase/migrations/`**: The existing SQL migration files within this directory represent the current database evolution strategy. Adopting Drizzle would typically involve transitioning to `drizzle-kit` for schema migrations, changing how new migrations are generated and applied.

---

### #65: Staging Environment Infinite Redirect Loop

**Labels:** bug, backend, devops

**Description:**
ur staging environment is currently inaccessible due to an infinite redirect loop. Objective: Diagnose and fix the loop. Agent Instructions:
Check deploy/ansible/group_vars/all/vars.yml for malformed APP_URL, API_URL, or HTTPS enforcement variables
.
Audit apps/web/next.config.mjs for rogue redirects arrays that mishandle protocol or staging subdomains
.
Audit apps/api/src/main.ts for any global middleware or Traefik trust-proxy mismatches causing HTTP/HTTPS ping-ponging
. Fix the configuration so the staging site loads without looping.

**Comments:**

---

### #64: Tooling: Scaffold Storybook for Design System

**Labels:** enhancement, design-system, tooling

**Description:**
We need to view and interact with our UI components in strict isolation. Objective: Integrate Storybook exclusively into the design-system package.

Agent Instructions:

- Install and configure Storybook strictly inside packages/design-system
- Update packages/design-system/package.json with the required build/start scripts
- Update turbo.json at the root to recognize and cache the new Storybook tasks

**Comments:**

---

### #63: design-system cleanup

**Labels:** documentation, enhancement, design-system

**Description:**
we need to ensure that our packages/design-system is cleaned up, and properly following the atom/molecule/organism/container design philosophy. Currently almost all components are just single files instead of folders, and none of them have tests written for them.

One for instance is what should be a folder called Supplier, but instead it is 4 files:

- SupplierHeader.tsx
- SupplierLineItem.tsx
- SupplierOrderGroup.tsx
- SupplierOrderGroup.types.ts

but most all of the components need to be refactored to follow the correct structures and must also have tests and documentation written.

**Comments:**

> **sous-tools**: This issue addresses the critical need to refactor and organize the `packages/design-system` to align with the Atom/Molecule/Organism/Container design philosophy. Currently, components are primarily single files, lack proper folder structures for complex entities like 'Supplier', and entirely miss unit tests and comprehensive documentation. The objective is to restructure components into logical folders, implement robust testing, and document their usage and props, ensuring a maintainable and scalable design system.

> **sous-tools**: ### Diagnosis Report
>
> This issue outlines a critical need to refactor the `packages/design-system` to enforce a component folder structure aligned with the Atom/Molecule/Organism/Container design philosophy, and to ensure all components have associated unit tests and comprehensive documentation. The primary architectural change involves moving existing single-file components into dedicated directories.
>
> Here are the specific files that require modification:
>
> - **packages/design-system/src/components/AppBar.tsx**
>   - This component needs to be moved into a new `AppBar/` folder, likely as `AppBar/index.tsx`, to comply with the Atom/Molecule/Organism philosophy. This refactoring also requires the creation of dedicated test and documentation files within the new folder.
> - **packages/design-system/src/components/AppBar.types.ts**
>   - This file, containing types for the `AppBar` component, needs to be relocated into the new `AppBar/` folder, ideally renamed to `types.ts` or integrated into `AppBar/index.ts`.
> - **packages/design-system/src/components/AppBarNotifDropdown.tsx**
>   - This component needs to be moved into a dedicated `AppBarNotifDropdown/` folder, likely as `AppBarNotifDropdown/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/AppBarProfileDropdown.tsx**
>   - This component needs to be moved into a dedicated `AppBarProfileDropdown/` folder, likely as `AppBarProfileDropdown/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/AuroraBackground.tsx**
>   - This component needs to be moved into a dedicated `AuroraBackground/` folder, likely as `AuroraBackground/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/BottomNav.tsx**
>   - This component needs to be moved into a dedicated `BottomNav/` folder, likely as `BottomNav/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/BrandIcons.tsx**
>   - This component needs to be moved into a dedicated `BrandIcons/` folder, likely as `BrandIcons/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Button.tsx**
>   - This component needs to be moved into a dedicated `Button/` folder, likely as `Button/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Card.tsx**
>   - This component needs to be moved into a dedicated `Card/` folder, likely as `Card/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Chip.tsx**
>   - This component needs to be moved into a dedicated `Chip/` folder, likely as `Chip/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/ConfirmModal.tsx**
>   - This component needs to be moved into a dedicated `ConfirmModal/` folder, likely as `ConfirmModal/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/DashboardCharts.tsx**
>   - This component needs to be moved into a dedicated `DashboardCharts/` folder, likely as `DashboardCharts/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Hamburger.tsx**
>   - This component needs to be moved into a dedicated `Hamburger/` folder, likely as `Hamburger/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Input.tsx**
>   - This component needs to be moved into a dedicated `Input/` folder, likely as `Input/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/InsightsSidebar.tsx**
>   - This component needs to be moved into a dedicated `InsightsSidebar/` folder, likely as `InsightsSidebar/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Label.tsx**
>   - This component needs to be moved into a dedicated `Label/` folder, likely as `Label/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Loader.tsx**
>   - This component needs to be moved into a dedicated `Loader/` folder, likely as `Loader/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/LoginButton.tsx**
>   - This component needs to be moved into a dedicated `LoginButton/` folder, likely as `LoginButton/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/PinInput.tsx**
>   - This component needs to be moved into a dedicated `PinInput/` folder, likely as `PinInput/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/QuickAddBar.tsx**
>   - This component needs to be moved into a dedicated `QuickAddBar/` folder, likely as `QuickAddBar/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/Sidebar.tsx**
>   - This component needs to be moved into a dedicated `Sidebar/` folder, likely as `Sidebar/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/SidebarLayout.tsx**
>   - This component needs to be moved into a dedicated `SidebarLayout/` folder, likely as `SidebarLayout/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/SupplierHeader.tsx**
>   - This component needs to be moved into a new `Supplier/` folder, likely as `Supplier/Header.tsx`, as part of consolidating all 'Supplier' related components. This refactoring also requires adding dedicated test and documentation files within this consolidated `Supplier` directory.
> - **packages/design-system/src/components/SupplierLineItem.tsx**
>   - This component needs to be moved into the new `Supplier/` folder, likely as `Supplier/LineItem.tsx`, as part of consolidating all 'Supplier' related components. This refactoring also requires adding dedicated test and documentation files within this consolidated `Supplier` directory.
> - **packages/design-system/src/components/SupplierOrderGroup.tsx**
>   - This component needs to be moved into the new `Supplier/` folder, likely as `Supplier/OrderGroup.tsx`, as part of consolidating all 'Supplier' related components. This refactoring also requires adding dedicated test and documentation files within this consolidated `Supplier` directory.
> - **packages/design-system/src/components/SupplierOrderGroup.types.ts**
>   - This file, containing types for `SupplierOrderGroup`, needs to be moved into the new `Supplier/` folder, ideally renamed to `OrderGroup.types.ts` or integrated into `Supplier/OrderGroup/index.ts`.
> - **packages/design-system/src/components/Table.tsx**
>   - This component needs to be moved into a dedicated `Table/` folder, likely as `Table/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/ThemeToggle.tsx**
>   - This component needs to be moved into a dedicated `ThemeToggle/` folder, likely as `ThemeToggle/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/components/TwoToneHeader.tsx**
>   - This component needs to be moved into a dedicated `TwoToneHeader/` folder, likely as `TwoToneHeader/index.tsx`. This refactoring requires adding dedicated test and documentation files within the new directory.
> - **packages/design-system/src/index.ts**
>   - This file requires modification to update all import/export paths to reflect the new folder-based structure of the refactored components.

> **conarwelsh**: this also remains true for our packages/domain-* packages, they have the same issues

> **conarwelsh**: Successfully refactored the supplier-related design-system components as requested:
>
> - Created proper folder structure: `src/components/molecules` and `src/components/organisms`.
> - Moved and refactored `SupplierHeader.tsx` and `SupplierLineItem.tsx` into `molecules/`.
> - Moved and refactored `SupplierOrderGroup.tsx` and `SupplierOrderGroup.types.ts` into `organisms/`.
> - Eradicated all hardcoded Tailwind colors, zinc/slate references, and margins/paddings from Tailwind classes across these files, replacing them with semantic design tokens (e.g., `bg-secondary`, `bg-card/60`, `border-border`, `shadow-glow-accent`, `shadow-glow-sm`, etc.).
> - Ensured file sizes do not exceed 200 lines.
> - Cleaned up old supplier components from the root components folder.
> - Updated all package exports in `packages/design-system/src/index.ts` and verified successful typechecking and linting.

---

### #62: Merge v0 Omnibar Visual Design

**Labels:** enhancement, frontend, design-system

**Description:**
We have a new visually upgraded Omnibar design generated via v0 that needs to be permanently merged. Objective: Apply the new Neon-Glass UI to the Omnibar.

Agent Instructions:

- Refactor OmniBarPresentation.tsx and AttachmentFlyout.tsx to match the new v0 design specifications
- Strictly enforce our "Neon-Glass" aesthetic. Use ONLY semantic Tailwind tokens (bg-secondary, border-border, etc.) from our design system.
- Retain the Framer Motion architecture (springs, layout, and layoutId props) to ensure it morphs between the pill, circle, and droplet smoothly

**Comments:**

---

### #60: packages/api-types

**Labels:** enhancement, question, backend

**Description:**
now that we have a packages/api-client in place... should packages/api-types still be a separate package or should they be merged??

**Comments:**

> **sous-tools**: Keeping packages/api-types separate from packages/api-client generally offers a better separation of concerns. The `api-types` package acts as the authoritative contract for the API, allowing its interfaces and data structures to be independently consumed by various parts of the system, such as frontend applications or other backend services, without pulling in the entire client implementation. The `api-client` then depends on these shared types to implement its request and response logic, ensuring type safety and consistency. This approach promotes greater reusability of the API contract and enhances architectural flexibility. Merging them would tightly couple the contract definition to a single client implementation, potentially limiting its independent utility.

> **sous-tools**: ### Diagnosis Report
>
> **Diagnosis:**
> The query asks whether `packages/api-types` and `packages/api-client` should be merged. Based on the expert advice from `sous-tools[bot]`, keeping `packages/api-types` separate is the recommended architectural approach. This separation ensures `api-types` can serve as an independent contract for the API, allowing various parts of the system (e.g., frontend, other services) to consume types without incurring a dependency on the full client implementation. This promotes reusability, modularity, and architectural flexibility. Merging them would tightly couple the API contract to a single client, limiting its independent utility. Therefore, the current separation is appropriate and beneficial.
>
> The "issue" is not a defect but a request for clarification on an architectural decision. To address this by reinforcing the correct practice and documenting the rationale, the following files should be modified.
>
> ---
>
> ### Files Requiring Modification:
>
> - **`packages/api-types/package.json`**
>   - Add or update the `description` field to explicitly state its role as the authoritative contract for API data structures, emphasizing its independent reusability across the codebase.
> - **`packages/api-client/package.json`**
>   - Add or update the `description` field to clarify its function as the implementation of the API client, noting its dependency on `api-types` for type safety and consistency.
> - **`docs/wiki/Overall_Vision.md`**
>   - Add a new section or expand an existing one to document the architectural principle of separating API types from API clients, explaining the benefits of this modular design for system scalability and maintainability.

---

### #59: Refactor: Move Recipe Scaling Logic to Domain Package

**Labels:** enhancement, design-system, refactor, approval:go

**Description:**
The recipe scaling logic currently lives in the design system, which is a severe Domain-Driven Design (DDD) violation. Objective: Relocate the logic to the correct domain.

Agent Instructions:

- Move packages/design-system/src/utils/scaling.ts and its associated .test.ts file to packages/domain-recipes/src/utils/
- Remove the export from the design-system index file
- Update all import references across apps/web and apps/api to pull from @soustools/domain-recipes instead

**Comments:**

> **conarwelsh**: ### Research Report:
>
> **Objective:** Relocate the recipe scaling logic from `packages/design-system` to its correct domain, `packages/domain-recipes`, to resolve a Domain-Driven Design (DDD) violation.
>
> **Files to be Moved:**
>
> - `packages/design-system/src/utils/scaling.ts`
> - `packages/design-system/src/utils/scaling.test.ts`
>
> **Target Directory:**
>
> - `packages/domain-recipes/src/utils/`
>
> **Affected Files & Required Changes:**
>
> Based on a codebase search, the following files import the scaling utility and will require import path updates:
>
> - `apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx`
> - `apps/web/src/app/(workspace)/recipes/[id]/page.tsx`
> - `apps/api/src/routes/recipes/handlers.ts`
> - `apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx`
>
> **Action Plan:**
>
> 1.  Move `scaling.ts` and `scaling.test.ts` to `packages/domain-recipes/src/utils/`.
> 2.  Remove the `calculateRecipeScale` export from `packages/design-system/src/index.ts`.
> 3.  Update all import statements in the affected files to reference `@soustools/domain-recipes`.
> 4.  Run tests to ensure all changes are non-breaking.
>
> **Tech Debt Analysis:**
>
> A review of `docs/audits/fetch_violations.md` confirms this refactoring does not introduce any new `fetch` violations. No other immediate tech debt concerns were identified.

> **conarwelsh**: Here is the implementation plan to move the recipe scaling logic:
>
> ### Implementation Plan: Move Recipe Scaling Logic to Domain Package
>
> 1.  **Move Files:**
>     - Move `packages/design-system/src/utils/scaling.ts` to `packages/domain-recipes/src/utils/scaling.ts`.
>     - Move `packages/design-system/src/utils/scaling.test.ts` to `packages/domain-recipes/src/utils/scaling.test.ts`.
> 2.  **Update Exports:**
>     - Remove the export of `scaling` from `packages/design-system/src/index.ts`.
>     - Add an export for `scaling` in `packages/domain-recipes/src/index.ts`.
> 3.  **Update Import References:**
>     - Search for all imports of `@soustools/design-system` that reference the scaling logic within `apps/web` and `apps/api`.
>     - Update these imports to point to `@soustools/domain-recipes`.
> 4.  **Verification:**
>     - Run tests in `packages/domain-recipes` to ensure the moved logic still works as expected.
>     - Run tests and linting across the entire monorepo to catch any broken imports or type errors.

> **conarwelsh**: I attempted to address this issue, but I ran into several problems with the development environment that prevented me from completing the task.
>
> 1.  The linting and type checking scripts are failing on the `main` branch with errors that seem unrelated to my changes.
> 2.  The API schema appears to be out of date, which is causing type errors when using the API client.
> 3.  There is an error in the eslint configuration that is preventing commits.
>
> I have reverted all my changes. I would recommend fixing these issues before attempting this refactor again.

---

### #58: Bug: Waffle Menu Click-Outside Bounding Box

**Labels:** bug, frontend

**Description:**
The Waffle Menu currently only closes if you click specifically on the app bar. The invisible click target is constrained. Objective: Expand the click-out overlay.

Agent Instructions:

- Locate WaffleMenuDropdown.tsx in the design system
- Fix the invisible overlay element or document click listener so that it spans 100vw and 100vh
- Ensure the z-index of the overlay sits perfectly behind the menu but above the rest of the app, ensuring any click outside the menu triggers the close function.

**Comments:**

---

### #57: login page

**Labels:** enhancement, backend, frontend, design-system

**Description:**
can we add remember me, forgot password, and login with google or github buttons to the login screen?

**Comments:**

> **sous-tools**: This request proposes several significant enhancements to the login page, including 'Remember Me,' 'Forgot Password,' and 'Login with Google/GitHub' functionalities. Implementing these features will greatly improve user convenience and offer more versatile authentication options. It requires substantial effort across both frontend development for UI updates and backend integration for new authentication flows, security protocols, and third-party API interactions. Consideration of the design system will be crucial to ensure a cohesive and consistent user experience.

> **sous-tools**: ### Diagnosis Report
>
> The request to add 'Remember Me,' 'Forgot Password,' and 'Login with Google/GitHub' functionalities to the login page involves significant changes across the frontend UI, client-side logic, and server-side authentication flows, leveraging Supabase as the likely authentication provider.
>
> - **apps/web/src/app/login/page.tsx**
>   This file is the primary frontend component and will need significant UI updates to include a "Remember Me" checkbox, a "Forgot Password" link, and dedicated buttons for social logins (Google, GitHub), along with their corresponding client-side event handlers.
>
> - **apps/web/src/app/actions/auth.ts**
>   This Next.js server action file will require implementing the logic to interact with Supabase for user authentication, including managing session persistence for "Remember Me," initiating password reset emails, and handling the OAuth callback process for Google and GitHub logins.
>
> - **apps/api/src/lib/supabase.ts**
>   This file, responsible for initializing the Supabase client in the API, must be reviewed to ensure the proper configuration of external OAuth providers (Google, GitHub) is in place, facilitating the social login functionality.
>
> - **apps/api/src/app.module.ts**
>   This main NestJS API module might need modifications to register new services or controllers if custom backend logic is developed to augment Supabase's default authentication flows, such as custom user creation hooks or additional data processing during social logins.
>
> - **packages/api-types/src/auth.ts**
>   This file may need to be updated to define any new data transfer objects (DTOs) or interfaces required for custom API endpoints that might be introduced to support the "Forgot Password" flow or additional user data associated with social logins.

> **conarwelsh**: the buttons and inputs have been added to the screen, but their functionality is not wired up

---

### #56: Omnibutton Reverts to Square / Center Screen

**Labels:** bug, frontend, design-system

**Description:**
After being focused and closed, the floating Omnibutton loses its shape (becomes a square) and teleports to the center of the screen instead of returning to its bottom-right FAB position. Objective: Fix the reset state of the Omni trigger.

Agent Instructions:

- Audit FloatingOmniTrigger.tsx and OmniBarProvider.tsx
- Ensure that when the OmniBar's active state is toggled to false, the component correctly re-applies its full border-radius (circle) and fixed bottom/right positioning
- Prevent any state remnants from forcing it into a centered modal configuration.

**Comments:**

---

### #55: Registration Page

**Labels:** enhancement, backend, frontend, database

**Description:**
we need a page where new tenants can register and create a tenant.

after they login they will get the full tutorial experience #45

at the end of the tutorial they should be taken to the settings page and displayed a tab that shows their tenant settings. on this tab will have to be the place to enter billing info into Stripe to setup their recurring monthly fees. They will also need the ability to change the tiered plan they are, which of course would limit the functionality of the app.

each page in the app should utilize whichever nextjs special file that makes sense such as unauthorized.ts to be able to let a user whos tenant is not subscribed to the feature they are trying to view that they need to upgrade to have this functionality.

**Comments:**

> **sous-tools**: This issue outlines the development of a comprehensive new tenant onboarding process. It starts with a registration page for new tenants, which also creates their tenant record. After login, users will follow a tutorial experience, eventually leading them to a tenant settings tab. This tab will facilitate Stripe integration for recurring billing and provide options to change their subscription plan, thereby influencing application functionality. Furthermore, the application needs to implement feature gating using Next.js `unauthorized.ts` files, guiding users to upgrade their plan for restricted features.

> **sous-tools**: ## Diagnosis Report: Registration Page & Tenant Onboarding
>
> This issue requires implementing a full tenant onboarding flow, from registration and tenant creation to billing setup and feature gating. The core involves creating new frontend pages, expanding backend API capabilities for tenant and billing management, updating the database schema, and integrating feature authorization across the application.
>
> Here are the specific files that require modification or creation:
>
> - **apps/web/src/app/register/page.tsx**
>   This new Next.js page will host the user registration form, allowing new tenants to sign up and initiate the tenant creation process.
>
> - **apps/web/src/app/actions/auth.ts**
>   This file will need to be extended to include a server action for handling new user registration, which will interact with Supabase authentication and then trigger the backend tenant creation.
>
> - **apps/web/src/app/layout.tsx**
>   Logic should be added here to check if a newly registered user needs to be redirected to the tutorial experience (issue #45) immediately after login.
>
> - **apps/web/src/app/(workspace)/settings/page.tsx**
>   This existing settings page will be modified to include a new tab or section dedicated to tenant settings, billing information, and subscription plan management.
>
> - **apps/web/src/app/(workspace)/settings/settings-client.tsx**
>   The client-side logic for the settings page will be updated to manage the state and display of the new tenant and billing settings tab.
>
> - **packages/domain-settings/src/tenant-billing-settings.tsx** (New File)
>   A new React component will be created within the `domain-settings` package to encapsulate the UI for entering Stripe billing information and selecting/changing tiered subscription plans.
>
> - **apps/web/src/app/(workspace)/unauthorized.ts** (New File)
>   Following the specified convention, this file will be created to serve as a custom page or component displayed when a user attempts to access a feature that is not included in their current subscription plan.
>
> - **apps/api/src/app.module.ts**
>   The main API module will need to import and register new modules for handling tenant management and Stripe billing logic.
>
> - **apps/api/src/modules/tenants/tenants.module.ts** (New File)
>   A new NestJS module will be created to group all tenant-related controllers, services, and other components.
>
> - **apps/api/src/modules/tenants/tenants.controller.ts** (New File)
>   This controller will expose API endpoints for creating, retrieving, and updating tenant records, including their associated subscription plan.
>
> - **apps/api/src/modules/tenants/tenants.service.ts** (New File)
>   This service will contain the business logic for managing tenant data, linking new tenants to Supabase user IDs, and updating their subscription status.
>
> - **apps/api/src/modules/billing/billing.module.ts** (New File)
>   A new NestJS module for Stripe integration will be created, containing services and controllers to handle payment processing and subscription management.
>
> - **apps/api/src/modules/billing/billing.controller.ts** (New File)
>   This controller will provide API endpoints for initiating Stripe checkout sessions, handling webhook callbacks from Stripe, and managing subscriptions.
>
> - **apps/api/src/modules/billing/billing.service.ts** (New File)
>   This service will encapsulate the logic for interacting with the Stripe API to create customers, manage subscriptions, and update the internal database with billing status.
>
> - **packages/api-types/src/index.ts**
>   New TypeScript interfaces and types for `Tenant`, `Subscription`, and `BillingInfo` will need to be defined and exported here for use across the frontend and backend.
>
> - **packages/supabase/schema.sql**
>   The Supabase schema will be updated to include new tables for `tenants` and `subscriptions`, establishing relationships with the existing `auth.users` table.
>
> - **supabase/migrations/YYYYMMDDHHMMSS_create_tenants_and_subscriptions.sql** (New File)
>   A new SQL migration script will be generated to apply the necessary database schema changes for tenants and subscriptions.
>
> - **apps/api/src/common/guards/feature-access.guard.ts** (New File)
>   A custom NestJS guard will be implemented to check a user's subscription plan against the required access level for specific API routes, enforcing feature gating on the backend.

> **conarwelsh**: there is a link on the login page to go to the registration page, but it does not yet exist. A link will also need to be added with content as well from the marketing page.

---

### #47: Square Integration

**Labels:** enhancement, backend, devops, database

**Description:**
We need to have Square fully wired up.

- development and staging should connect to the square sandbox, production should connect to square production
- we need to seed sample data into the square sandbox, it would be nice if we queried the production square data and seeded the sandbox with that so we are working with a structure exactly the same as our production will
- we need to ensure that it stays driver based and agents do not get lazy and hardcode implementations instead of placing them in the drivers
- we need all sales related data
- we need the entire catalog data set
- we need access to orders for the kds
- we need to be able to make sales/purchases for the POS
- we need the whole thing to be able to be 2-way synced into our shadow database, because both systems should be able to be used at the exact same time indefinitely, so they both need to have the same info for shared data, and our system will include additional data not present in square to associate to square data

**Comments:**

> **sous-tools**: This issue outlines the comprehensive integration of Square, requiring full connectivity to sandbox and production environments. Key aspects include seeding the sandbox with production-like data, ensuring a driver-based implementation to prevent hardcoding, and synchronizing all sales, catalog, and order data. A critical requirement is a robust two-way sync with our shadow database, allowing both systems to operate concurrently and indefinitely with consistent shared information, while also accommodating our unique additional data. This integration will enable essential functionalities for POS, KDS, and comprehensive data management.

> **sous-tools**: ### Diagnosis Report: Square Integration
>
> The Square integration requires significant architectural and logic changes across several key files to establish robust two-way synchronization, environmental configuration, and adherence to a driver-based pattern.
>
> - **`apps/api/src/modules/integrations/square-client.helper.ts`**: This file needs logic to dynamically configure and initialize the Square API client based on the current environment (development/staging for sandbox, production for production Square API).
> - **`apps/api/src/modules/integrations/drivers/square.driver.ts`**: This driver will encapsulate all direct interactions with the Square API, including methods for fetching and pushing catalog, sales, and order data, ensuring a clean, driver-based implementation.
> - **`apps/api/src/modules/integrations/square-mapper.helper.ts`**: This helper is crucial for defining and implementing the bidirectional data mapping between our internal database schema and Square's specific data structures for items, orders, and transactions.
> - **`apps/api/src/modules/integrations/square-sync.helper.ts`**: This file will house the core two-way synchronization logic, managing data consistency for sales, catalog, and orders by pulling changes from Square and pushing our internal data to Square.
> - **`apps/api/src/modules/integrations/square-seed.helper.ts`**: This helper will implement the sandbox seeding process, including fetching (or generating) production-like data and using the `square.driver.ts` to populate the Square sandbox environment.
> - **`apps/api/src/modules/integrations/webhooks.controller.ts`**: This controller needs to be updated to receive and validate incoming Square webhooks, then route these events to the `square-sync.helper.ts` to trigger appropriate data updates in our system.
> - **`apps/api/src/modules/integrations/integrations.service.ts`**: This service will orchestrate the overall Square integration, calling upon the driver, mappers, and sync helpers for various operations like initiating syncs or responding to internal events.
> - **`apps/api/src/modules/integrations/integrations.module.ts`**: This module must be updated to declare and export all Square-related providers (e.g., `SquareClientHelper`, `SquareDriver`, `SquareMapperHelper`, `SquareSyncHelper`, `SquareSeedHelper`, `WebhooksController`) to make them available for dependency injection.
> - **`apps/api/src/app.module.ts`**: The main application module needs to import the `IntegrationsModule` to ensure that all Square integration services are properly registered and initialized within the application.
> - **`supabase/schema.sql`**: The database schema requires modifications to include fields for storing Square's unique identifiers for synced entities (e.g., item IDs, order IDs) and to accommodate any additional data specific to our system.
> - **`.infisical.json`**: This file needs to be configured with the environment-specific Square API credentials, such as access tokens and webhook secrets, ensuring secure access to Square's sandbox and production environments.
> - **`apps/api/src/modules/items/items.service.ts`**: This service will need to integrate with `square-sync.helper.ts` to ensure that our internal catalog data remains consistent with Square's catalog, handling creation, updates, and deletions bi-directionally.
> - **`apps/api/src/modules/pos/pos-transactions.service.ts`**: This service must be updated to interact with `square-sync.helper.ts` to process POS sales and purchases, ensuring that these transactions are accurately recorded and synchronized with Square.

---

### #45: Tutorial system

**Labels:** enhancement, frontend, design-system

**Description:**
We need to add a tutorial system to the app, hovers and popovers and whatnot instructing a user how to use the app that once shown will no longer be shown to the user, industry standard onloading tutorials but make them beautiful and animated and minimalistic.

**Comments:**

> **sous-tools**: This issue proposes implementing an interactive onboarding tutorial system within the application. The system should utilize hovers and popovers to guide users through core functionalities, displaying each instructional element only once per user. Emphasis is placed on creating a visually appealing, animated, and minimalistic user experience that aligns with industry standards for first-time user guidance.

> **sous-tools**: ## Diagnosis Report
>
> ### Overview
>
> The proposed tutorial system requires a comprehensive solution spanning UI components, client-side state management, and backend persistence. The core challenge involves creating interactive, visually appealing, and animated onboarding experiences that track user progress to ensure each instructional element is shown only once. This will primarily impact the `apps/web` frontend, leveraging `packages/design-system` for reusable UI, and `apps/api` with `packages/supabase` for backend persistence of user tutorial states.
>
> ### File Modifications Required
>
> - **`packages/design-system/src/components/` (New files, e.g., `TutorialPopover.tsx`, `TutorialHighlight.tsx`)**
>   - Create new, generic, and highly customizable React components for animated popovers, hovers, and highlighting elements. These components will encapsulate the visual presentation, animations, and accessibility requirements for the tutorial steps, adhering to the "beautiful and animated and minimalistic" mandate.
> - **`apps/web/src/app/layout.tsx`**
>   - Integrate the primary tutorial system component or context provider into the root layout. This ensures the tutorial system is initialized and available across the entire web application, enabling global control over tutorial visibility and flow based on user authentication and overall progress.
> - **`apps/web/src/app/(workspace)/layout.tsx`**
>   - Implement specific tutorial logic within the workspace layout to trigger and manage onboarding flows relevant to the main application functionalities. This will allow for contextual guidance as users navigate through different sections of the application, such as the dashboard, inventory, or recipes.
> - **`apps/web/src/lib/` (New file, e.g., `tutorial.context.ts` or `useTutorial.ts`)**
>   - Develop a client-side React Context or custom hook to manage the tutorial's active state, current step, and completion status. This client-side logic will orchestrate the display of tutorial elements, handle user interactions (e.g., "next," "skip"), and communicate with the backend to persist progress.
> - **`apps/api/src/modules/users/users.service.ts`**
>   - Modify the user service to include methods for updating and retrieving a user's tutorial progress. This will involve business logic to mark tutorial steps as completed and manage the overall onboarding status for individual users.
> - **`apps/api/src/modules/users/users.controller.ts`**
>   - Add new API endpoints (e.g., POST `/users/:id/tutorial/complete-step`) to allow the frontend to inform the backend when a user has completed a specific tutorial step. This controller will interface with the `users.service.ts` to persist the changes.
> - **`packages/supabase/schema.sql`**
>   - Add a new column (e.g., `tutorial_progress JSONB` or `onboarding_status TEXT`) to the `users` table to store a flexible record of completed tutorial steps or the current stage of the user's onboarding journey. This ensures that progress is saved persistently across sessions and devices.
> - **`packages/api-types/src/auth.ts` (or relevant user type definition)**
>   - Update the shared `User` interface or type definition to include the new `tutorial_progress` or `onboarding_status` field. This ensures type safety and consistency across the frontend and backend when handling user data related to the tutorial system.

---

### #44: Recipes Page

**Labels:** enhancement, backend, frontend, design-system, database

**Description:**

- can we have a tutorial step that instructs the user that they can use the omnibar to add recipes, and if there are no recipes at all the default page should be an informative message letting a user know the different ways they can populate recipes into the system
- we need a better way to list the recipes
- we need to be able to pin recipes
- we need to be able to mark recipes as favorites
- we need to be able to search recipes
- we need to be able to filter recipes by tags, categories, dietary restrictions, type of cuisine, etc

**Comments:**

> **sous-tools**: This issue proposes significant enhancements for the Recipes Page, focusing on improved user onboarding, recipe discovery, and management. Key requests include an initial tutorial for adding recipes via the omnibar and an informative empty state message. Further, it calls for a better recipe listing method and the introduction of core functionalities such as pinning, marking favorites, robust search capabilities, and advanced filtering options based on tags, categories, dietary restrictions, and cuisine types.

> **sous-tools**: ### Diagnosis Report
>
> This issue proposes significant enhancements to the Recipes Page, impacting both the web application's frontend and the API's backend. The core changes involve introducing advanced discovery features (search, filter, pin, favorite) and improving user onboarding with tutorials and informative empty states.
>
> - **apps/web/src/app/(workspace)/recipes/page.tsx**
>   This file, as the main entry point for the Recipes page, will need to implement the tutorial step for the omnibar, render the informative empty state when no recipes exist, and integrate the new search and filtering UI.
>
> - **apps/web/src/app/(workspace)/recipes/RecipesClientPage.tsx**
>   This client-side component will manage the state for search queries and filters, handle user interactions for pinning and favoriting recipes, and orchestrate the display of filtered/sorted recipes.
>
> - **packages/domain-recipes/src/RecipeList.tsx**
>   This component, responsible for rendering the list of recipes, will need to be updated to visually accommodate pinned and favorited recipes, and dynamically display results from search and filter operations.
>
> - **packages/domain-recipes/src/RecipeCard.tsx**
>   The individual recipe card component will require modifications to include UI elements that allow users to mark recipes as favorites or pin them, and to display their current pinned/favorited status.
>
> - **packages/domain-recipes/src/RecipeFilter.tsx**
>   This existing filter component will be extended to include new filtering options such as tags, categories, dietary restrictions, and cuisine type, and can also incorporate the search input functionality.
>
> - **apps/api/src/modules/recipe/recipes.controller.ts**
>   The API controller for recipes will need new or modified endpoints to accept search parameters, filter criteria, and requests to update the `isPinned` and `isFavorite` status of recipes.
>
> - **apps/api/src/modules/recipe/recipes.service.ts**
>   This service layer will implement the business logic for retrieving recipes based on search terms and multiple filter criteria, as well as updating the persistence layer with pin and favorite status changes.
>
> - **packages/api-types/src/recipes.ts**
>   The TypeScript interfaces and types defined here for recipes will need to be updated to include new properties such as `isPinned`, `isFavorite`, `tags`, `categories`, `dietaryRestrictions`, and `cuisineType`.
>
> - **apps/api/apps/api/src/schema.gql**
>   Assuming a GraphQL API, this schema definition will require updates to the `Recipe` type to expose the new `isPinned`, `isFavorite`, `tags`, and other filtering-related fields, along with corresponding query arguments for search and filter operations.
>
> - **apps/web/e2e/recipe.spec.ts**
>   New end-to-end tests should be added to this file to cover the functionality of the new tutorial/empty state, pinning, favoriting, recipe search, and various filtering options to ensure a robust user experience.

> **conarwelsh**: requires #44

---

### #43: Tech Debt: Upgrade setup-portal to Next.js 16

**Labels:** enhancement, agent:plan

**Description:**
The setup-portal application is currently running on Next.js 14. We need to upgrade it to Next.js 16 to align with the monorepo standards and remove the experimental instrumentationHook workaround.

**Comments:**

> **sous-tools**: The `setup-portal` application requires a significant upgrade from Next.js 14 to Next.js 16. This update is crucial for aligning the application with the established monorepo standards. Additionally, the upgrade will facilitate the removal of an experimental `instrumentationHook` workaround currently in place. Addressing this technical debt will enhance the application's stability, maintainability, and overall code quality.

> **sous-tools**: ### Diagnosis Report
>
> The core of this issue involves updating the `setup-portal` application's dependencies and configuration to support Next.js 16. This upgrade requires modifications to dependency declarations, Next.js specific configurations, and potentially associated development tool configurations to ensure compatibility and leverage new features, including the removal of the `instrumentationHook` workaround.
>
> - **`apps/setup-portal/package.json`**
>   The `next` dependency must be updated from version 14 to 16. Additionally, `react` and `react-dom` dependencies should be reviewed and updated to versions compatible with Next.js 16.
> - **`apps/setup-portal/next.config.mjs`**
>   This file will require updates to align with Next.js 16's configuration changes. Any experimental flags or custom logic related to the `instrumentationHook` workaround should be removed or refactored, as Next.js 16 likely provides a stable or different approach to instrumentation.
> - **`apps/setup-portal/tsconfig.json`**
>   The TypeScript configuration might need adjustments to compiler options or type declarations to ensure full compatibility with Next.js 16 and its ecosystem.
> - **`apps/setup-portal/eslint.config.js`**
>   ESLint rules and plugins should be reviewed and updated to reflect any changes in Next.js 16's recommended linting practices or new features.

> **conarwelsh**: ### Implementation Plan: Upgrade `setup-portal` to Next.js 16
>
> 1.  **Update Dependencies:**
>     - Navigate to `apps/setup-portal/package.json`.
>     - Upgrade the `next` dependency to the latest version of Next.js 16.
>     - Update any other related `@types/next`, `react`, and `react-dom` packages to ensure compatibility.
> 2.  **Remove Instrumentation Hook:**
>     - Open `apps/setup-portal/next.config.mjs`.
>     - Remove the `experimental: { instrumentationHook: true }` configuration object, as this is no longer needed in Next.js 16.
>     - Delete the corresponding `instrumentation.ts` (or `.js`) file from the `apps/setup-portal` directory.
> 3.  **Install & Verify:**
>     - From the root of the monorepo, run `pnpm install` to apply the dependency changes.
>     - Run `pnpm dev` within the `setup-portal` workspace to ensure the application builds and runs without errors after the upgrade.

---

### #40: KDS Functionality

**Labels:** bug, enhancement, backend

**Description:**

- link to live orders
- show completed orders from live data
- functional all day counts
- functional completion of individual items or whole tickets

**Comments:**

> **sous-tools**: The KDS is experiencing significant functional issues related to live order management and display. Key problems include a broken link to live order data, the inability to show completed orders from real-time sources, and non-functional "all day counts." Furthermore, the critical functionality for completing individual items or entire tickets is not working as intended. These items indicate a need for immediate bug fixes in core KDS operations, alongside an important enhancement for displaying completed order history.

> **sous-tools**: ### Diagnosis Report: KDS Functionality
>
> The KDS is experiencing significant issues across its core functionalities, indicating problems in both frontend data display and backend order management logic. The issues stem from a lack of proper data fetching, real-time updates, and state management for orders and their completion status.
>
> Here are the files identified for modification:
>
> - **`apps/web/src/app/(fullscreen)/kds/page.tsx`**
>   This file, as the KDS frontend, requires updates to correctly fetch and display live and completed orders, implement the UI for marking individual items or entire tickets as complete, and calculate/render "all day counts." It needs to ensure a robust connection to the backend for real-time data.
>
> - **`apps/api/src/modules/pos/pos-transactions.service.ts`**
>   This backend service is crucial for handling KDS data. It needs logic implemented or corrected to retrieve live orders, query completed orders, calculate "all day counts," and perform mutations to update the completion status of individual items or whole tickets in the database.
>
> - **`apps/api/apps/api/src/schema.gql`**
>   The GraphQL schema needs to be updated to define the necessary queries for fetching live orders, completed orders, and "all day counts," as well as mutations for marking items or tickets as complete. Without these definitions, the frontend cannot interact correctly with the backend.
>
> - **`apps/api/src/modules/pos/pos.module.ts`**
>   To ensure "live order management" is functional, this module should be enhanced to include a WebSocket Gateway (e.g., `PosGateway`) to provide real-time updates to connected KDS clients. The associated `pos-transactions.service.ts` would then emit events through this gateway upon order creation or status changes.
>
> - **`apps/api/src/modules/integrations/webhooks.controller.ts`**
>   If the "link to live orders" is broken at the source, this controller, responsible for ingesting data from external POS systems (like Square), may have issues in receiving or correctly processing incoming order webhooks. It needs to ensure new and updated orders are reliably captured and stored.
>
> - **`packages/supabase/schema.sql`**
>   The underlying database schema must be verified to ensure that order and order item tables accurately support status tracking (e.g., `live`, `completed`), completion timestamps, and other fields necessary for "all day counts" and historical data retrieval. Missing or incorrect schema definitions can lead to data integrity issues.

> **conarwelsh**: - need to be wired up to real orders

---

### #39: POS Functionality

**Labels:** enhancement, backend, design-system, database

**Description:**

- fully integrate with live pos data
- fully active cart
- actually pull in real categories
- design beautiful menu to show all items
- setup beautiful and simple modifier menus

**Comments:**

> **sous-tools**: This issue outlines a critical enhancement for the POS system, focusing on deep integration with live data sources to ensure accuracy and real-time updates for categories and menu items. It requires developing a fully active and dynamic shopping cart experience for users. A significant design effort is needed to create visually appealing and user-friendly menus, including a beautiful display for all items and intuitive modifier options. This will greatly improve the user experience and data integrity of the POS functionality.

> **sous-tools**: ### Diagnosis Report
>
> This issue requires significant work across both the backend API and the frontend web application to transition the POS functionality from simulated data to live, interactive operations.
>
> **Files Requiring Modification:**
>
> - **`apps/api/src/modules/integrations/integrations.service.ts`**
>   This service needs to be enhanced to manage the full lifecycle of POS data integration, including fetching, storing, and synchronizing live categories, items, and modifiers from external POS systems.
> - **`apps/api/src/modules/integrations/square.driver.ts`**
>   Assuming Square is the primary live POS, this driver must be extended to fetch comprehensive data, including item categories, detailed menu items with all attributes, and associated modifier lists directly from the Square API.
> - **`apps/api/src/modules/integrations/square-mapper.helper.ts`**
>   This helper will be critical for accurately transforming raw data received from the Square API into the application's standardized internal data models for menu categories, items, and modifiers.
> - **`apps/api/src/modules/integrations/square-sync.helper.ts`**
>   This helper will require updates to efficiently synchronize the newly fetched live categories, items, and modifiers into the application's database, ensuring data consistency and real-time availability.
> - **`apps/api/src/modules/items/items.service.ts`**
>   This service needs to provide methods to access and query the live POS data (categories, items, modifiers) from the integrated source, ensuring it is prepared for consumption by the frontend.
> - **`apps/api/src/modules/items/items.controller.ts`**
>   New or updated API endpoints must be implemented here to expose the live categories, menu items, and modifier options, allowing the frontend POS application to retrieve this data dynamically.
> - **`apps/api/src/modules/pos/pos-transactions.service.ts`**
>   This service will be central to managing the active cart state, including operations for adding items, applying modifiers, calculating real-time totals, and processing actual POS orders and transactions.
> - **`apps/api/src/schema.gql`**
>   If the API uses GraphQL, the schema will need to be updated to define the new types and operations (queries, mutations) necessary for managing live POS items, categories, modifiers, and cart functionality.
> - **`apps/web/src/app/(fullscreen)/pos/page.tsx`**
>   This is the primary page for the POS interface and requires significant development to implement the active cart functionality, display the live categories and menu items, and render interactive modifier menus.
> - **`apps/pos-simulator/src/components/PosSimulator.tsx`**
>   This file and related components like `PosItemCard.tsx` from the simulator application should be reviewed for existing UI patterns and logic that can be adapted, extracted, and migrated to the live `apps/web` POS implementation to ensure consistency and accelerate development.
> - **`packages/design-system/src/index.ts` (and related components within `packages/design-system/src/components/`)**
>   The design system will likely require new or updated UI components (e.g., for menu item cards, category navigation, modifier selection) to support the "beautiful menu" and "simple modifier menus" design requirements.

> **conarwelsh**: - doesnt consume full height of the screen
>
> - need to show real data

---

### #12: Square Integration

**Labels:** bug, enhancement, backend

**Description:**

- trying to connect to square currently just says "Organization not loaded yet. Please refresh the page." when you click the button.
- need to load in all sales data from square and have a screen in the UI to show sales
- need to load all items in from square and have an item catalog editor in the UI as its own page to e able to view the entire catalog: items/modifiers/groups/categories/discounts/units/etc
- need to be able to fetch orders from square and have an orders page, as well as be able to show them in the KDS
- need a transactions page that fetches data from square

I know we are referring to Square in particular here but it should be driver based so we can implement drivers for Toast/Lightspeed/etc

**Comments:**

> **sous-tools**: The Square integration is currently failing to connect, displaying "Organization not loaded yet." This initial connection issue must be resolved. Afterward, the system requires significant enhancements to fetch and display various data from Square, including sales figures, a comprehensive item catalog (items, modifiers, groups, categories, discounts, units), orders for a dedicated page and KDS, and transaction details. The architecture should be built using a driver-based approach to support future integrations with other POS systems like Toast and Lightspeed.

> **sous-tools**: ### Diagnosis Report: Square Integration
>
> The "Organization not loaded yet" error indicates a failure in the initial connection or status retrieval from Square on the backend, which is not being properly communicated or handled by the frontend. The broader requirements necessitate a robust, driver-based API architecture for POS integrations and corresponding UI updates across multiple application sections to display synced data.
>
> Here are the specific files requiring modification:
>
> - **apps/api/src/modules/integrations/integrations.service.ts**
>   - This service needs to manage the connection state for Square, ensuring the "Organization not loaded yet" error is resolved by correctly persisting and retrieving connection status. It must also be refactored to utilize a generic `IPosDriver` interface for all POS operations, enabling a driver-based architecture.
> - **apps/api/src/modules/integrations/drivers/base.driver.ts**
>   - Define a comprehensive TypeScript interface (`IPosDriver`) that outlines all required methods for POS integrations, such as `connect`, `fetchSales`, `fetchItems`, `fetchOrders`, and `fetchTransactions`, to establish a standardized driver-based architecture.
> - **apps/api/src/modules/integrations/drivers/square.driver.ts**
>   - Implement the `IPosDriver` interface for Square, including logic to correctly authenticate and establish the initial connection to resolve the "Organization not loaded yet" error. This file will also contain the Square-specific API calls to fetch sales, items, orders, and transactions data.
> - **apps/api/src/modules/integrations/square-client.helper.ts**
>   - Review and update this helper to ensure the Square API client is robustly initialized and authenticated, properly handling credentials and connection errors that may lead to the "Organization not loaded yet" state.
> - **apps/api/src/modules/integrations/square-sync.helper.ts**
>   - Extend this helper to contain the specific logic for efficiently fetching and pre-processing various data types—sales, item catalog, orders, and transactions—from the Square API.
> - **apps/api/src/modules/integrations/square-mapper.helper.ts**
>   - Develop or enhance mapping functions here to transform the raw data retrieved from Square's API (for sales, item catalog, orders, and transactions) into the application's normalized internal data models.
> - **apps/api/src/modules/integrations/integrations.controller.ts**
>   - Add new API endpoints to handle requests related to Square integration, including initiating connections, triggering data synchronization, and serving fetched sales, catalog, orders, and transaction data to the frontend.
> - **apps/api/src/modules/integrations/pos-sync.processor.ts**
>   - Implement or extend background processing logic within this file to schedule and manage the periodic or event-driven synchronization of sales, item catalog, orders, and transaction data from Square.
> - **apps/api/src/schema.gql**
>   - Update the GraphQL schema to define new types and corresponding queries/mutations for the sales figures, comprehensive item catalog details, order specifics, and transaction records fetched from Square.
> - **apps/api/src/modules/items/items.service.ts**
>   - Integrate logic within this service to process and persist the item catalog data (items, modifiers, groups, categories, etc.) synchronized from Square, ensuring proper storage and retrieval for the UI.
> - **apps/api/src/modules/pos/pos-transactions.service.ts**
>   - Update this service to store, manage, and retrieve transaction data fetched from Square, making it available for the dedicated transactions page.
> - **apps/api/src/modules/metrics/metrics.controller.ts**
>   - Add new endpoints to expose aggregated sales data retrieved from Square, providing the necessary API for the frontend to display sales figures.
> - **apps/web/src/app/(workspace)/settings/settings-client.tsx**
>   - Update this client-side component to correctly interact with the API to initiate and monitor the Square connection, resolving the "Organization not loaded yet" issue by displaying accurate status feedback.
> - **packages/domain-settings/src/integration-card.tsx**
>   - Modify this UI component to visually represent the Square integration's connection status and provide interactive elements for connecting or refreshing the integration, based on data from the `settings-client.tsx`.
> - **apps/web/src/app/(workspace)/catalog/page.tsx**
>   - Develop or enhance the UI on this page to display the full Square-synced item catalog, including all items, modifiers, groups, and categories, with features for viewing and managing them.
> - **apps/web/src/app/(workspace)/inventory/orders/page.tsx**
>   - Enhance this existing orders page to fetch and display the new order data synchronized from Square, integrating it seamlessly with the current order management views.
> - **apps/web/src/app/(workspace)/transactions/page.tsx**
>   - Develop the UI on this page to fetch and present a detailed list of transactions retrieved from Square, including filtering and viewing capabilities.
> - **apps/web/src/app/(fullscreen)/kds/page.tsx**
>   - Update the Kitchen Display System (KDS) page to incorporate and clearly display new orders fetched from Square, ensuring they are prioritized and actionable for kitchen staff.
> - **apps/web/src/app/(workspace)/home/page.tsx**
>   - Integrate a new section or widget on this dashboard-like page to display key sales data and insights fetched from Square via the API, providing an overview of business performance.

> **sous-tools**: This issue outlines the comprehensive development for a Square integration, designed with a driver-based architecture to support future POS systems like Toast or Lightspeed. The immediate blocker is an 'Organization not loaded' error when attempting to connect, which needs resolution. Once connectivity is established, the integration requires fetching and displaying sales data, a complete item catalog with editor capabilities, orders (including KDS integration), and transaction history within dedicated UI pages.

> **sous-tools**: ### Diagnosis Report: Square Integration
>
> The "Organization not loaded yet" error indicates a failure in the initial connection or status retrieval from Square on the backend, which is not being properly communicated or handled by the frontend. The broader requirements necessitate a robust, driver-based API architecture for POS integrations and corresponding UI updates across multiple application sections to display synced data.
>
> Here are the specific files requiring modification:
>
> - **apps/api/src/modules/integrations/integrations.service.ts**
>   - This service needs to manage the connection state for Square, ensuring the "Organization not loaded yet" error is resolved by correctly persisting and retrieving connection status. It must also be refactored to utilize a generic `IPosDriver` interface for all POS operations, enabling a driver-based architecture.
> - **apps/api/src/modules/integrations/drivers/base.driver.ts**
>   - Define a comprehensive TypeScript interface (`IPosDriver`) that outlines all required methods for POS integrations, such as `connect`, `fetchSales`, `fetchItems`, `fetchOrders`, and `fetchTransactions`, to establish a standardized driver-based architecture.
> - **apps/api/src/modules/integrations/drivers/square.driver.ts**
>   - Implement the `IPosDriver` interface for Square, including logic to correctly authenticate and establish the initial connection to resolve the "Organization not loaded yet" error. This file will also contain the Square-specific API calls to fetch sales, items, orders, and transactions data.
> - **apps/api/src/modules/integrations/square-client.helper.ts**
>   - Review and update this helper to ensure the Square API client is robustly initialized and authenticated, properly handling credentials and connection errors that may lead to the "Organization not loaded yet" state.
> - **apps/api/src/modules/integrations/square-sync.helper.ts**
>   - Extend this helper to contain the specific logic for efficiently fetching and pre-processing various data types—sales, item catalog, orders, and transactions—from the Square API.
> - **apps/api/src/modules/integrations/square-mapper.helper.ts**
>   - Develop or enhance mapping functions here to transform the raw data retrieved from Square's API (for sales, item catalog, orders, and transactions) into the application's normalized internal data models.
> - **apps/api/src/modules/integrations/integrations.controller.ts**
>   - Add new API endpoints to handle requests related to Square integration, including initiating connections, triggering data synchronization, and serving fetched sales, catalog, orders, and transaction data to the frontend.
> - **apps/api/src/modules/integrations/pos-sync.processor.ts**
>   - Implement or extend background processing logic within this file to schedule and manage the periodic or event-driven synchronization of sales, item catalog, orders, and transaction data from Square.
> - **apps/api/src/schema.gql**
>   - Update the GraphQL schema to define new types and corresponding queries/mutations for the sales figures, comprehensive item catalog details, order specifics, and transaction records fetched from Square.
> - **apps/api/src/modules/items/items.service.ts**
>   - Integrate logic within this service to process and persist the item catalog data (items, modifiers, groups, categories, etc.) synchronized from Square, ensuring proper storage and retrieval for the UI.
> - **apps/api/src/modules/pos/pos-transactions.service.ts**
>   - Update this service to store, manage, and retrieve transaction data fetched from Square, making it available for the dedicated transactions page.
> - **apps/api/src/modules/metrics/metrics.controller.ts**
>   - Add new endpoints to expose aggregated sales data retrieved from Square, providing the necessary API for the frontend to display sales figures.
> - **apps/web/src/app/(workspace)/settings/settings-client.tsx**
>   - Update this client-side component to correctly interact with the API to initiate and monitor the Square connection, resolving the "Organization not loaded yet" issue by displaying accurate status feedback.
> - **packages/domain-settings/src/integration-card.tsx**
>   - Modify this UI component to visually represent the Square integration's connection status and provide interactive elements for connecting or refreshing the integration, based on data from the `settings-client.tsx`.
> - **apps/web/src/app/(workspace)/catalog/page.tsx**
>   - Develop or enhance the UI on this page to display the full Square-synced item catalog, including all items, modifiers, groups, and categories, with features for viewing and managing them.
> - **apps/web/src/app/(workspace)/inventory/orders/page.tsx**
>   - Enhance this existing orders page to fetch and display the new order data synchronized from Square, integrating it seamlessly with the current order management views.
> - **apps/web/src/app/(workspace)/transactions/page.tsx**
>   - Develop the UI on this page to fetch and present a detailed list of transactions retrieved from Square, including filtering and viewing capabilities.
> - **apps/web/src/app/(fullscreen)/kds/page.tsx**
>   - Update the Kitchen Display System (KDS) page to incorporate and clearly display new orders fetched from Square, ensuring they are prioritized and actionable for kitchen staff.
> - **apps/web/src/app/(workspace)/home/page.tsx**
>   - Integrate a new section or widget on this dashboard-like page to display key sales data and insights fetched from Square via the API, providing an overview of business performance.

---
