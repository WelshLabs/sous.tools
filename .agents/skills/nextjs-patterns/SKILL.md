---
name: nextjs-patterns
description: Guidelines for Next.js (App Router), data fetching, Server Components, and client interaction.
---

# Next.js Patterns

- **Server Components**: Keep routes as Server Components by default to allow backend-first data fetching.
- **Client Components**: Keep leaf nodes requiring interactivity or WebSockets thin and mark them with `"use client"`.
- **Imports**: Import `@vercel/analytics/next` and `@vercel/speed-insights/next` as specified by Vercel App Router docs.
- **Error Boundaries**: Place robust error handlers (`error.tsx`, `global-error.tsx`) in all UI app folders.
