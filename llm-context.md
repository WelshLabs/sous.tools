# SOUS.TOOLS Development Context

## Zod Version Mismatches
In our monorepo setup, `@serwist/build` / `@serwist/next` (used in `apps/app`) pulls in `zod` version `4.x`. However, the frontend components (like `apps/app` and `@soustools/api-types`) depend on `zod` version `3.x` (specifically `3.25.76`).
Because `@hookform/resolvers` imports `zod` as an optional dependency, in environments with hoisting (like Vercel), it can resolve to `zod` version `4.x`, resulting in compilation type mismatches against local schemas written using `zod` version `3.x`.

To prevent this issue, we pin the `zod` version that `@hookform/resolvers` resolves to version `3.25.76` using `overrides` in `pnpm-workspace.yaml`:

```yaml
overrides:
  "@hookform/resolvers>zod": 3.25.76
```
