-- 1. Drop the existing CHECK constraint on purchase_orders.status
ALTER TABLE public.purchase_orders
DROP CONSTRAINT IF EXISTS purchase_orders_status_check;

-- 2. Add the new CHECK constraint that includes 'RECEIVED'
ALTER TABLE public.purchase_orders
ADD CONSTRAINT purchase_orders_status_check
CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECEIVED', 'RECONCILED'));

-- 3. (Optional) In case there are any cleanups or backfills needed in the future, we include the standard grants
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
