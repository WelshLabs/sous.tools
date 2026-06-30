-- =============================================================================
-- sous.tools — Canonical Init Schema
-- Consolidated from 32 fragmented migrations (20260612–20260630).
-- All tables: RLS enabled + forced, org-scoped policies, explicit GRANTs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------------------------------------------------------------------------
-- 1. ENUMs
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE item_category AS ENUM (
    'INGREDIENT', 'PACKAGING', 'CLEANING', 'SMALLWARES', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE purchase_unit AS ENUM (
    'EACH', 'CASE', 'LB', 'KG', 'OZ', 'G', 'L', 'ML', 'GAL', 'QT'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ---------------------------------------------------------------------------
-- 2. organizations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE,
  logo_url     TEXT,
  design_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations FORCE ROW LEVEL SECURITY;
-- NOTE: organizations RLS policy is defined AFTER org_members table (section 3)
-- because the policy body references org_members which must exist first.

-- ---------------------------------------------------------------------------
-- 3. org_members + helper functions (SECURITY DEFINER — no recursion)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_org_members UNIQUE (organization_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_members FORCE ROW LEVEL SECURITY;

-- Non-recursive policies using JWT claims
DROP POLICY IF EXISTS "Members can view own org memberships non-recursive" ON org_members;
CREATE POLICY "Members can view own org memberships non-recursive"
  ON org_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    organization_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid
  );

DROP POLICY IF EXISTS "Admins can manage org memberships non-recursive" ON org_members;
CREATE POLICY "Admins can manage org memberships non-recursive"
  ON org_members FOR ALL
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid = organization_id
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid = organization_id
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON org_members TO authenticated;
GRANT ALL ON org_members TO service_role;

-- Helper functions (set row_security = off so they bypass RLS in subqueries)
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
  SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql STABLE SECURITY DEFINER
  SET search_path = public
  SET row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;

CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_role ON org_members(organization_id, role);

-- organizations policy deferred to here so org_members exists
DROP POLICY IF EXISTS "org_members_read_organizations" ON organizations;
CREATE POLICY "org_members_read_organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM org_members WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 4. integrations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS integrations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider        TEXT NOT NULL CHECK (provider IN ('SQUARE', 'GOOGLE')),
  access_token    TEXT NOT NULL,
  refresh_token   TEXT,
  expires_at      TIMESTAMP WITH TIME ZONE,
  scopes          TEXT[],
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_org_provider UNIQUE (organization_id, provider)
);

ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_integrations" ON integrations
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 5. signage_devices
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signage_devices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID REFERENCES organizations(id) ON DELETE CASCADE,  -- nullable: unpaired devices
  name             TEXT NOT NULL DEFAULT 'Unnamed Device',
  pairing_code     TEXT UNIQUE NOT NULL,
  is_paired        BOOLEAN DEFAULT false NOT NULL,
  last_seen_at     TIMESTAMP WITH TIME ZONE,
  timezone         TEXT NOT NULL DEFAULT 'UTC',
  maintenance_window JSONB NOT NULL DEFAULT '{"hour": 2, "minute": 0, "dayOfWeek": null}'::jsonb,
  operating_hours  JSONB NOT NULL DEFAULT '{"sleep_hour": 22, "sleep_minute": 0, "wake_hour": 6, "wake_minute": 0}'::jsonb,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE signage_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_devices FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_signage_devices" ON signage_devices
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 6. signage_decks
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

ALTER TABLE signage_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_decks FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_signage_decks" ON signage_decks
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_signage_decks_org ON signage_decks(organization_id);

-- ---------------------------------------------------------------------------
-- 7. signage_layouts (legacy — kept for FK compatibility)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signage_layouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('SPLIT_SCREEN', 'FULL_SCREEN_SLIDESHOW', 'GRID_MENU')),
  config          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE signage_layouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_layouts FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_signage_layouts" ON signage_layouts
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 8. signage_displays
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signage_displays (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  device_id       UUID REFERENCES signage_devices(id) ON DELETE SET NULL,
  port_label      TEXT,
  deck_id         UUID REFERENCES signage_decks(id) ON DELETE SET NULL,
  last_seen_at    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE signage_displays ENABLE ROW LEVEL SECURITY;
ALTER TABLE signage_displays FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_signage_displays" ON signage_displays
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_signage_displays_deck   ON signage_displays(deck_id);
CREATE INDEX IF NOT EXISTS idx_signage_displays_device ON signage_displays(device_id);

-- ---------------------------------------------------------------------------
-- 9. vessel_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vessel_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  shape           TEXT NOT NULL CHECK (shape IN ('ROUND', 'RECTANGULAR')),
  length          NUMERIC,
  width           NUMERIC,
  height          NUMERIC,
  diameter        NUMERIC,
  volume_ml       NUMERIC NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE vessel_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vessel_profiles FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_vessel_profiles" ON vessel_profiles
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 10. master_ingredients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS master_ingredients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  density_g_ml          NUMERIC NOT NULL DEFAULT 1.0,
  nutrition_macros      JSONB NOT NULL DEFAULT '{}'::jsonb,
  allergens             JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredient_type       TEXT CHECK (ingredient_type IN (
    'GRAIN', 'DAIRY', 'EGG', 'MEAT', 'POULTRY', 'SEAFOOD',
    'PRODUCE', 'FAT_OIL', 'SWEETENER', 'SPICE_HERB',
    'LEAVENING', 'LIQUID', 'NUT_SEED', 'LEGUME',
    'PACKAGING', 'CLEANING', 'OTHER'
  )),
  is_animal_product     BOOLEAN DEFAULT false,
  is_meat               BOOLEAN DEFAULT false,
  is_seafood            BOOLEAN DEFAULT false,
  is_dairy              BOOLEAN DEFAULT false,
  is_egg                BOOLEAN DEFAULT false,
  is_gluten_source      BOOLEAN DEFAULT false,
  fdc_id                INTEGER,
  nutrition_verified_at TIMESTAMP WITH TIME ZONE,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE master_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_ingredients FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_master_ingredients" ON master_ingredients
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 11. recipe_categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  parent_id       UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_recipe_categories_org_name UNIQUE (organization_id, name)
);

ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_categories FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipe_categories" ON recipe_categories
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 12. recipe_tags
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_tags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_recipe_tags_org_name UNIQUE (organization_id, name)
);

ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipe_tags" ON recipe_tags
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 13. recipes (all ALTER columns folded in)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipes (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  yield_count         NUMERIC NOT NULL,
  yield_unit          TEXT NOT NULL,
  vessel_id           UUID REFERENCES vessel_profiles(id) ON DELETE SET NULL,
  category_id         UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,
  instructions        JSONB NOT NULL DEFAULT '[]'::jsonb,
  status              TEXT NOT NULL DEFAULT 'APPROVED' CHECK (status IN ('PENDING_REVIEW', 'APPROVED', 'ARCHIVED')),
  source_book         TEXT,
  source_author       TEXT,
  source_page_start   INTEGER,
  source_page_end     INTEGER,
  source_document_url TEXT,
  pos_item_id         TEXT,
  cost_per_yield      NUMERIC DEFAULT 0,
  gross_margin        NUMERIC DEFAULT 0,
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

COMMENT ON COLUMN recipes.pos_item_id IS 'Links recipe to a synced POS item catalog entry';

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipes" ON recipes
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 14. recipe_ingredients (all ALTER columns folded in)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id             UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  master_ingredient_id  UUID REFERENCES master_ingredients(id) ON DELETE SET NULL,
  item_id               UUID,  -- FK added after items table below
  calculation_type      TEXT NOT NULL CHECK (calculation_type IN ('fixed_weight', 'bakers_percentage')),
  base_calculation_group BOOLEAN DEFAULT false NOT NULL,
  amount                NUMERIC NOT NULL,
  unit                  TEXT NOT NULL,
  prep_notes            TEXT,
  component             TEXT,
  raw_name              TEXT,
  created_at            TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipe_ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 15. recipe_tag_assignments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_tag_assignments (
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  tag_id    UUID NOT NULL REFERENCES recipe_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, tag_id)
);

ALTER TABLE recipe_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tag_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipe_tag_assignments" ON recipe_tag_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_tag_assignments.recipe_id
        AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_tag_assignments.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 16. formula_versions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS formula_versions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id      UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  title          TEXT NOT NULL,
  yield_count    NUMERIC NOT NULL,
  yield_unit     TEXT NOT NULL,
  vessel_id      UUID REFERENCES vessel_profiles(id) ON DELETE SET NULL,
  instructions   JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients    JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE formula_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_formula_versions" ON formula_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = formula_versions.recipe_id
        AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = formula_versions.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 17. recipe_nutrition_cache
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recipe_nutrition_cache (
  recipe_id            UUID PRIMARY KEY REFERENCES recipes(id) ON DELETE CASCADE,
  servings             NUMERIC NOT NULL DEFAULT 1,
  per_serving_nutrition JSONB NOT NULL DEFAULT '{}'::jsonb,
  per_100g_nutrition   JSONB NOT NULL DEFAULT '{}'::jsonb,
  dietary_flags        JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at          TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE recipe_nutrition_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_nutrition_cache FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_recipe_nutrition_cache" ON recipe_nutrition_cache
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition_cache.recipe_id
        AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_nutrition_cache.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 18. vendors (org-scoped: purchasing_and_whiteboard definition wins)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  order_method    TEXT NOT NULL CHECK (order_method IN ('EMAIL', 'SMS', 'MANUAL', 'email', 'text')),
  order_days      JSONB DEFAULT '[]'::jsonb,
  email           TEXT,
  phone           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_vendors" ON vendors
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 19. whiteboard_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whiteboard_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  raw_name        TEXT NOT NULL,
  is_active       BOOLEAN DEFAULT true NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE whiteboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_whiteboard_items" ON whiteboard_items
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 20. purchase_orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status          TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECONCILED')),
  order_date      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_purchase_orders" ON purchase_orders
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 21. purchase_order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id           UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  raw_name        TEXT NOT NULL,
  ordered_qty     NUMERIC NOT NULL,
  price_per_unit  NUMERIC DEFAULT 0 NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_purchase_order_items" ON purchase_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND is_org_member(po.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND is_org_member(po.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 22. pos_items
-- ---------------------------------------------------------------------------
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

ALTER TABLE pos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_items FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_items" ON pos_items
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_items_org ON pos_items(organization_id);

-- ---------------------------------------------------------------------------
-- 23. pos_modifier_groups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_modifier_groups (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_provider           TEXT NOT NULL CHECK (pos_provider IN ('SQUARE', 'TOAST', 'MANUAL')),
  external_id            TEXT,
  name                   TEXT NOT NULL,
  min_selected_modifiers INTEGER,
  max_selected_modifiers INTEGER,
  created_at             TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at             TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT unique_org_pos_modifier_group UNIQUE (organization_id, pos_provider, external_id)
);

ALTER TABLE pos_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_modifier_groups FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_modifier_groups" ON pos_modifier_groups
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_modifier_groups_org ON pos_modifier_groups(organization_id);

-- ---------------------------------------------------------------------------
-- 24. pos_modifier_options
-- ---------------------------------------------------------------------------
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

ALTER TABLE pos_modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_modifier_options FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_modifier_options" ON pos_modifier_options
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_modifier_options_group ON pos_modifier_options(modifier_group_id);

-- ---------------------------------------------------------------------------
-- 25. pos_item_modifier_groups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_item_modifier_groups (
  pos_item_id       UUID NOT NULL REFERENCES pos_items(id) ON DELETE CASCADE,
  modifier_group_id UUID NOT NULL REFERENCES pos_modifier_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (pos_item_id, modifier_group_id)
);

ALTER TABLE pos_item_modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_modifier_groups FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_item_modifier_groups" ON pos_item_modifier_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pos_items pi
      WHERE pi.id = pos_item_modifier_groups.pos_item_id
        AND is_org_member(pi.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pos_items pi
      WHERE pi.id = pos_item_modifier_groups.pos_item_id
        AND is_org_member(pi.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 26. pos_item_local_overlays
-- ---------------------------------------------------------------------------
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

ALTER TABLE pos_item_local_overlays ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_local_overlays FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_item_local_overlays" ON pos_item_local_overlays
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_item_local_overlays_item ON pos_item_local_overlays(pos_item_id);

-- ---------------------------------------------------------------------------
-- 27. pos_transactions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_transactions (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_item_id             UUID REFERENCES pos_items(id) ON DELETE SET NULL,
  quantity_sold           INTEGER NOT NULL DEFAULT 1,
  gross_revenue           NUMERIC NOT NULL,
  discount_amount         NUMERIC DEFAULT 0,
  transaction_time        TIMESTAMPTZ NOT NULL,
  source                  TEXT NOT NULL DEFAULT 'square',
  external_transaction_id TEXT,
  created_at              TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pos_ext_txn UNIQUE (external_transaction_id)
);

ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_transactions FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_transactions" ON pos_transactions
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_transactions_org_time ON pos_transactions(organization_id, transaction_time DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_item     ON pos_transactions(pos_item_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_ext_id            ON pos_transactions(external_transaction_id) WHERE external_transaction_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 28. pos_item_recipe_links
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pos_item_recipe_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_item_id      UUID NOT NULL REFERENCES pos_items(id) ON DELETE CASCADE,
  recipe_id        UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  portion_fraction NUMERIC NOT NULL DEFAULT 1.0,
  CONSTRAINT uq_pos_item_recipe UNIQUE (pos_item_id, recipe_id)
);

ALTER TABLE pos_item_recipe_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_recipe_links FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_links" ON pos_item_recipe_links
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_pos_item_recipe_links_pos    ON pos_item_recipe_links(pos_item_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_recipe_links_recipe ON pos_item_recipe_links(recipe_id);

-- ---------------------------------------------------------------------------
-- 29. items (items ledger — successor to master_ingredients for purchasing)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  category          item_category NOT NULL DEFAULT 'INGREDIENT',
  purchase_unit     purchase_unit NOT NULL DEFAULT 'LB',
  units_per_case    NUMERIC,
  each_weight_g     NUMERIC,
  density_g_ml      NUMERIC NOT NULL DEFAULT 1.0,
  shelf_life_days   INTEGER,
  is_animal_product BOOLEAN DEFAULT false,
  is_meat           BOOLEAN DEFAULT false,
  is_seafood        BOOLEAN DEFAULT false,
  is_dairy          BOOLEAN DEFAULT false,
  is_egg            BOOLEAN DEFAULT false,
  is_gluten_source  BOOLEAN DEFAULT false,
  allergens         TEXT[] DEFAULT '{}',
  fdc_id            INTEGER,
  nutrition_macros  JSONB DEFAULT '{}'::jsonb,
  current_cost_per_g NUMERIC,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE items FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_items" ON items
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_items_org       ON items(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_name_trgm ON items USING gin(name gin_trgm_ops);

-- Add FK from recipe_ingredients to items now that items exists
ALTER TABLE recipe_ingredients
  ADD CONSTRAINT fk_recipe_ingredients_item
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL
  NOT VALID;

-- ---------------------------------------------------------------------------
-- 30. price_history
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_history (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id           UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id         UUID REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  purchase_unit     purchase_unit NOT NULL,
  unit_cost         NUMERIC NOT NULL,
  effective_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  note              TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_price_history" ON price_history
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_price_history_item_date ON price_history(item_id, effective_date DESC);

-- ---------------------------------------------------------------------------
-- 31. wastage_ledger
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wastage_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  amount_g        NUMERIC NOT NULL,
  reason          TEXT,
  recorded_at     TIMESTAMPTZ DEFAULT now(),
  recorded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE wastage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE wastage_ledger FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_wastage_ledger" ON wastage_ledger
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_wastage_org_date ON wastage_ledger(organization_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_wastage_item      ON wastage_ledger(item_id);

-- ---------------------------------------------------------------------------
-- 32. inventory_on_hand
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory_on_hand (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id         UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity_g      NUMERIC NOT NULL DEFAULT 0,
  lot_number      TEXT,
  lot_expiry      DATE,
  location        TEXT,
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_inventory_item_lot UNIQUE (organization_id, item_id, lot_number)
);

ALTER TABLE inventory_on_hand ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_on_hand FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_inventory" ON inventory_on_hand
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_inventory_org_item ON inventory_on_hand(organization_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry   ON inventory_on_hand(lot_expiry ASC) WHERE lot_expiry IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 33. container_mapping
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS container_mapping (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id        UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  vessel_id        UUID NOT NULL REFERENCES vessel_profiles(id) ON DELETE CASCADE,
  target_weight_g  NUMERIC NOT NULL,
  notes            TEXT,
  CONSTRAINT uq_container_mapping UNIQUE (recipe_id, vessel_id)
);

ALTER TABLE container_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_mapping FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_container_mapping" ON container_mapping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = container_mapping.recipe_id
        AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = container_mapping.recipe_id
        AND is_org_member(r.organization_id)
    )
  );

-- ---------------------------------------------------------------------------
-- 34. par_level_suggestions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS par_level_suggestions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id          UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  suggested_par_g  NUMERIC NOT NULL,
  current_par_g    NUMERIC,
  avg_daily_usage_g NUMERIC,
  lead_time_days   NUMERIC,
  safety_factor    NUMERIC DEFAULT 1.25,
  confidence       NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  reasoning        TEXT,
  status           TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  generated_at     TIMESTAMPTZ DEFAULT now(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE par_level_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE par_level_suggestions FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_par_level_suggestions" ON par_level_suggestions
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

CREATE INDEX IF NOT EXISTS idx_par_suggestions_org_status ON par_level_suggestions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_par_suggestions_item       ON par_level_suggestions(item_id);

-- ---------------------------------------------------------------------------
-- 35. ingestion_reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ingestion_reviews (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id     UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id             UUID,
  source              TEXT NOT NULL,
  source_name         TEXT,
  source_document_url TEXT,
  raw_text            TEXT,
  parsed_data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status              TEXT NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  created_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at          TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE ingestion_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_reviews FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_ingestion_reviews" ON ingestion_reviews
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 36. vendor_item_aliases
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_item_aliases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id  UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id        TEXT NOT NULL,
  vendor_item_name TEXT NOT NULL,
  internal_item_id UUID,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE vendor_item_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_item_aliases FORCE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_vendor_item_aliases" ON vendor_item_aliases
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ---------------------------------------------------------------------------
-- 37. notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  link            TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

-- Notifications are user-scoped (not org-scoped via helper functions)
CREATE POLICY "user_read_own_notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "user_update_own_notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "service_role_manage_notifications" ON notifications
  FOR ALL TO service_role USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ---------------------------------------------------------------------------
-- 38. processed_webhook_events (service_role only — backend idempotency)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processed_webhook_events (
  event_id   TEXT PRIMARY KEY,
  provider   TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE processed_webhook_events FORCE ROW LEVEL SECURITY;

-- Admin exception: service_role only
CREATE POLICY "service_role_manage_webhook_events" ON processed_webhook_events
  FOR ALL TO service_role USING (true);

REVOKE ALL ON processed_webhook_events FROM authenticated;

-- ---------------------------------------------------------------------------
-- 39. user_profiles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_profiles_self_or_org_admin" ON user_profiles;
CREATE POLICY "user_profiles_self_or_org_admin" ON user_profiles
  FOR ALL
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM org_members caller
      WHERE caller.user_id = auth.uid() AND caller.role = 'admin'
      AND EXISTS (
        SELECT 1 FROM org_members target
        WHERE target.user_id = user_profiles.user_id
        AND target.organization_id = caller.organization_id
      )
    )
  )
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM org_members caller
      WHERE caller.user_id = auth.uid() AND caller.role = 'admin'
      AND EXISTS (
        SELECT 1 FROM org_members target
        WHERE target.user_id = user_profiles.user_id
        AND target.organization_id = caller.organization_id
      )
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);

-- ---------------------------------------------------------------------------
-- 40. Triggers
-- ---------------------------------------------------------------------------

-- update_item_current_cost: recalculates cost/g when a price_history row is inserted
CREATE OR REPLACE FUNCTION update_item_current_cost()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  grams_per_unit     NUMERIC;
  item_density       NUMERIC;
  item_each_weight   NUMERIC;
  item_units_per_case NUMERIC;
BEGIN
  SELECT density_g_ml, each_weight_g, units_per_case
  INTO item_density, item_each_weight, item_units_per_case
  FROM items WHERE id = NEW.item_id;

  grams_per_unit := CASE NEW.purchase_unit::TEXT
    WHEN 'LB'   THEN 453.59237
    WHEN 'KG'   THEN 1000.0
    WHEN 'OZ'   THEN 28.349523
    WHEN 'G'    THEN 1.0
    WHEN 'GAL'  THEN 3785.41 * COALESCE(item_density, 1.0)
    WHEN 'QT'   THEN 946.353 * COALESCE(item_density, 1.0)
    WHEN 'L'    THEN 1000.0  * COALESCE(item_density, 1.0)
    WHEN 'ML'   THEN 1.0     * COALESCE(item_density, 1.0)
    WHEN 'EACH' THEN COALESCE(item_each_weight, 1.0)
    WHEN 'CASE' THEN COALESCE(item_each_weight, 1.0) * COALESCE(item_units_per_case, 1.0)
    ELSE 1.0
  END;

  UPDATE items
  SET current_cost_per_g = NEW.unit_cost / NULLIF(grams_per_unit, 0),
      updated_at = now()
  WHERE id = NEW.item_id;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_price_history_cost_rollup
  AFTER INSERT ON price_history
  FOR EACH ROW EXECUTE FUNCTION update_item_current_cost();

-- handle_updated_at: generic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Apply updated_at trigger to vendors
DROP TRIGGER IF EXISTS set_vendors_updated_at ON vendors;
CREATE TRIGGER set_vendors_updated_at
  BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- 41. Views
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW sales_velocity_7d AS
SELECT
  pos_item_id,
  organization_id,
  SUM(quantity_sold) AS units_7d,
  SUM(gross_revenue) AS revenue_7d
FROM pos_transactions
WHERE transaction_time >= NOW() - INTERVAL '7 days'
GROUP BY pos_item_id, organization_id;

CREATE OR REPLACE VIEW sales_velocity_30d AS
SELECT
  pos_item_id,
  organization_id,
  SUM(quantity_sold) AS units_30d,
  SUM(gross_revenue) AS revenue_30d
FROM pos_transactions
WHERE transaction_time >= NOW() - INTERVAL '30 days'
GROUP BY pos_item_id, organization_id;

-- ---------------------------------------------------------------------------
-- 42. Storage buckets
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ingestion-sources',
  'ingestion-sources',
  true,
  52428800,
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
) ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Anyone can read ingestion sources" ON storage.objects;
CREATE POLICY "Anyone can read ingestion sources"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'ingestion-sources');

DROP POLICY IF EXISTS "Org members can upload ingestion sources" ON storage.objects;
CREATE POLICY "Org members can upload ingestion sources"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'ingestion-sources');

DROP POLICY IF EXISTS "Service role can manage ingestion sources" ON storage.objects;
CREATE POLICY "Service role can manage ingestion sources"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'ingestion-sources');

-- ---------------------------------------------------------------------------
-- 43. GRANT block (all at bottom — migrations skill mandate)
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- Views
GRANT SELECT ON sales_velocity_7d  TO anon, authenticated, service_role;
GRANT SELECT ON sales_velocity_30d TO anon, authenticated, service_role;

-- Explicit grants for tables that need special treatment
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT ALL ON notifications TO service_role;

-- processed_webhook_events: service_role only (admin exception)
GRANT ALL ON processed_webhook_events TO service_role;

-- Helper functions
GRANT EXECUTE ON FUNCTION is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_item_current_cost() TO service_role;

-- ---------------------------------------------------------------------------
-- 44. ALTER DEFAULT PRIVILEGES (future tables get same grants automatically)
-- ---------------------------------------------------------------------------
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO authenticated, service_role;
