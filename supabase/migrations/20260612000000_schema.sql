-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table if it does not exist (for local testing/seeding reference)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Signage Layouts Table
CREATE TABLE IF NOT EXISTS signage_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SPLIT_SCREEN', 'FULL_SCREEN_SLIDESHOW', 'GRID_MENU')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Signage Displays Table
CREATE TABLE IF NOT EXISTS signage_displays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout_id UUID REFERENCES signage_layouts(id) ON DELETE SET NULL,
  pairing_code TEXT UNIQUE,
  is_paired BOOLEAN DEFAULT false NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Square Items Table (Mock POS Items)
CREATE TABLE IF NOT EXISTS square_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  square_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url TEXT,
  is_sold_out BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_org_square_item UNIQUE (organization_id, square_id)
);

-- RLS (Row Level Security) Policies
ALTER TABLE signage_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE square_items ENABLE ROW LEVEL SECURITY;

-- Layouts policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_layouts;
CREATE POLICY "Enable read access for all organization members" ON signage_layouts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_layouts;
CREATE POLICY "Enable write access for organization admins" ON signage_layouts
  FOR ALL USING (true);

-- Displays policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_displays;
CREATE POLICY "Enable read access for all organization members" ON signage_displays
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_displays;
CREATE POLICY "Enable write access for organization admins" ON signage_displays
  FOR ALL USING (true);

-- Square items policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON square_items;
CREATE POLICY "Enable read access for all organization members" ON square_items
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for organization admins" ON square_items;
CREATE POLICY "Enable write access for organization admins" ON square_items
  FOR ALL USING (true);

-- Vessel Profiles Table
CREATE TABLE IF NOT EXISTS vessel_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  shape TEXT NOT NULL CHECK (shape IN ('ROUND', 'RECTANGULAR')),
  length NUMERIC,
  width NUMERIC,
  height NUMERIC,
  diameter NUMERIC,
  volume_ml NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Master Ingredients Table
CREATE TABLE IF NOT EXISTS master_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  density_g_ml NUMERIC NOT NULL DEFAULT 1.0,
  nutrition_macros JSONB NOT NULL DEFAULT '{}'::jsonb,
  allergens JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recipes Table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  yield_count NUMERIC NOT NULL,
  yield_unit TEXT NOT NULL,
  vessel_id UUID REFERENCES vessel_profiles(id) ON DELETE SET NULL,
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Recipe Ingredients Table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  master_ingredient_id UUID REFERENCES master_ingredients(id) ON DELETE SET NULL,
  calculation_type TEXT NOT NULL CHECK (calculation_type IN ('fixed_weight', 'bakers_percentage')),
  base_calculation_group BOOLEAN DEFAULT false NOT NULL,
  amount NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  prep_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for new tables
ALTER TABLE vessel_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

-- Vessel profiles policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON vessel_profiles;
CREATE POLICY "Enable read access for all organization members" ON vessel_profiles
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON vessel_profiles;
CREATE POLICY "Enable write access for organization admins" ON vessel_profiles
  FOR ALL USING (true);

-- Master ingredients policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON master_ingredients;
CREATE POLICY "Enable read access for all organization members" ON master_ingredients
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON master_ingredients;
CREATE POLICY "Enable write access for organization admins" ON master_ingredients
  FOR ALL USING (true);

-- Recipes policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipes;
CREATE POLICY "Enable read access for all organization members" ON recipes
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipes;
CREATE POLICY "Enable write access for organization admins" ON recipes
  FOR ALL USING (true);

-- Recipe ingredients policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_ingredients;
CREATE POLICY "Enable read access for all organization members" ON recipe_ingredients
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_ingredients;
CREATE POLICY "Enable write access for organization admins" ON recipe_ingredients
  FOR ALL USING (true);
