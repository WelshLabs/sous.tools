-- =============================================================================
-- Migration: device_operating_hours_and_recipe_categorization
-- Introduces operating_hours on signage_devices, and the recipe categorization
-- schema (tags, categories, versions, status, and source tracking).
-- =============================================================================

-- 1. Add operating_hours to signage_devices
ALTER TABLE signage_devices
  ADD COLUMN IF NOT EXISTS operating_hours JSONB NOT NULL DEFAULT '{"sleep_hour": 22, "sleep_minute": 0, "wake_hour": 6, "wake_minute": 0}'::jsonb;

-- 2. Create recipe_categories table
CREATE TABLE IF NOT EXISTS recipe_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  parent_id       UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_recipe_categories_org_name UNIQUE (organization_id, name)
);

-- 3. Alter recipes table to add categorization, status and source tracking
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING_REVIEW' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'ARCHIVED')),
  ADD COLUMN IF NOT EXISTS source_book TEXT,
  ADD COLUMN IF NOT EXISTS source_author TEXT,
  ADD COLUMN IF NOT EXISTS source_page_start INTEGER,
  ADD COLUMN IF NOT EXISTS source_page_end INTEGER;

-- 4. Create recipe_tags table
CREATE TABLE IF NOT EXISTS recipe_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_recipe_tags_org_name UNIQUE (organization_id, name)
);

-- 5. Create recipe_tag_assignments junction table
CREATE TABLE IF NOT EXISTS recipe_tag_assignments (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

-- 6. Create formula_versions table for immutable version history
CREATE TABLE IF NOT EXISTS formula_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id       UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  title           TEXT NOT NULL,
  yield_count     NUMERIC NOT NULL,
  yield_unit      TEXT NOT NULL,
  vessel_id       UUID REFERENCES vessel_profiles(id) ON DELETE SET NULL,
  instructions    JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients     JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSONB snapshot of ingredients
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Enable RLS
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_versions ENABLE ROW LEVEL SECURITY;

-- 8. Policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_categories;
CREATE POLICY "Enable read access for all organization members" ON recipe_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_categories;
CREATE POLICY "Enable write access for organization admins" ON recipe_categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_tags;
CREATE POLICY "Enable read access for all organization members" ON recipe_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_tags;
CREATE POLICY "Enable write access for organization admins" ON recipe_tags FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_tag_assignments;
CREATE POLICY "Enable read access for all organization members" ON recipe_tag_assignments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_tag_assignments;
CREATE POLICY "Enable write access for organization admins" ON recipe_tag_assignments FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON formula_versions;
CREATE POLICY "Enable read access for all organization members" ON formula_versions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON formula_versions;
CREATE POLICY "Enable write access for organization admins" ON formula_versions FOR ALL USING (true);

-- 9. Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
