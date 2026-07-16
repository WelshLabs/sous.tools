### #74: disabling rules

**Labels:** bug, enhancement

**Description:**
currently i have noticed places where the agents have gotten lazy and disabled the eslint rules to bypass typechecks and lint checks, we need to go back and remove these disabling comments and actually fix the problem not be lazy.

**Comments:**

> **sous-tools**: A concerning trend has emerged where developers are disabling ESLint rules, bypassing critical type and lint checks, leading to a degradation of code quality and increased technical debt. This practice allows potential bugs to go unnoticed and prevents adherence to established coding standards. We need to actively identify and remove these disabling comments across the codebase. The underlying issues must be properly addressed and fixed instead of being lazily circumvented to maintain code integrity and reliability.

> **sous-tools**: ### Diagnosis Report
>
> The issue highlights a critical lapse in code quality control due to the pervasive use of ESLint rule disabling comments. This practice bypasses essential type and lint checks, introducing potential bugs and increasing technical debt. To address this, we must systematically identify and remove these comments, and more importantly, fix the underlying code issues that prompted their disabling.
>
> Here are the files identified as most relevant for inspection and modification:
>
> - **eslint.config.mjs**
>   - Diagnosis: This root ESLint configuration file should be reviewed for any overly broad `ignorePatterns` or global rule `overrides` that might be unintentionally allowing developers to bypass checks. The goal is to tighten global enforcement and ensure consistent linting across the entire repository.
> - **apps/api/eslint.config.js**
>   - Diagnosis: Inspect this application-specific ESLint configuration for any direct rule disabling or `overrides` targeting specific files within the API codebase. All such disabling entries need to be removed to restore full linting and type-checking enforcement for the backend services.
> - **apps/cli/eslint.config.js**
>   - Diagnosis: Examine this configuration file for the CLI application for any explicit rule disabling or file-specific `overrides`. Removing these will ensure that command-line tools adhere to the defined code quality standards.
> - **apps/web/eslint.config.js**
>   - Diagnosis: Review this client-side application's ESLint configuration for any disabled rules or `overrides`. Eliminating these will reinstate strict linting for the web application's components and logic, improving maintainability and reducing UI-related bugs.
> - **packages/design-system/eslint.config.js**
>   - Diagnosis: This shared design system's configuration is crucial for maintaining consistent UI component quality. Any disabled rules here must be removed, and the underlying code issues resolved to ensure robust and reusable components.
> - **apps/api/src/modules/commands/commands.service.ts**
>   - Diagnosis: This is a representative example of a backend source file that likely contains inline `// eslint-disable-next-line` or `/* eslint-disable */` comments. These comments must be removed, and the code refactored to properly resolve any linting or type errors they were circumventing.
> - **apps/web/src/app/(workspace)/ingestion/review/[id]/visual-builder.tsx**
>   - Diagnosis: As a complex UI component, this file is a high-probability target for inline ESLint disabling comments. These comments need to be removed, and the component's code updated to comply with all relevant ESLint and TypeScript rules.
> - **packages/design-system/src/components/OmniBar/use-omni-socket.hook.ts**
>   - Diagnosis: This utility hook is a critical piece of shared functionality. Any inline `eslint-disable` comments within it must be removed, and the associated code fixed to ensure reliability and adherence to coding standards for a core feature.
> - **packages/supabase/src/index.ts**
>   - Diagnosis: This file likely defines core interactions with the Supabase client. Any `eslint-disable` comments found here should be removed, with the underlying code issues being addressed to maintain data integrity and API interaction robustness.

---

### #73: favicon

**Labels:** bug, enhancement, devops, design-system, frontent

**Description:**
right now the favicon has a black background when it should be transparent. Also it would be nice to get the proper coloring of the icon itself to work with our environments (green = dev, orange = staging, prod = normal gradient).

This same logic applies to all of our app icons. There is an icon generator script that we use that should be added to the package.json scripts and should be modifier to work with our dev/staging/prod color logic and fixed to have a transparent background (for the icons that support it).

**Comments:**

> **sous-tools**: The current favicons and application icons incorrectly display with a black background instead of being transparent, which needs to be corrected. Additionally, an enhancement is required to implement environment-specific coloring for these icons, displaying green for development, orange for staging, and the standard gradient for production. The existing icon generator script must be updated to support both transparent backgrounds and this new color logic. Finally, this improved script should be added to the package.json scripts for streamlined asset generation and consistent icon management across environments.

> **sous-tools**: ### Diagnosis Report
>
> The issue describes two main problems: incorrect black backgrounds on favicons and application icons, and the absence of environment-specific coloring for these assets. The solution involves modifying the existing icon generator script to address these concerns and integrating it into the build process.
>
> - **`scripts/generate-icons.mjs`**
>   This script is the primary candidate for modification. It needs to be updated to generate icons with transparent backgrounds and incorporate logic to apply environment-specific colors (green for dev, orange for staging, standard gradient for prod) based on configuration or environment variables.
>
> - **`package.json`**
>   A new script command should be added to the root `package.json` to easily execute the updated `scripts/generate-icons.mjs` script, allowing for streamlined icon generation across different environments.
>
> - **`packages/design-system/src/utils/favicon-canvas.ts`**
>   This utility likely handles the low-level rendering of favicons onto a canvas. It needs to be reviewed and adjusted to explicitly draw a transparent background and accept parameters to apply the correct environment-specific colors or gradients.
>
> - **`packages/design-system/src/utils/favicon-status.ts`**
>   This file, which possibly dictates favicon appearance based on status, should be enhanced or refactored to define and manage the color mapping for different environments (dev, staging, prod), making this logic reusable by the `favicon-canvas.ts` or the generator script.
>
> - **`apps/web/src/app/layout.tsx`**
>   This file is responsible for embedding favicon links in the Next.js application. It must be updated to conditionally load the appropriate environment-specific favicon (e.g., `favicon-dev.svg`, `favicon-staging.svg`, `favicon-prod.svg`) based on the detected environment.
>
> - **`apps/web/src/app/manifest.ts`**
>   The web app manifest defines PWA icons. This file needs to be updated to correctly reference the newly generated, transparent, and environment-colored PWA icons, potentially by using dynamic paths or environment-specific icon sets.

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

### #71: wearos

**Labels:** bug, enhancement, devops, frontend

**Description:**
get the wearos app fully functional, and deploying sucessfully to both dev and prod (via sideloading)

**Comments:**

> **sous-tools**: This issue addresses the complete process of bringing a WearOS application to a fully functional state, which includes implementing any missing features, resolving existing bugs, and ensuring comprehensive testing. A critical component is establishing a reliable deployment pipeline that successfully allows for sideloading the application to both development and production environments. This ensures the app can be effectively distributed, tested, and released across all stages.

> **sous-tools**: ## Diagnosis Report: WearOS App Functionality and Deployment
>
> The WearOS issue requires improvements across the application's core logic, build configurations, and integration with the deployment pipeline and backend API to ensure full functionality and successful sideloading to both development and production environments.
>
> - **apps/wearos/app/src/main/java/com/sous/wearos/network/ApiClient.kt**
>   This file likely needs modifications to correctly configure API endpoints for both development and production environments, and ensure robust error handling and network resilience specific to WearOS constraints.
> - **apps/wearos/app/src/main/java/com/sous/wearos/network/TokenManager.kt**
>   Authentication logic and token persistence need to be fully implemented and secured, ensuring the WearOS app can reliably authenticate with the backend across different environments.
> - **apps/wearos/app/src/main/java/com/sous/wearos/presentation/MainActivity.kt**
>   The primary activity needs to be fully developed to orchestrate the main user interface, integrate all required features, and handle navigation and state management effectively.
> - **apps/wearos/app/src/main/java/com/sous/wearos/presentation/PairingScreen.kt**
>   This screen is crucial for the initial setup and secure pairing of the WearOS device with a user account or an external device (e.g., the setup portal), requiring robust connection and authentication flows.
> - **apps/wearos/app/src/main/java/com/sous/wearos/complication/VoiceCommandComplicationService.kt**
>   The implementation of voice command recognition and processing needs to be completed, including integration with the backend API for command execution and feedback.
> - **apps/wearos/app/src/main/java/com/sous/wearos/tile/MainTileService.kt**
>   The main tile functionality requires full implementation to provide quick, glanceable information and actions, ensuring it leverages WearOS UI best practices.
> - **apps/wearos/app/src/main/AndroidManifest.xml**
>   This manifest file must be updated to correctly declare all necessary permissions, services, activities, and features (like complications and tiles) for the WearOS application to function as intended.
> - **apps/wearos/app/build.gradle.kts**
>   This build script needs configuration for different build types (dev/prod), signing credentials, and potentially product flavors to generate environment-specific APKs or AABs for sideloading.
> - **deploy.sh**
>   The main deployment script for the monorepo needs to be extended to include specific steps for building, signing, and preparing the WearOS application for sideloading into both development and production environments.
> - **turbo.json**
>   This configuration file should include new tasks for building and deploying the WearOS application within the Turborepo monorepo, ensuring it integrates seamlessly into the overall project's build system.
> - **.infisical.json**
>   Environment-specific secrets and configurations, such as API base URLs or keys for dev and prod, need to be managed and injected into the WearOS application build process via Infisical.
> - **apps/api/src/modules/auth/auth.controller.ts**
>   The API's authentication controller might require adjustments or new endpoints to support the WearOS application's specific authentication flows and device types.
> - **apps/api/src/modules/devices/devices.service.ts**
>   New logic needs to be implemented within this service to register, track, and manage WearOS devices, including their pairing status and any device-specific data.
> - **apps/api/src/modules/commands/commands.controller.ts**
>   If the WearOS app sends voice commands or other specific commands to the backend, this API controller will need to be developed or extended to receive and process these requests.

---

### #70: tech debt

**Labels:** enhancement, devops

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

---

### #68: thin routing layer

**Labels:** enhancement, frontent

**Description:**
we need to make sure that the nextjs apps are merely simple thin routing shells. The only things happening in the nextjs apps should be routing and data fetching. Even data fetching should be done via packages. So the nextjs apps shouldnt really have to do anything other than orchestrate other packages and make them accessible via different routes.

**Comments:**

> **sous-tools**: This issue advocates for structuring Next.js applications as minimal routing shells. The primary goal is to confine application-specific logic to routing and the orchestration of data fetching, while encapsulating all actual data fetching and business logic within shared, reusable packages. This architecture fosters a more modular and maintainable system, positioning the Next.js app as a lightweight orchestrator that exposes pre-packaged functionalities through defined routes. It promotes clarity and reusability by centralizing core logic outside the application layer.

> **sous-tools**: ### Diagnosis Report
>
> The issue "thin routing layer" identifies a need to refactor Next.js applications to serve purely as routing and orchestration layers, with all core business logic and data fetching implementations encapsulated within shared packages. Based on the provided file structure, several files within the `apps/web`, `apps/pos-simulator`, and `apps/setup-portal` Next.js applications are likely candidates for refactoring. These files are currently performing more than just orchestration, often directly implementing data fetching or complex business logic.
>
> - **`apps/pos-simulator/src/app/page.tsx`**
>   This file likely contains direct data fetching for POS item data or includes significant simulation business logic. This logic should be extracted into a `packages/domain-pos-simulator` or `packages/api-client` for data retrieval.
> - **`apps/pos-simulator/src/components/PosSimulator.tsx`**
>   As the core simulator component, this file is prone to holding substantial business logic for simulation state management and data interaction. This logic should be moved to a dedicated domain package.
> - **`apps/web/src/app/actions/auth.ts`**
>   This file, containing Next.js Server Actions for authentication, likely implements authentication logic directly. This logic should be abstracted into a common authentication package or directly call functions from `packages/api-client`.
> - **`apps/web/src/app/(workspace)/ingestion/review/[id]/page.tsx`**
>   This page for reviewing ingested data likely integrates complex data fetching, transformation, and business rules for the review process. These operations should be delegated to `packages/domain-ingestion` or similar.
> - **`apps/web/src/app/(workspace)/ingestion/review/[id]/use-auto-mapping.ts`**
>   This custom hook probably encapsulates intricate auto-mapping business logic and data fetching for the ingestion review process. Its functionality should be migrated to `packages/domain-ingestion`.
> - **`apps/web/src/app/(workspace)/inventory/vendors/actions.ts`**
>   Similar to authentication actions, this file likely contains direct business logic for vendor management via Server Actions. This logic should be moved to a `packages/domain-inventory` package.
> - **`apps/web/src/app/(workspace)/recipes/[id]/kitchen/page.tsx`**
>   The kitchen view for recipes undoubtedly includes active recipe execution logic, timer management, and real-time updates. This core functionality should reside within `packages/domain-recipes`.
> - **`apps/web/src/app/(workspace)/signage/[deckId]/tv-signage-editor-client.tsx`**
>   As a rich client-side editor, this component is highly likely to contain extensive state management, data fetching for signage elements, and business logic for layout editing. This complex logic should be extracted into `packages/domain-signage`.
> - **`apps/web/src/app/display/[id]/page.tsx`**
>   This page, which serves as the signage display player, is responsible for fetching and dynamically rendering content. The detailed data processing and presentation logic for the display should be moved to `packages/domain-signage`.
> - **`apps/web/src/app/display/[id]/use-display-player.ts`**
>   This custom hook likely centralizes the core data fetching, state management, and display logic for the signage player. This functionality is a prime candidate for extraction into `packages/domain-signage`.
> - **`apps/web/src/components/GoogleDriveBrowserWrapper.tsx`**
>   This wrapper component probably handles direct integration logic, including data fetching and interaction with the Google Drive API. This integration-specific logic should be moved to a dedicated package or service.

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

### #65: staging site redirect loop

**Labels:** bug, backend, devops

**Description:**
currently the staging site gets in a never ending redirect loop and we have tried all kinds of ways to diagnose it but nothing has fixed it yet

**Comments:**

> **sous-tools**: The staging environment is currently experiencing a persistent and unresolved redirect loop, making it inaccessible for testing and development. Despite multiple diagnostic efforts, the root cause of the endless redirection remains elusive. This issue critically impacts our ability to validate new features and bug fixes before production deployment. Further investigation into server configurations, DNS settings, or application-level redirect rules is urgently required to restore staging site functionality.

> **sous-tools**: ## Diagnosis Report: Staging Site Redirect Loop
>
> The persistent redirect loop on the staging site points to a configuration conflict or incorrect redirection logic, likely spanning both infrastructure and application layers. The issue critically impacts testing and development, requiring urgent investigation into environment variables, application-level routing, and server-side redirect rules.
>
> ### Files Requiring Modification:
>
> - **`deploy/ansible/group_vars/all/vars.yml`**
>   - **Diagnosis**: This file defines environment-specific variables, including base URLs and protocol settings. A redirect loop can occur if `APP_URL`, `API_URL`, or HTTP/HTTPS enforcement variables are misconfigured for the staging domain, leading to conflicting redirects.
>   - **Changes**: Verify and correct the `APP_URL`, `API_URL`, and any related HTTP/HTTPS configuration to accurately reflect the staging environment's desired domain and protocol, ensuring no circular redirects are implicitly created.
> - **`apps/web/next.config.mjs`**
>   - **Diagnosis**: This Next.js configuration file can define `redirects` rules or `basePath`/`assetPrefix` settings. An incorrectly configured permanent redirect or a base path that doesn't align with the actual staging URL can cause the browser to enter a redirect loop.
>   - **Changes**: Review the `redirects` array for any rules that might be unintentionally creating a loop, particularly those that do not correctly differentiate between staging and production environments or mishandle protocol/subdomain variations. Check `basePath` and `assetPrefix` as well.
> - **`apps/web/src/app/layout.tsx`**
>   - **Diagnosis**: As a root layout component in the Next.js application, this file may contain client-side or server-side logic that performs redirects (e.g., for authentication, environment checks, or dynamic routing). If this logic unconditionally redirects or targets an incorrect URL, it will create a loop.
>   - **Changes**: Investigate any `redirect()` calls or similar logic within this file that might be causing an unconditional or circular redirect, especially those related to authentication status, `process.env` variables, or URL construction.
> - **`apps/api/src/main.ts`**
>   - **Diagnosis**: This is the entry point for the NestJS API, where global middleware, interceptors, or guards are registered. If the API is performing global redirects (e.g., enforcing HTTPS or redirecting unauthenticated users) and the frontend or a proxy also redirects, a loop can form.
>   - **Changes**: Examine any global middleware (`app.use(...)`), interceptors, or guards that perform HTTP redirects (e.g., to HTTPS or login pages) to ensure they are configured correctly for the staging environment and do not conflict with upstream proxies or frontend redirect logic.
> - **`deploy/ansible/roles/services/tasks/main.yml`**
>   - **Diagnosis**: This Ansible playbook configures and deploys server services, likely including the web server (e.g., Nginx, Caddy) that serves the staging site. Misconfigured server-level redirect rules (e.g., HTTP to HTTPS, non-www to www, or incorrect proxy settings) are a very common cause of redirect loops.
>   - **Changes**: Review the tasks that configure the web server for the staging environment (e.g., tasks deploying Nginx/Caddy configurations or templates). Ensure that any redirect directives are correctly applied for the staging domain and protocol, and do not introduce circular redirects with the application.

---

### #64: Storybook

**Labels:** enhancement, design-system, frontent

**Description:**
It would be nice, to have a Storybook setup, to be able to interact with our View components to be able to adjust designs and functionality in isolation

**Comments:**

> **sous-tools**: The request proposes integrating Storybook into the project to enhance the development and iteration of View components. Storybook would provide an isolated environment, allowing developers and designers to interact with components independently, adjust designs, and refine functionality. This setup aims to streamline the component development workflow, improve consistency, and facilitate easier testing of UI elements.

> **sous-tools**: ### Diagnosis Report
>
> The request proposes integrating Storybook into the project, specifically for the `packages/design-system` to facilitate isolated development and interaction with UI components. This setup involves adding Storybook as a development tool, which will necessitate modifications to existing configuration files within the `design-system` package and the monorepo's task runner.
>
> - **`packages/design-system/package.json`**
>   This file needs to be updated to include Storybook as a development dependency and to define scripts for starting and building the Storybook instance for the design system components.
> - **`packages/design-system/eslint.config.js`**
>   The ESLint configuration might require updates to properly lint Storybook-specific files (e.g., `.stories.tsx`) and to configure any Storybook-related ESLint plugins or rules.
> - **`packages/design-system/tsconfig.json`**
>   This TypeScript configuration file may need adjustments to include the new Storybook configuration files and `.stories.tsx` files, ensuring they are correctly type-checked.
> - **`turbo.json`**
>   As this is a monorepo managed by Turborepo, the `turbo.json` file needs to be updated to define new tasks for Storybook (e.g., `storybook`, `build-storybook`) within the `design-system` package, integrating it into the monorepo's build and development workflow.

---

### #63: design-system cleanup

**Labels:** documentation, enhancement, design-system, frontent

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

### #62: omnibar merge

**Labels:** enhancement, frontend, design-system

**Description:**
we need to merge the new omnibar design from the v0 package

**Comments:**

> **sous-tools**: This task involves merging the newly designed omnibar into the current application. The updated design originates from the 'v0 package', signifying an integration from our core design system. This merge is an enhancement aimed at improving the user interface and overall user experience. It will require focused frontend development to ensure a seamless and pixel-perfect integration of the component.

> **sous-tools**: ### Diagnosis Report: omnibar merge
>
> This task primarily involves updating the visual and interactive aspects of the omnibar component, which resides in the `packages/design-system` and is consumed by the `apps/web` application. The "v0 package" refers to the core design system where the updated component's source will be found.
>
> - **`packages/design-system/src/components/OmniBar/OmniBarPresentation.tsx`**
>   This file is the core UI component for the omnibar. It will require significant modifications to implement the new visual design and layout from the v0 package, ensuring a pixel-perfect match with the new specifications.
>
> - **`packages/design-system/src/components/OmniBar/AttachmentFlyout.tsx`**
>   As a sub-component of the omnibar, this file will need updates to its styling and potentially its internal layout or functionality to align with the new omnibar design. Other related sub-components like `CreatableSelect.tsx`, `OmniChatWindow.tsx`, and `FloatingOmniTrigger.tsx` will also need similar review and updates.
>
> - **`packages/design-system/src/components/OmniBar/OmniBarProvider.tsx`**
>   If the new omnibar design introduces changes to its internal state, context, or prop requirements, this provider file will need adjustments to accommodate the new data flow or configuration.
>
> - **`apps/web/src/app/(workspace)/layout.tsx`**
>   This is a primary layout for the web application where the omnibar component is likely consumed. It will need to be updated to integrate the new version of the `OmniBar` component from the `design-system`, potentially handling new props or layout requirements.
>
> - **`apps/web/src/components/layout/app-bar.tsx`**
>   Given that an app bar often contains or is closely related to search/omnibar functionality, this file will likely require updates to correctly render and interact with the newly designed omnibar component.
>
> - **`packages/api-types/src/omnibar.ts`**
>   If the new omnibar design introduces new data structures, command types, or interaction patterns that affect the API interface, this file will need updates to reflect the revised type definitions.

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

### #59: scaling helpers

**Labels:** enhancement, design-system

**Description:**
currently the recipe scaling utils are located in the design-system package, but this is most certainly domain-recipes logic and does not belong in design-system

**Comments:**

> **sous-tools**: The recipe scaling utility functions are currently located in the `design-system` package. This is a misplacement, as these utilities are specific to recipe domain logic and should reside within a `domain-recipes` package or similar, separate from UI components. Relocating these functions will improve code organization, adhere to domain boundaries, and ensure the `design-system` package remains focused purely on UI concerns.

> **sous-tools**: ### Diagnosis Report
>
> The core issue is the misplacement of recipe scaling utility functions within the `design-system` package, which should exclusively house UI components. These utilities are domain-specific to recipes and need to be relocated to the `domain-recipes` package for better code organization and adherence to domain boundaries.
>
> - **`packages/design-system/src/utils/scaling.ts`**
>   This file currently contains the recipe scaling logic and should be moved out of the `design-system` package into the `domain-recipes` package.
>
> - **`packages/design-system/src/utils/scaling.test.ts`**
>   The test file for the recipe scaling utilities must be moved alongside its corresponding implementation to maintain proper testing scope.
>
> - **`packages/design-system/src/index.ts`**
>   Any export of the `scaling` utilities from this package's entry point should be removed to prevent their exposure from the `design-system`.
>
> - **`packages/domain-recipes/src/utils/scaling.ts`**
>   A new file should be created here, serving as the correct home for the relocated recipe scaling utility functions, aligning them with `domain-recipes` logic.
>
> - **`packages/domain-recipes/src/utils/scaling.test.ts`**
>   A new test file should be created here to contain the tests for the relocated recipe scaling utilities.
>
> - **`packages/domain-recipes/src/index.ts`**
>   The newly added `scaling` utilities within the `domain-recipes` package should be exported from this file to make them accessible to other parts of the application.
>
> - **`packages/domain-recipes/src/RecipeScalingPanel.tsx`**
>   This component likely uses the recipe scaling utilities and will require its import statements to be updated to reflect their new location within the `domain-recipes` package.
>
> - **`apps/web/src/app/(workspace)/recipes/RecipeBuilderClient.tsx`**
>   This client-side recipe builder component may utilize the scaling helpers, so its import paths for these utilities will need to be updated.
>
> - **`apps/web/src/app/(workspace)/recipes/[id]/RecipeViewerClient.tsx`**
>   The recipe viewer might display scaled recipe information, necessitating an update to its import statements for the relocated scaling utilities.
>
> - **`apps/api/src/modules/recipe/recipes.service.ts`**
>   If this backend service currently consumes the recipe scaling utilities, its import paths will need to be updated to point to the new location within `packages/domain-recipes`.

---

### #58: waffle menu

**Labels:** bug, frontend

**Description:**
when clickout outside of the menu i would expect it to close, but it only does so if you click on the app bar. I think there is an invisible click target underneath the waffle menu, but i think its being confined to the appbar instead of covering the whole screen.

**Comments:**

> **sous-tools**: The waffle menu exhibits unexpected behavior where it only closes when a click occurs on the app bar, rather than anywhere outside the menu's boundaries. This suggests a problem with the click-outside-to-close mechanism, likely due to an invisible click target being incorrectly confined to the app bar area instead of covering the entire screen. This oversight negatively impacts user experience and violates common UI interaction patterns.

> **sous-tools**: ### Diagnosis Report:
>
> - **packages/design-system/src/components/GlobalAppBar/WaffleMenuDropdown.tsx**
>   This file likely contains the logic for the waffle menu dropdown, including its open/close state and the click-outside-to-close mechanism. The issue suggests that an invisible overlay element, or a `document` click listener intended to cover the entire screen for closing the menu, is either incorrectly sized, positioned, or scoped, causing it to only register clicks within the app bar's boundaries. The implementation needs to be reviewed to ensure any click-catching element or event listener correctly covers the full viewport when the menu is open.

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

### #56: omnibutton

**Labels:** bug, frontend, design-system

**Description:**
sometimes, especially after its been focused and closed, the omni button appears as a square instead of a circle.

it is also showing up in the center of the screen now when it should actually be a FAB in the bottom right corner

**Comments:**

> **sous-tools**: The omnibutton is exhibiting two distinct rendering issues: it incorrectly appears as a square instead of a circle, and its position defaults to the center of the screen rather than its designated Floating Action Button (FAB) location in the bottom-right corner. This buggy behavior is consistently observed after the button has been focused and subsequently closed. The problem points to a frontend rendering or state management defect, indicating a deviation from its intended design specifications.

> **sous-tools**: ## Diagnosis Report
>
> The omnibutton is experiencing frontend rendering and positioning issues, specifically appearing as a square instead of a circle and incorrectly placed in the center of the screen, particularly after being focused and closed. This points to defects in component styling, conditional rendering logic, or state management within the OmniBar components.
>
> - **`packages/design-system/src/components/OmniBar/FloatingOmniTrigger.tsx`**
>   This component's internal styling or conditional class application logic is likely failing to consistently re-apply the correct circular shape (`border-radius`) and fixed bottom-right positioning after the omni bar has been closed. Investigate its CSS properties, especially `border-radius`, `position`, `bottom`, and `right`, and any state-dependent class toggles that might be misbehaving.
>
> - **`packages/design-system/src/components/OmniBar/OmniBarPresentation.tsx`**
>   This wrapper component might not be correctly controlling the `FloatingOmniTrigger`'s props or rendering its container in a way that allows the trigger to maintain its intended FAB styles and position upon closure. Review how it handles the transition between the active OmniBar and the passive FAB state, ensuring appropriate props or parent container styles are applied.
>
> - **`packages/design-system/src/components/OmniBar/OmniBarProvider.tsx`**
>   The state managed by this provider, specifically related to the OmniBar's open/closed/focused status, might not be resetting correctly upon closure, leading to a persistent unintended state that influences the `FloatingOmniTrigger`'s misrendering. Verify that the state variables controlling the trigger's appearance are reset to their default FAB-intended values when the OmniBar is closed.

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

**Labels:** enhancement, frontent

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

---

### #40: KDS Functionality

**Labels:** bug, enhancement, backend, frontent

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

**Labels:** enhancement, backend, design-system, frontent, database

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

**Labels:** bug, enhancement, backend, frontent

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
