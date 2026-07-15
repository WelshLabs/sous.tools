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
import { createServerClient } from "@soustools/supabase/server";
const supabase = createServerClient(); // reads cookies via next/headers

// ✅ NestJS service (via shared package)
import { SupabaseService } from "@soustools/supabase/nestjs";

// ❌ FORBIDDEN anywhere in apps/app (except real-time exception)
import { createBrowserClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
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
  .from("recipes")
  .select("*")
  .eq("organization_id", session.user.organizationId);

// ❌ FORBIDDEN — no org scoping, relying on RLS alone
const { data } = await supabase.from("recipes").select("*");
```

## Typing

- Use **generated database types** from `packages/api-types` — never write manual table-shape interfaces.
- Re-generate types with `supabase gen types typescript` after every migration and commit the result.

```ts
import type { Database } from "@soustools/api-types";
const supabase = createServerClient<Database>();
```

## Mutations — Server Actions & API Routes Only

> [!CAUTION]
> **Database mutations from `"use client"` components are absolutely forbidden.**
>
> All `INSERT`, `UPDATE`, `DELETE` operations must go through:
>
> 1. **Next.js Server Actions** (preferred for form mutations).
> 2. **NestJS API endpoints** at `apps/api` (preferred for complex business logic).

```ts
// ✅ Server Action mutation
"use server";
export async function createRecipe(input: CreateRecipeDto) {
  const supabase = createServerClient();
  return supabase.from("recipes").insert(input);
}

// ❌ FORBIDDEN — client-side mutation
("use client");
const handleSubmit = async () => {
  await supabase.from("recipes").insert(data); // BANNED
};
```

## Anti-Patterns

- **FORBIDDEN**: `createBrowserClient` / `createClient` instantiated in `apps/app` components.
- **FORBIDDEN**: `service_role` key used in any frontend code.
- **FORBIDDEN**: Queries without org scoping on org-owned tables.
- **FORBIDDEN**: Manual TypeScript interfaces duplicating generated DB types.
- **FORBIDDEN**: Mutations from `"use client"` files — route through Server Actions or NestJS.
