This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: **/*
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/.next/**, **/out/**, **/build/**, package-lock.json, yarn.lock, pnpm-lock.yaml, **/.git/**, **/*.png, **/*.jpg, **/*.jpeg, **/*.svg, **/*.ico
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
skills/
  design-system/
    SKILL.md
  formula-math/
    SKILL.md
  migrations/
    SKILL.md
  nestjs-patterns/
    SKILL.md
  nextjs-patterns/
    SKILL.md
  quality-enforcement/
    SKILL.md
  supabase-client/
    SKILL.md
  wsl-execution/
    SKILL.md
AGENTS.md
```

# Files

## File: skills/design-system/SKILL.md
````markdown
---
name: design-system
description: Rules for @soustools/design-system — Neon-Glass Tailwind v4 token architecture, glassmorphism patterns, Japanese Gokujo iconography, and Kitchen Mode high-glare environments.
---

# `@soustools/design-system` — Neon-Glass Design System Rules

> [!IMPORTANT]
> `@soustools/design-system` (`packages/design-system`) is the **sole UI authority** for the workspace.
> `@soustools/ui` (`packages/ui`) is **deprecated**. Do not import from it in any new code.

---

## Package Identity

| Property | Value |
|---|---|
| Package name | `@soustools/design-system` |
| CSS entry | `packages/design-system/index.css` |
| Component entry | `packages/design-system/src/index.ts` |
| Token source | `v2-snapshot.md` → `sous-theme.kdl` |

---

## Neon-Glass Palette (Canonical — from `v2-snapshot.md`)

All color values are sourced **exclusively** from the v2 `sous-theme.kdl` terminal theme file.

| Token | Hex | Role |
|---|---|---|
| `--color-primary` | `#4cc9f0` | Neon cyan — primary interactive accent |
| `--color-background` | `#0f172a` | Page backdrop (slate-900) |
| `--color-card` | `#1e293b` | Elevated surface (slate-800) |
| `--color-foreground` | `#f8fafc` | Primary text (slate-50) |
| `--color-accent` | `#f72585` | Neon pink — secondary accent (magenta) |
| `--color-destructive` | `#f43f5e` | Error / danger (rose-500) |
| `--color-secondary` | `#334155` | Muted surface (slate-700) |
| `--color-muted-foreground` | `#94a3b8` | De-emphasized text (slate-400) |
| `--color-border` | `#334155` | Structural borders (slate-700) |
| `--color-ring` | `#4cc9f0` | Focus ring — matches primary |

---

## Tailwind v4 `@theme` Directive Rules

1. **All tokens are hardcoded hex** — no `hsl(var(--*))` indirection.
2. **Semantic names only** — use `--color-primary`, not `--color-cyan-400`.
3. **Z-indexes are token-scoped** — always use `--z-bottom-nav: 40`, `--z-sidebar: 50`, `--z-modal: 100`, `--z-toast: 150`.
4. **Font mapping** — `--font-sans` maps to `var(--font-primary)` injected by Next.js layout.

```css
/* ✅ CORRECT — hardcoded token in @theme */
@theme {
  --color-primary: #4cc9f0;
  --z-modal: 100;
}

/* ❌ FORBIDDEN — hsl indirection from old @soustools/ui pattern */
@theme {
  --color-primary: hsl(var(--primary)); /* DO NOT DO THIS */
}
```

---

## Glassmorphism — `.glass-panel` Rules

Use the predefined utility classes from `index.css`. Do not re-implement them inline.

| Class | Use Case |
|---|---|
| `.glass-panel` / `.st-glass-panel` | KDS/POS primary frosted surface |
| `.glass-card` | Secondary elevated card with inner glow |
| `.st-glass-pill` | Rounded pill shape (nav chips, badges) |
| `.neon-glow` | Cyan box-shadow glow on focused/active elements |
| `.neon-glow-lg` | Stronger glow for primary CTAs |
| `.neon-glow-pink` | Magenta accent glow |
| `.neon-border` | Cyan inset + outset border glow |

---

## Atomic Components

All components are **presentation-only**. They accept data via props and emit events via callbacks. No data fetching, no Supabase, no server calls.

| Component | File | Export |
|---|---|---|
| `TwoToneHeader` | `src/components/TwoToneHeader.tsx` | Named |
| `Button` | `src/components/Button.tsx` | Named + forwardRef |
| `Card` (+ sub-components) | `src/components/Card.tsx` | Named family |
| `Input` | `src/components/Input.tsx` | Named + forwardRef |
| `Label` | `src/components/Label.tsx` | Named |

### Button Variant Naming (shadcn-style)

```tsx
// ✅ CORRECT — shadcn-style variant names
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// ❌ FORBIDDEN — old @soustools/ui naming
<Button variant="primary">...</Button>  // "primary" is NOT a valid variant
```

---

## Iconography

- **ONLY** Japanese Gokujo curved knife profiles — no Western chef knives.
- Icon library: `lucide-react` (listed as a dependency in `packages/design-system/package.json`).
- Consistent stroke width: `2px`.

---

## Kitchen Mode Rules

For any component rendered on a KDS, POS kiosk, or edge node display:

1. Use `size="lg"` on `Button` — enforces `min-h-[48px]`.
2. Apply `.kitchen-touch` utility for non-Button interactive elements — enforces `min-h-[56px]`.
3. Wrap primary surfaces with `.glass-panel` for ambient glare rejection.
4. Use `border-2` instead of `border` for thick-border kitchen mode visibility.

---

## Adding a New Component

1. Create `packages/design-system/src/components/ComponentName.tsx`.
2. Use semantic CSS variables via `style={{ color: "var(--color-foreground)" }}` for token reference.
3. Export the component and its prop types from `packages/design-system/src/index.ts`.
4. Add JSDoc with `@tenant-docs-export` and a usage example.
5. **Never import from `@soustools/ui`** inside this package.
````

## File: skills/formula-math/SKILL.md
````markdown
---
name: formula-math
description: Rules for recipe costing, scaling math, metric-to-imperial conversions, and Baker's percentages.
---

# Formula Math & Volume Engine

- **Base costings**: Cost rollups must run recursively when prices update.
- **Conversions**: Support fluid-to-weight density coefficients.
- **Percentages**: Handle Baker's Percentages relative to a 100% baseline (flour/main ingredient).
````

## File: skills/migrations/SKILL.md
````markdown
---
name: migrations
description: Standards for writing PostgreSQL database migrations for Supabase, ensuring safe schemas, RLS org-scoping, and backward compatibility.
---

# Supabase Migration Patterns

## File Naming & Structure

- **Format**: `YYYYMMDDNNNNNN_descriptive_name.sql` — always timestamp-prefixed, always snake_case.
- **Single Concern**: One migration file per logical concern. Never bundle unrelated schema changes.
- **Idempotency**: Use `IF NOT EXISTS` / `IF EXISTS` guards on every DDL statement. Wrap conditional logic in `DO $$ BEGIN ... END $$;` blocks.

## Mandatory RLS Enforcement

> [!CAUTION]
> **Every table in the `public` schema MUST have Row Level Security enabled.** A migration that creates or alters a table without enabling RLS is invalid and must be halted.

Every new table migration must include these statements in order:

```sql
-- 1. Enable RLS — always required
ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS even for table owners
ALTER TABLE public.<table_name> FORCE ROW LEVEL SECURITY;

-- 3. Grant access to the authenticated role for all non-admin tables
GRANT SELECT, INSERT, UPDATE, DELETE ON public.<table_name> TO authenticated;

-- 4. Org-scoped SELECT policy (template — adapt predicate to table FK)
CREATE POLICY "<table_name>_org_isolation"
  ON public.<table_name>
  FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM public.org_members
      WHERE user_id = auth.uid()
    )
  );
```

## Admin Exception

The **Users / admin** route is the **only** exception to member-accessible policies. Admin-only tables use `service_role` scoping and `AdminGuard` on the NestJS side — they must **not** grant `authenticated` broad access:

```sql
-- Admin-only example: no grant to authenticated
REVOKE ALL ON public.admin_audit_log FROM authenticated;
```

## Grant Checklist (end of every migration file)

```sql
-- Always at the bottom of a migration
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO authenticated, service_role;
```

## Verification Before Push

> [!IMPORTANT]
> Per the HALT-ON-ERROR rule, all migrations must be verified against a **clean local database reset** before pushing. Run `supabase db reset` locally and confirm zero errors before committing. **Staging is ignored** — parity is Local → Production only.

- After reset, verify: no permission errors in logs, RLS policies exist for every public table, all `GRANT` statements applied.
- If `supabase db reset` fails for any reason, **STOP** and surface the error to the user. Do not attempt automatic fixes.

## Anti-Patterns

- **FORBIDDEN**: Migrations without `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
- **FORBIDDEN**: Tables with no org-scoping RLS policy.
- **FORBIDDEN**: Fragmented or out-of-order migration chains — flatten when requested.
- **FORBIDDEN**: Hardcoded UUIDs or user IDs in migration files.
````

## File: skills/nestjs-patterns/SKILL.md
````markdown
---
name: nestjs-patterns
description: Guidelines and patterns for NestJS backend modules, services, controllers, and GraphQL code-first schema decorators.
---

# NestJS Design Patterns

- **Controller/Resolver Separation**: Controllers handle REST; Resolvers handle GraphQL.
- **Service Isolation**: Services contain all business logic.
- **Strict DTO validation**: Use `class-validator` and `class-transformer` on all incoming payloads.
````

## File: skills/nextjs-patterns/SKILL.md
````markdown
---
name: nextjs-patterns
description: Guidelines for Next.js 16 (App Router), enforcing the Skeleton App pattern, Server Components, and @soustools/design-system-first UI development.
---

# Next.js 16 Patterns — Skeleton App Enforcement

## The Skeleton App Rule

> [!IMPORTANT]
> `apps/app` is a **routing and data orchestration layer only**. It contains:
> - `page.tsx` / `layout.tsx` / `loading.tsx` / `error.tsx` files
> - Server Component data-fetching wrappers
> - Route group configuration
>
> It does **NOT** contain: UI components, business logic, local hooks, or inline styles.
> Any such code found in `apps/app` must be **immediately refactored** into `@soustools/design-system` or `packages/`.

## Server Components — Default Mandate

- **Server Components are the default** for all pages and layouts.
- Do **not** add `"use client"` unless the component requires browser APIs, user event handlers, or WebSocket subscriptions.
- `"use client"` files must be **leaf nodes** — they must not import other `"use client"` components up the tree unless explicitly composing an interactive island.

## Data Fetching Rules

> [!CAUTION]
> **Direct client-side `supabase-js` calls in `apps/app` are STRICTLY PROHIBITED.**
>
> All data fetching must occur via one of the two approved paths:
> 1. **Next.js Server Component** — using the server-side Supabase client from `@soustools/supabase`.
> 2. **NestJS API** — via `fetch()` calls in Server Components to `apps/api` endpoints.

```tsx
// ✅ CORRECT — Server Component data fetching
import { createServerClient } from '@soustools/supabase/server';

export default async function RecipesPage() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from('recipes').select('*');
  // pass data as props to @soustools/ui components
  return <RecipeList recipes={data ?? []} />;
}
```

```tsx
// ❌ FORBIDDEN — Client-side direct Supabase fetch
'use client';
import { createBrowserClient } from '@supabase/ssr'; // DO NOT USE IN apps/app
useEffect(() => { supabase.from('recipes').select(); }, []); // BANNED
```

**Exception**: Real-time Supabase subscriptions (`supabase.channel(...)`) in a dedicated `"use client"` leaf component are the only authorized use of client-side `supabase-js` in `apps/app`. Document the exception with a comment.

## UI — Library-First Rule (`@soustools/design-system`)

> [!IMPORTANT]
> All JSX/TSX must use `@soustools/design-system` components. **No local component creation in `apps/app`.**
>
> `@soustools/ui` is **deprecated**. Do NOT import from it in new code.
>
> If a required component does not exist in `packages/design-system/src/index.ts`:
> 1. **Add it to `packages/design-system`** first.
> 2. Export it from `packages/design-system/src/index.ts`.
> 3. Then import and use it in `apps/app`.
>
> Building UI locally in `apps/app` and deferring the extraction is forbidden.

```tsx
// ✅ CORRECT
import { Button, Card, TwoToneHeader } from '@soustools/design-system';

// ❌ FORBIDDEN — deprecated package
import { Button } from '@soustools/ui'; // deprecated — move to @soustools/design-system

// ❌ FORBIDDEN — local component
import { Button } from '../../components/Button'; // local — move to @soustools/design-system
```

## `"use client"` Checklist

Before adding `"use client"` to any file, verify:

- [ ] The component requires `useState`, `useEffect`, `useRef`, or a browser API.
- [ ] OR the component handles direct user event callbacks (`onClick`, `onChange`, etc.).
- [ ] OR the component manages a real-time WebSocket/Supabase channel subscription.
- [ ] The component does **not** perform any database mutations (use Server Actions or API routes).
- [ ] The component imports its data via props, not via internal fetch calls.

## Error Boundaries & Infrastructure

- Place `error.tsx` and `global-error.tsx` in all route group roots.
- Use `loading.tsx` with `<Suspense>` boundaries around async Server Components.
- Import analytics only at layout level: `@vercel/analytics/next`, `@vercel/speed-insights/next`.

## Anti-Patterns

- **FORBIDDEN**: `useEffect` data fetching from Supabase in `apps/app`.
- **FORBIDDEN**: Local UI components defined inside `apps/app/src/components/`.
- **FORBIDDEN**: Inline `style={{}}` attributes — use `@soustools/design-system` and semantic token classes.
- **FORBIDDEN**: `"use client"` on page-level route files (`page.tsx`).
- **FORBIDDEN**: Importing from `@soustools/ui` in new code — it is deprecated.
````

## File: skills/quality-enforcement/SKILL.md
````markdown
---
name: quality-enforcement
description: Pre-commit check-style rules for LLMs that flag client-side DB mutations, enforce @soustools/design-system usage, and eradicate hacky workarounds and hydration errors.
---

# Quality Enforcement — Pre-Commit LLM Checklist

Run this checklist against every file you generate or modify **before** presenting it to the user. A single failed check is a **blocking error** — fix the violation immediately or HALT and surface it.

---

## Check 1 — `"use client"` + Database Mutation Scan

> [!CAUTION]
> **Any `"use client"` file that performs a direct database mutation is a critical violation.**

**Trigger pattern** — flag if a file contains ALL of the following:
- Line 1 is `'use client';` or `"use client";`
- AND any of: `.from(`, `.insert(`, `.update(`, `.delete(`, `.upsert(`
- AND the import source is `@supabase/`, `@soustools/supabase/browser`, or `createBrowserClient`

**Required action**: Route the mutation through a **Server Action** or a **NestJS API endpoint**. The `"use client"` component must call the server function, not the database directly.

```ts
// ❌ VIOLATION — triggers Check 1
'use client';
import { createBrowserClient } from '@soustools/supabase/browser';
const handleDelete = () => supabase.from('recipes').delete().eq('id', id);

// ✅ COMPLIANT — mutation routed to Server Action
'use client';
import { deleteRecipe } from '@/actions/recipes'; // Server Action
const handleDelete = () => deleteRecipe(id);
```

---

## Check 2 — `@soustools/design-system` Design System Compliance

> [!IMPORTANT]
> All JSX/TSX elements must come from `@soustools/design-system`. Verify against `packages/design-system/src/index.ts` exports before generating any component.
> **`@soustools/ui` is deprecated.** Any import from `@soustools/ui` in new code is a violation.

**Trigger pattern** — flag if a file in `apps/app` contains:
- A JSX element (`<Button>`, `<Card>`, `<Input>`, `<Badge>`, etc.) **not** imported from `@soustools/design-system`
- OR an import from `@soustools/ui` (deprecated package — must migrate)
- OR an import of a component from a relative path within `apps/app` (e.g., `../../components/Button`)
- OR an inline `style={{}}` prop on any element

**Required action**:
1. Check `packages/design-system/src/index.ts` — does the component exist?
   - **YES** → replace the local/relative/deprecated import with `import { ComponentName } from '@soustools/design-system'`.
   - **NO** → add it to `packages/design-system` first, export it, then import it.
2. Replace all `style={{}}` usages with semantic token CSS variables or Tailwind utility classes.

```tsx
// ❌ VIOLATION — triggers Check 2 (deprecated import + inline style)
import { Button } from '@soustools/ui'; // deprecated package
<Button style={{ color: 'red' }}>Save</Button>

// ❌ VIOLATION — triggers Check 2 (local component)
import { Button } from '../../components/Button';

// ✅ COMPLIANT
import { Button } from '@soustools/design-system';
<Button variant="destructive">Save</Button>
```

---

## Check 3 — Hydration Safety

> [!WARNING]
> Hydration mismatches are caused by server/client rendering divergence. Flag any pattern that creates server-client inconsistency.

**Trigger patterns**:
- `typeof window !== 'undefined'` checks used to conditionally render JSX (causes hydration mismatch).
- `Math.random()` or `Date.now()` called during render in a Server Component.
- `useLayoutEffect` in a file without `"use client"`.
- Dynamic class names computed from non-deterministic values at render time.

**Required action**: Wrap browser-only logic in a `useEffect` hook (client only), or use `suppressHydrationWarning` only as a last resort with a comment explaining why.

---

## Check 4 — TypeScript Strictness

**Trigger patterns** — flag any:
- `any` type (explicit or implicit via untyped function return).
- `// @ts-ignore` or `// @ts-nocheck` comments.
- `as unknown as X` double-cast patterns.
- Untyped `catch (e)` blocks — must be `catch (e: unknown)`.

**Required action**: Resolve with a proper typed interface or generated DB type from `@soustools/api-types`.

---

## Check 5 — HALT-ON-ERROR Compliance

> [!CAUTION]
> **Circular correction loops are forbidden.**
>
> If any check above triggers a violation that cannot be resolved in a single, clean edit:
> 1. **STOP generating code.**
> 2. Surface the exact violation and file location to the user.
> 3. Wait for explicit user instruction before continuing.
>
> Do **not** attempt repeated auto-corrections, workarounds, or `// @ts-ignore` hacks to "push through" an error.

---

## Quick Reference Matrix

| Check | Trigger | Action |
|---|---|---|
| 1 — Client DB Mutation | `"use client"` + `.from().insert/update/delete` | Route via Server Action / NestJS API |
| 2 — UI System | Component not from `@soustools/design-system`, import from `@soustools/ui`, or `style={{}}` | Add to `packages/design-system`, re-import |
| 3 — Hydration | `typeof window` in render, non-deterministic render values | Move to `useEffect` or SSR-safe pattern |
| 4 — TypeScript | `any`, `@ts-ignore`, double-cast | Proper types from `@soustools/api-types` |
| 5 — HALT | Unresolvable violation | STOP and surface to user |
````

## File: skills/supabase-client/SKILL.md
````markdown
---
name: supabase-client
description: Best practices for interacting with the Supabase client, enforcing server-side supremacy and strict Row Level Security (RLS) scoped to the organization.
---

# Supabase Client & Security — Server-Side Supremacy

## The Golden Rule

> [!CAUTION]
> **The Supabase client is a server-side tool.** Client-side instantiation of `supabase-js` in `apps/app` is banned except for the narrow real-time subscription exception (see below). All queries run on the server; the client receives typed props.

## Approved Client Sources

Always obtain clients from the shared `@soustools/supabase` package — never instantiate directly with `createClient()`:

```ts
// ✅ Server Component / Server Action / Route Handler
import { createServerClient } from '@soustools/supabase/server';
const supabase = createServerClient(); // reads cookies via next/headers

// ✅ NestJS service (via shared package)
import { SupabaseService } from '@soustools/supabase/nestjs';

// ❌ FORBIDDEN anywhere in apps/app (except real-time exception)
import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
```

## Real-Time Exception (Narrow & Documented)

Client-side Supabase channels are permitted **only** in a dedicated `"use client"` leaf component for live subscriptions (e.g., KDS order updates). The file must:

1. Have a JSDoc comment explaining why client-side is required.
2. Use **read-only** channel subscriptions — never `.insert()`, `.update()`, or `.delete()` from the client.
3. Import the browser client from `@soustools/supabase/browser` (not directly from `@supabase/ssr`).

## Row Level Security (RLS)

> [!IMPORTANT]
> RLS is the primary security boundary. Every query is implicitly scoped by the database policies — but the application layer must reinforce this:

- **All queries must include org scoping** where an `organization_id` FK exists.
- Do not rely solely on RLS to filter — include `eq('organization_id', orgId)` in queries as a belt-and-suspenders guard.
- **Never bypass RLS** using `service_role` keys from the frontend. The `service_role` key is backend-only (`apps/api` / server-side admin scripts).

```ts
// ✅ Belt-and-suspenders org scoping in Server Component
const { data } = await supabase
  .from('recipes')
  .select('*')
  .eq('organization_id', session.user.organizationId);

// ❌ FORBIDDEN — no org scoping, relying on RLS alone
const { data } = await supabase.from('recipes').select('*');
```

## Typing

- Use **generated database types** from `packages/api-types` — never write manual table-shape interfaces.
- Re-generate types with `supabase gen types typescript` after every migration and commit the result.

```ts
import type { Database } from '@soustools/api-types';
const supabase = createServerClient<Database>();
```

## Mutations — Server Actions & API Routes Only

> [!CAUTION]
> **Database mutations from `"use client"` components are absolutely forbidden.**
>
> All `INSERT`, `UPDATE`, `DELETE` operations must go through:
> 1. **Next.js Server Actions** (preferred for form mutations).
> 2. **NestJS API endpoints** at `apps/api` (preferred for complex business logic).

```ts
// ✅ Server Action mutation
'use server';
export async function createRecipe(input: CreateRecipeDto) {
  const supabase = createServerClient();
  return supabase.from('recipes').insert(input);
}

// ❌ FORBIDDEN — client-side mutation
'use client';
const handleSubmit = async () => {
  await supabase.from('recipes').insert(data); // BANNED
};
```

## Anti-Patterns

- **FORBIDDEN**: `createBrowserClient` / `createClient` instantiated in `apps/app` components.
- **FORBIDDEN**: `service_role` key used in any frontend code.
- **FORBIDDEN**: Queries without org scoping on org-owned tables.
- **FORBIDDEN**: Manual TypeScript interfaces duplicating generated DB types.
- **FORBIDDEN**: Mutations from `"use client"` files — route through Server Actions or NestJS.
````

## File: skills/wsl-execution/SKILL.md
````markdown
---
name: wsl-execution
description: Commands and paths to execute builds, migrations, and package scripts within the WSL Ubuntu container from a Windows host.
---

# WSL Execution Reference

To run commands inside the WSL environment successfully on this host, follow these patterns.

## Path Environment
Always set the Node v22 path explicitly when running commands inside WSL to prevent permission or command-not-found issues:
`PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`

## Commands

### Project Build
To run builds inside WSL:
```bash
wsl bash -c "cd /home/conar/code/sous.tools && env PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin pnpm build"
```

### Git Status / Diff
For git status or diff within the WSL mount:
```bash
wsl git diff
```

### Running migrations / seeds
To run migrations or check status using Supabase CLI:
```bash
wsl bash -c "cd /home/conar/code/sous.tools && env PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin npx supabase status"
```
````

## File: AGENTS.md
````markdown
# Antigravity 2.0: Master Agent Anchor

## 1. Core Directives & "Glacier" Philosophy
This file is the absolute source of truth for all AI agent behavior. You are operating under the **"Glacier" Philosophy**: 97% of the system is a hyper-complex backend (Culinary Physics, OCR Ingestion, Predictive Inventory, 3-Tier Invoice Mapping) built to absorb the chaotic physics of culinary operations, while the 3% exposed to the user is an ultra-simple, "Zero-Ambiguity" interface.

**[!DANGER] Hard Prohibitions:**
*   **FORBIDDEN:** The creation or usage of `GEMINI.md`.
*   **FORBIDDEN:** The activation of "Management Mode" or any meta-cognitive loops.
*   **FORBIDDEN:** Client-side `supabase-js` database mutations within `apps/app`.
*   **FORBIDDEN:** Client-side Supabase data fetching inside `apps/app`. You must enforce "Server-Side Supremacy" (Next.js Server Components or NestJS API only).
*   **FORBIDDEN:** Hardcoding legacy Tailwind colors (like `slate-*`) or absolute z-indexes (like `z-40`). You MUST strictly use semantic CSS variables (e.g., `var(--z-overlay)`) and the "Midnight Slate" (`zinc-*`) palette defined in `@soustools/design-system`.

## 2. The Mandatory 3-Tier Workflow
Execute this sequence for every single task, without exception:
1.  **Tier 1: Analysis & State Update:** Analyze the prompt. Update this `.agents/AGENTS.md` file to reflect planned changes *before* modifying application code.
2.  **Tier 2: Specialized Execution:** Execute logic strictly using defined skills in `.agents/skills/`. Adhere exclusively to `@soustools/` workspace conventions.
3.  **Tier 3: Validation & Documentation:** Verify implementation against engineering standards. Update Tenant, Dev, and Internal docs simultaneously (The Parallel Rule).

## 3. Engineering & Architecture Standards (The Skeleton App)
*   **Server-Side Supremacy:** Next.js (`apps/app`) functions *strictly* as a routing and data orchestration layer. Server Components are the default. Client-side data fetching is heavily restricted; use NestJS (`apps/api`) for business logic and GraphQL/REST endpoints.
*   **UI Modularity:** All UI presentation logic must utilize the `@soustools/ui` or specialized domain packages (e.g., `packages/domain-recipes`). Local UI implementations inside `apps/app` are "hacky" and strictly forbidden.
*   **Neon-Glass UI:** Implement high-contrast Dark UI with Cyan (`#00FFFF`) accents for high-heat, high-light kitchen environments. Maximize Progressive Disclosure using Framer Motion. 
*   **RLS Boundaries:** Every database table must be scoped to an `organization_id`. The admin schema and `/users` route are strictly restricted to System Superadmins.

## 4. Omni-Bar ReAct Execution & Culinary Physics
When the user issues a command via the Omni-bar or WearOS (e.g., "Record wastage: dropped one dozen eggs"), the agent must execute a Gemini ReAct Loop:
*   **Thought:** [Reasoning about the culinary physics or technical intent, such as Vendor Wars pricing or Baker's Math scaling]
*   **Action:** [Specific NestJS API tool invocation or data mutation]
*   **Observation:** [Result of the action, continuing until final response]

## 5. Operational Protocols & Safety
**[!IMPORTANT] CRITICAL: HALT-ON-ERROR RULE** 
Operational stability in a kitchen takes precedence over feature velocity. If a TypeScript, Database Migration, Runtime, or Playwright E2E error occurs, the agent MUST STOP IMMEDIATELY. Circular correction loops or automated guessing are forbidden. You must request manual intervention.

## 6. Current Phase State
*   **Phase II (Database Reset)**: Complete.
*   **Phase II (Infrastructure Purge & Oracle Cloud Docker Parity)**: Complete.
*   **Phase IV (AI Dependency Injection)**: Complete.
*   **Phase IV (Culinary Brain CLI Pipeline)**: Complete.
*   **Phase IV (Playwright Auto-Scroller Hotfix)**: Complete.
*   **Phase IV (Playwright Persistent Auth Hotfix)**: Complete.
*   **Phase IV (Playwright Stealth Bypass Hotfix)**: Complete.
*   **Phase IV (Playwright Maximum Stealth Hotfix)**: Complete.
*   **Phase IV (Firefox Stealth Pivot Hotfix)**: Complete.
*   **Phase IV (Cookie Injection Bypass Hotfix)**: Complete.
*   **Phase IV (Consumer Chrome DRM Bypass Hotfix)**: Complete.
*   **Phase IV (CDP Host Hijacking / WSL2 Proxy)**: Complete.
*   **Phase IV (2-Pass Ingestion + Stable Diffusion API)**: Complete.
*   **Phase V (Polymorphic Schema Upgrade & Copyright Summarization)**: Complete.
*   **Phase VI (Captive Portal Handshake & Legacy Purge)**: Active - Transitioning to "Chef-Proof" Smart Device Setup Protocol, deprecating manual cloud-init provisioning.
*   **Phase VI (OAuth Device Authorization)**: Active - Scaffolding backend logic for pairing codes for WearOS and RPi devices.
*   **Phase VI (WearOS Dirty Hands Voice Trigger)**: Active - Implementing Jetpack Compose voice UI, SpeechRecognizer intent, and API Handshake. Configured BuildConfig for dynamic API_URL.
*   **Phase VI (Unified AI Triggers)**: Active - Unifying WearOS and Omni-bar AI triggers into a single context-aware POST /command NestJS endpoint in apps/api.
*   **Phase VI (Interactive Omni-bar Integration)**: Active - Wiring OmniBar and GlobalAppBar to be fully interactive and context-aware, including voice dictation and floating FAB triggers.
*   **Phase VI (WearOS Complications & Tiles)**: Active - Scaffolded MainComplicationService and KitchenCommandTileService/Activity.
*   **Phase VI (WearOS Metrics Mocking)**: Active - Scaffolding real API endpoints returning mock data for WearOS complications.
*   **Phase VI (WearOS Device Pairing)**: Active - Implementing production-ready OAuth Device Flow (Pairing Codes) using DataStore for secure JWT persistence.
*   **Phase VII (Route Reorganization)**: Active - Abolishing `(dashboard)`, establishing `(workspace)` and `(fullscreen)` route groups, and standardizing sidebars with `SidebarLayout`.
*   **Phase VII (API Architecture Refactor)**: Active - Extracting UI-coupled modules into true domain entities (e.g., `devices`, `commands`).
*   **Phase VIII (Universal Zod Schemas)**: Active - Establishing foundational Zod schemas for the 3-Tier Culinary Engine (recipes, ingredients, macros, allergens) prior to building ingestion pipelines.
*   **Phase IX (Kiosk OS & Self-Hosted Runner)**: Active - Configuring pi-gen for 64-bit unattended Raspberry Pi OS with labwc and Chromium, and setting up an Oracle Cloud self-hosted GitHub Actions runner for external repository release.
````
