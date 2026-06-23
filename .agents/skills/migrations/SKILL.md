---
name: migrations
description: Standards for writing PostgreSQL database migrations for Supabase, ensuring safe schemas and backward compatibility.
---

# Supabase Migration Patterns

- **Format**: File names must be structured as `YYYYMMDDNNNNNN_descriptive_name.sql`.
- **Idempotency**: Use `IF NOT EXISTS` or wrap updates in `DO $$ BEGIN IF EXISTS ... END IF; END $$;` blocks to ensure compatibility with existing schemas.
- **Single Migration rule**: Use one migration file per logical concern.
- **Grants**: Always ensure appropriate `GRANT` calls to roles (`anon`, `authenticated`, `service_role`) at the end of schema alterations.
