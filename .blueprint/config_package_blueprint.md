# Configuration Package & Secret Management Specification (`@soustools/config`)

## 1. Global Code Architecture & Guardrails

- **The Absolute Environment Isolation Rule**: Direct access to `process.env`, `Deno.env`, or any native runtime environment variables is strictly forbidden anywhere in the workspace codebase outside of the `@soustools/config` workspace package.
- **Consumption Token Contract**: Any application (`apps/api`, `apps/app`, etc.) or package requiring configurations, api keys, database credentials, or feature flags must import them directly from `@soustools/config`.
- **Type-Safe Exports**: All configuration parameters must be explicitly typed and exported as read-only immutable objects. No `any` variants allowed.

## 2. Infisical Secret Orchestration

- **The Core Provider**: Infisical is the exclusive single source of truth for secret and configuration variables across all environments (Development, Sandbox, Production).
- **Runtime Injection**: The `@soustools/config` package handles the initialization handshake with the Infisical SDK (or pulls from the local Infisical CLI agent running on the Raspberry Pi mesh node during offline operation).
- **Environment Hydration**: Secrets are loaded asynchronously during the bootstrap lifecycle of the backend or applications, caching the values into the immutable configuration token state.

## 3. Package Dependency & Workspace Rules

- **Package Location**: Resides at `packages/config/`.
- **Workspace Name**: `@soustools/config`.
- **Code Audit Boundary**: Subagents executing testing or linting tasks must flag any occurrence of `process.env` outside of `packages/config/` as an absolute lint break and block deployment pipelines until removed.
