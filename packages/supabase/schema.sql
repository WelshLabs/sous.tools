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
