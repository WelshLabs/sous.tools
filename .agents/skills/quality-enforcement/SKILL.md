---
name: quality-enforcement
description: Pre-commit check-style rules for LLMs that flag client-side DB mutations, enforce @soustools/ui design system usage, and eradicate hacky workarounds and hydration errors.
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

## Check 2 — `@soustools/ui` Design System Compliance

> [!IMPORTANT]
> All JSX/TSX elements must come from `@soustools/ui`. Verify against `packages/ui/src/index.ts` exports before generating any component.

**Trigger pattern** — flag if a file in `apps/app` contains:
- A JSX element (`<Button>`, `<Card>`, `<Input>`, `<Badge>`, etc.) **not** imported from `@soustools/ui`
- OR an import of a component from a relative path within `apps/app` (e.g., `../../components/Button`)
- OR an inline `style={{}}` prop on any element

**Required action**:
1. Check `packages/ui/src/index.ts` — does the component exist?
   - **YES** → replace the local/relative import with `import { ComponentName } from '@soustools/ui'`.
   - **NO** → add it to `packages/ui` first, export it, then import it.
2. Replace all `style={{}}` usages with Tailwind utility classes or `oklch` CSS variables.

```tsx
// ❌ VIOLATION — triggers Check 2 (local component + inline style)
import { Button } from '../../components/Button';
<Button style={{ color: 'red' }}>Save</Button>

// ✅ COMPLIANT
import { Button } from '@soustools/ui';
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

## Check 5 — 150-Line Hard Limit

**Trigger**: Any `.ts` or `.tsx` file exceeding 150 lines.

**Required action**: Split the file. Common extraction targets:
- Helper functions → `lib/` within the relevant package.
- Sub-components → new files in `packages/ui/src/components/`.
- Business logic → `packages/` shared module or `apps/api` service.

---

## Check 6 — HALT-ON-ERROR Compliance

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
| 2 — UI System | Component not from `@soustools/ui` or `style={{}}` | Add to `packages/ui`, re-import |
| 3 — Hydration | `typeof window` in render, non-deterministic render values | Move to `useEffect` or SSR-safe pattern |
| 4 — TypeScript | `any`, `@ts-ignore`, double-cast | Proper types from `@soustools/api-types` |
| 5 — 150-Line Limit | File > 150 lines | Extract to `packages/` or `@soustools/ui` |
| 6 — HALT | Unresolvable violation | STOP and surface to user |
