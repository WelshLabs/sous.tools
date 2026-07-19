-- Enable pg_net extension
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create generic trigger function to sync to Neo4j
CREATE OR REPLACE FUNCTION public.handle_neo4j_sync()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
  res_id BIGINT;
BEGIN
  -- Construct the payload
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    'old_record', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END
  );

  -- Perform the http post call via pg_net asynchronously
  SELECT net.http_post(
    url := 'http://api:3001/webhooks/neo4j-sync',
    body := payload,
    headers := '{"Content-Type": "application/json", "x-supabase-signature": "sous-tools-neo4j-sync-secret-key"}'::jsonb
  ) INTO res_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_sync ON auth.users;
DROP TRIGGER IF EXISTS on_recipe_sync ON public.recipes;

-- Register trigger on auth.users (in the auth schema)
CREATE TRIGGER on_auth_user_sync
  AFTER INSERT OR UPDATE OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

-- Register trigger on public.recipes (in the public schema)
CREATE TRIGGER on_recipe_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();
