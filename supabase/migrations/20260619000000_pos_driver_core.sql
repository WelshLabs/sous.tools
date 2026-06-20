-- =============================================================================
-- Migration: pos_driver_core
-- Drops square_items; creates pos_items, pos_modifier_groups, 
-- pos_modifier_options, pos_item_modifier_groups, and pos_item_local_overlays.
-- =============================================================================

-- 1. Drop square_items table
DROP TABLE IF EXISTS square_items CASCADE;

-- 2. Create pos_items table
CREATE TABLE IF NOT EXISTS pos_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_provider    TEXT NOT NULL CHECK (pos_provider IN ('SQUARE', 'TOAST', 'MANUAL')),
  external_id     TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  image_url       TEXT,
  is_sold_out     BOOLEAN DEFAULT false NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_org_pos_item UNIQUE (organization_id, pos_provider, external_id)
);

-- 3. Create pos_modifier_groups table
CREATE TABLE IF NOT EXISTS pos_modifier_groups (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_provider            TEXT NOT NULL CHECK (pos_provider IN ('SQUARE', 'TOAST', 'MANUAL')),
  external_id             TEXT,
  name                    TEXT NOT NULL,
  min_selected_modifiers  INTEGER,
  max_selected_modifiers  INTEGER,
  created_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at              TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_org_pos_modifier_group UNIQUE (organization_id, pos_provider, external_id)
);

-- 4. Create pos_modifier_options table
CREATE TABLE IF NOT EXISTS pos_modifier_options (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES pos_modifier_groups(id) ON DELETE CASCADE,
  pos_provider      TEXT NOT NULL CHECK (pos_provider IN ('SQUARE', 'TOAST', 'MANUAL')),
  external_id       TEXT,
  name              TEXT NOT NULL,
  price             NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  is_sold_out       BOOLEAN DEFAULT false NOT NULL,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at        TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_org_pos_modifier_option UNIQUE (organization_id, pos_provider, external_id)
);

-- 5. Create pos_item_modifier_groups join table
CREATE TABLE IF NOT EXISTS pos_item_modifier_groups (
  pos_item_id       UUID NOT NULL REFERENCES pos_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES pos_modifier_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (pos_item_id, modifier_group_id)
);

-- 6. Create pos_item_local_overlays table
CREATE TABLE IF NOT EXISTS pos_item_local_overlays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_item_id     UUID NOT NULL UNIQUE REFERENCES pos_items(id) ON DELETE CASCADE,
  name            TEXT,
  description     TEXT,
  price           NUMERIC(10,2),
  is_sold_out     BOOLEAN,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 7. RLS Policies
ALTER TABLE pos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_local_overlays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all organization members" ON pos_items FOR SELECT USING (true);
CREATE POLICY "Enable read access for all organization members" ON pos_modifier_groups FOR SELECT USING (true);
CREATE POLICY "Enable read access for all organization members" ON pos_modifier_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all organization members" ON pos_item_modifier_groups FOR SELECT USING (true);
CREATE POLICY "Enable read access for all organization members" ON pos_item_local_overlays FOR SELECT USING (true);

CREATE POLICY "Enable write access for organization admins" ON pos_items FOR ALL USING (true);
CREATE POLICY "Enable write access for organization admins" ON pos_modifier_groups FOR ALL USING (true);
CREATE POLICY "Enable write access for organization admins" ON pos_modifier_options FOR ALL USING (true);
CREATE POLICY "Enable write access for organization admins" ON pos_item_modifier_groups FOR ALL USING (true);
CREATE POLICY "Enable write access for organization admins" ON pos_item_local_overlays FOR ALL USING (true);

-- 8. Grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 9. Indexes
CREATE INDEX IF NOT EXISTS idx_pos_items_org ON pos_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_pos_modifier_groups_org ON pos_modifier_groups(organization_id);
CREATE INDEX IF NOT EXISTS idx_pos_modifier_options_group ON pos_modifier_options(modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_local_overlays_item ON pos_item_local_overlays(pos_item_id);
