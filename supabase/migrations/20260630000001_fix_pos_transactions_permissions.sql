-- Grant permissions for pos_transactions tables since they were missing in the original migration
GRANT SELECT, INSERT, UPDATE, DELETE ON pos_transactions TO anon, authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON pos_item_recipe_links TO anon, authenticated, service_role;
GRANT SELECT ON sales_velocity_7d TO anon, authenticated, service_role;
GRANT SELECT ON sales_velocity_30d TO anon, authenticated, service_role;
