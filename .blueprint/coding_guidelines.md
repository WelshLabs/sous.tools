# Global Coding Guidelines: Sous Tools Monorepo

## 1. Core Code Principles

- **No Monolithic Files**: Maximum file length for any TypeScript or TSX file is 150 lines. If logic or markup exceeds this, abstract it into small atomic elements.
- **Strict Typing**: No `any` types allowed. Enforce proper TypeScript assertions, interfaces, and shared types across packages.
- **Active Code Style**: Favor pure functions, immutable data patterns, declarative Array methods (.map, .filter), and strict structural separation matching Domain-Driven Design (DDD).

## 2. Tooling Standardizations

- **Monorepo Manager**: Turborepo with `pnpm` workspaces.
- **Styling**: Tailwind CSS v4.
- **Code Linting & Formatting**: ESLint + Prettier.
- **API Contracts & Type-Safety**: Direct type sharing via `@soustools/api-types` and `graphql-codegen`.
- **Test Runners**: Vitest for frontend apps/packages; Jest for backend `apps/api` (NestJS).

## 3. Framework-Specific Guardrails

- **Next.js 16 (`apps/app`, `apps/signage`, `apps/customer-site`, `apps/marketing`)**: Use App Router layout architectures. Enforce strict code splitting. Do not import server-only logic into components marked with "use client". Add `@soustools/ui` to `transpilePackages` in `next.config.js`.
- **NestJS (`apps/api`)**: Follow standard modular structures (Controllers, Services, Modules). Always utilize built-in validation pipes (`class-validator`) on incoming request data Transfer Objects (DTOs).

## 4. Mandatory AI Output Execution Pipeline

Before proposing or applying any code changes via Git diffs, the Agent must execute these sub-steps in sequence:

1. **Read Constraints**: Verify logic matches the criteria outlined in `@PROJECT_BLUEPRINT.md`.
2. **Write Unit Tests First**: Generate or update corresponding Vitest/Jest unit tests. Target 100% statement, branch, and function coverage.
3. **Inject JSDocs**: Fully document exported interfaces, types, methods, and parameters.
4. **Append User-Facing Docs**: If a UI component or business service updates, provide a brief restaurant user guide marked clearly with the `@tenant-docs-export` tag.
