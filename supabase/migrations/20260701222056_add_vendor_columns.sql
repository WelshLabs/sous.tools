-- Alter public.vendors table to add customer_account_number, terms, route, and sales_rep columns.
ALTER TABLE public.vendors 
  ADD COLUMN IF NOT EXISTS customer_account_number TEXT,
  ADD COLUMN IF NOT EXISTS terms TEXT,
  ADD COLUMN IF NOT EXISTS route TEXT,
  ADD COLUMN IF NOT EXISTS sales_rep TEXT;

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
