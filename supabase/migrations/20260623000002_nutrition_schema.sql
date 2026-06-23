-- ============================================================
-- Phase 2E: Nutrition Schema Migration
-- Expands master_ingredients with dietary flags and fdc_id.
-- Creates recipe_nutrition_cache for precomputed nutrition.
-- ============================================================

ALTER TABLE master_ingredients
  ADD COLUMN IF NOT EXISTS ingredient_type TEXT
    CHECK (ingredient_type IN (
      'GRAIN', 'DAIRY', 'EGG', 'MEAT', 'POULTRY', 'SEAFOOD',
      'PRODUCE', 'FAT_OIL', 'SWEETENER', 'SPICE_HERB',
      'LEAVENING', 'LIQUID', 'NUT_SEED', 'LEGUME',
      'PACKAGING', 'CLEANING', 'OTHER'
    )),
  ADD COLUMN IF NOT EXISTS is_animal_product BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_meat BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_seafood BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_dairy BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_egg BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_gluten_source BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS fdc_id INTEGER,
  ADD COLUMN IF NOT EXISTS nutrition_verified_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS recipe_nutrition_cache (
  recipe_id UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  servings NUMERIC NOT NULL DEFAULT 1,
  per_serving_nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
  per_100g_nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
  dietary_flags JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on recipe_nutrition_cache
ALTER TABLE recipe_nutrition_cache ENABLE ROW LEVEL SECURITY;

-- Route RLS through recipes table
CREATE POLICY "org_members_read_recipe_nutrition_cache" ON recipe_nutrition_cache
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition_cache.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

CREATE POLICY "org_admins_write_recipe_nutrition_cache" ON recipe_nutrition_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition_cache.recipe_id
        AND is_org_admin(r.organization_id)
    )
  );
