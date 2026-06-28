-- Grant permissions for items ledger tables since they were missing in the original migration
GRANT SELECT, INSERT, UPDATE, DELETE ON items TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON price_history TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON wastage_ledger TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON inventory_on_hand TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON container_mapping TO anon, authenticated, service_role;

-- Ensure raw_name is present in recipe_ingredients to store unmapped item names
ALTER TABLE public.recipe_ingredients ADD COLUMN IF NOT EXISTS raw_name text;
