---
name: nextjs-patterns
description: Guidelines for Next.js 16 (App Router), enforcing the Skeleton App pattern, Server Components, and @soustools/design-system-first UI development.
---

# Next.js 16 Patterns — Skeleton App Enforcement

## The Skeleton App Rule

> [!IMPORTANT]
> `apps/app` is a **routing and data orchestration layer only**. It contains:
>
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
>
> 1. **Next.js Server Component** — using the server-side Supabase client from `@soustools/supabase`.
> 2. **NestJS API** — via `fetch()` calls in Server Components to `apps/api` endpoints.

```tsx
// ✅ CORRECT — Server Component data fetching
import { createServerClient } from "@soustools/supabase/server";

export default async function RecipesPage() {
  const supabase = createServerClient();
  const { data, error } = await supabase.from("recipes").select("*");
  // pass data as props to @soustools/ui components
  return <RecipeList recipes={data ?? []} />;
}
```

```tsx
// ❌ FORBIDDEN — Client-side direct Supabase fetch
"use client";
import { createBrowserClient } from "@supabase/ssr"; // DO NOT USE IN apps/app
useEffect(() => {
  supabase.from("recipes").select();
}, []); // BANNED
```

**Exception**: Real-time Supabase subscriptions (`supabase.channel(...)`) in a dedicated `"use client"` leaf component are the only authorized use of client-side `supabase-js` in `apps/app`. Document the exception with a comment.

## UI — Library-First Rule (`@soustools/design-system`)

> [!IMPORTANT]
> All JSX/TSX must use `@soustools/design-system` components. **No local component creation in `apps/app`.**
>
> `@soustools/ui` is **deprecated**. Do NOT import from it in new code.
>
> If a required component does not exist in `packages/design-system/src/index.ts`:
>
> 1. **Add it to `packages/design-system`** first.
> 2. Export it from `packages/design-system/src/index.ts`.
> 3. Then import and use it in `apps/app`.
>
> Building UI locally in `apps/app` and deferring the extraction is forbidden.

```tsx
// ✅ CORRECT
import { Button, Card, TwoToneHeader } from "@soustools/design-system";

// ❌ FORBIDDEN — deprecated package
import { Button } from "@soustools/ui"; // deprecated — move to @soustools/design-system

// ❌ FORBIDDEN — local component
import { Button } from "../../components/Button"; // local — move to @soustools/design-system
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
