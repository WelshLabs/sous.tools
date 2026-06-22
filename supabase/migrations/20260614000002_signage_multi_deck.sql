-- =============================================================================
-- Migration: signage_multi_deck
-- Introduces signage_devices + signage_decks; migrates signage_displays.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Create signage_devices table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signage_devices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL DEFAULT 'Unnamed Device',
  pairing_code   TEXT UNIQUE NOT NULL,
  is_paired      BOOLEAN DEFAULT false NOT NULL,
  last_seen_at   TIMESTAMP WITH TIME ZONE,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. Create signage_decks table
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signage_decks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL DEFAULT 'New Deck',
  slug            TEXT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_signage_decks_org_slug UNIQUE (organization_id, slug)
);

-- ---------------------------------------------------------------------------
-- 3. Migrate existing signage_layouts → signage_decks
-- ---------------------------------------------------------------------------
INSERT INTO signage_decks (id, organization_id, name, slug, config, created_at, updated_at)
SELECT
  id,
  organization_id,
  name,
  lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')),
  config,
  created_at,
  updated_at
FROM signage_layouts
ON CONFLICT (organization_id, slug) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 4. Alter signage_displays — add new columns, migrate data, drop old columns
-- ---------------------------------------------------------------------------
ALTER TABLE signage_displays
  ADD COLUMN IF NOT EXISTS device_id UUID REFERENCES signage_devices(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS port_label TEXT,
  ADD COLUMN IF NOT EXISTS deck_id UUID REFERENCES signage_decks(id) ON DELETE SET NULL;

-- Migrate existing layout_id → deck_id
UPDATE signage_displays SET deck_id = layout_id WHERE layout_id IS NOT NULL;

-- Drop old columns (after data migration)
ALTER TABLE signage_displays
  DROP COLUMN IF EXISTS layout_id,
  DROP COLUMN IF EXISTS pairing_code,
  DROP COLUMN IF EXISTS is_paired;

-- ---------------------------------------------------------------------------
-- 5. RLS Policies for new tables
-- ---------------------------------------------------------------------------
ALTER TABLE signage_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_decks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_devices;
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_devices;
CREATE POLICY "Enable read access for all organization members" ON signage_devices
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_devices;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_devices;
CREATE POLICY "Enable write access for organization admins" ON signage_devices
  FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_decks;
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_decks;
CREATE POLICY "Enable read access for all organization members" ON signage_decks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_decks;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_decks;
CREATE POLICY "Enable write access for organization admins" ON signage_decks
  FOR ALL USING (true);

-- ---------------------------------------------------------------------------
-- 5b. Grant API permissions on all public schema entities
-- ---------------------------------------------------------------------------
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 6. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_signage_decks_org     ON signage_decks(organization_id);
CREATE INDEX IF NOT EXISTS idx_signage_displays_deck  ON signage_displays(deck_id);
CREATE INDEX IF NOT EXISTS idx_signage_displays_device ON signage_displays(device_id);
