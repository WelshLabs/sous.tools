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
