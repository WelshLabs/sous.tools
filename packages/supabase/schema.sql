-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table if it does not exist (for local testing/seeding reference)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed Dtown Cafe organization
INSERT INTO organizations (id, name)
VALUES ('d0000000-0000-0000-0000-000000000000', 'Dtown Cafe')
ON CONFLICT (id) DO NOTHING;

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
CREATE POLICY "Enable read access for all organization members" ON signage_layouts
  FOR SELECT USING (true);

CREATE POLICY "Enable write access for organization admins" ON signage_layouts
  FOR ALL USING (true);

-- Displays policies
CREATE POLICY "Enable read access for all organization members" ON signage_displays
  FOR SELECT USING (true);

CREATE POLICY "Enable write access for organization admins" ON signage_displays
  FOR ALL USING (true);

-- Square items policies
CREATE POLICY "Enable read access for all organization members" ON square_items
  FOR SELECT USING (true);

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
  sub_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
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
CREATE POLICY "Enable read access for all organization members" ON vessel_profiles
  FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON vessel_profiles
  FOR ALL USING (true);

-- Master ingredients policies
CREATE POLICY "Enable read access for all organization members" ON master_ingredients
  FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON master_ingredients
  FOR ALL USING (true);

-- Recipes policies
CREATE POLICY "Enable read access for all organization members" ON recipes
  FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON recipes
  FOR ALL USING (true);

-- Recipe ingredients policies
CREATE POLICY "Enable read access for all organization members" ON recipe_ingredients
  FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON recipe_ingredients
  FOR ALL USING (true);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ingestion Reviews Table
CREATE TABLE IF NOT EXISTS ingestion_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID,
  source TEXT NOT NULL,
  raw_text TEXT,
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Vendor Item Aliases Table
CREATE TABLE IF NOT EXISTS vendor_item_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  vendor_item_name TEXT NOT NULL,
  internal_item_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_item_aliases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all organization members" ON notifications FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON notifications FOR ALL USING (true);
CREATE POLICY "Enable read access for all organization members" ON ingestion_reviews FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON ingestion_reviews FOR ALL USING (true);
CREATE POLICY "Enable read access for all organization members" ON vendor_item_aliases FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON vendor_item_aliases FOR ALL USING (true);

-- Seed Sample Vessel Profiles
INSERT INTO vessel_profiles (id, organization_id, name, shape, length, width, height, diameter, volume_ml)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', '9" Pullman Pan', 'RECTANGULAR', 23, 10, 10, NULL, 2300),
  ('c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', '13" Pullman Pan', 'RECTANGULAR', 33, 10, 10, NULL, 3300),
  ('c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', '9" Round Cake Pan', 'ROUND', NULL, NULL, 5, 23, 2077)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Master Ingredients
INSERT INTO master_ingredients (id, organization_id, name, density_g_ml, nutrition_macros, allergens)
VALUES
  ('i0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000000', 'Bread Flour', 0.57, '{"calories": 364, "proteinG": 12, "carbsG": 76, "fatG": 1.5}'::jsonb, '["wheat"]'::jsonb),
  ('i0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000000', 'Water', 1.0, '{"calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('i0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000000', 'Active Dry Yeast', 0.79, '{"calories": 325, "proteinG": 40, "carbsG": 41, "fatG": 7}'::jsonb, '[]'::jsonb),
  ('i0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000000', 'Fine Sea Salt', 1.2, '{"calories": 0, "proteinG": 0, "carbsG": 0, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('i0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000000', 'Unsalted Butter', 0.96, '{"calories": 717, "proteinG": 0.9, "carbsG": 0.1, "fatG": 81}'::jsonb, '["dairy"]'::jsonb),
  ('i0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000000', 'Whole Milk', 1.03, '{"calories": 61, "proteinG": 3.2, "carbsG": 4.8, "fatG": 3.3}'::jsonb, '["dairy"]'::jsonb),
  ('i0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000000', 'Granulated Sugar', 0.84, '{"calories": 387, "proteinG": 0, "carbsG": 100, "fatG": 0}'::jsonb, '[]'::jsonb),
  ('i0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000000', 'Whole Egg', 1.02, '{"calories": 143, "proteinG": 12.6, "carbsG": 0.7, "fatG": 9.5}'::jsonb, '["egg"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
-- Vendors Table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_method TEXT NOT NULL CHECK (order_method IN ('EMAIL', 'SMS', 'MANUAL')),
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Whiteboard Items Table
CREATE TABLE IF NOT EXISTS whiteboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECONCILED')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  ordered_qty NUMERIC NOT NULL,
  price_per_unit NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all organization members" ON vendors FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON vendors FOR ALL USING (true);

CREATE POLICY "Enable read access for all organization members" ON whiteboard_items FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON whiteboard_items FOR ALL USING (true);

CREATE POLICY "Enable read access for all organization members" ON purchase_orders FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON purchase_orders FOR ALL USING (true);

CREATE POLICY "Enable read access for all organization members" ON purchase_order_items FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON purchase_order_items FOR ALL USING (true);

-- Seed Sample Vendors
INSERT INTO vendors (id, organization_id, name, order_method, email, phone)
VALUES
  ('c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000000', 'US Foods', 'EMAIL', 'orders@usfoods.com', NULL),
  ('c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000000', 'Local Produce Market', 'MANUAL', NULL, '555-0123')
ON CONFLICT (id) DO NOTHING;
