---
name: supabase-client
description: Best practices for interacting with the Supabase client and maintaining strict Row Level Security (RLS).
---

# Supabase Client & Security

- **Row Level Security (RLS)**: Must be enabled on all custom user tables. Define policies checking user membership through `org_members`.
- **Typing**: Use database types generated directly from the schema.
- **Client**: Leverage the shared package `@soustools/supabase` to obtain clients.
