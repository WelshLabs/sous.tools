-- ============================================================
-- Phase 2D: RLS Policy Tightening
-- Introduces org_members table + helper functions, then
-- replaces every USING (true) policy with tenant-scoped guards.
-- ============================================================

-- 1. Org membership table -------------------------------------------------------
CREATE TABLE IF NOT EXISTS org_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  CONSTRAINT uq_org_members UNIQUE (organization_id, user_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own org memberships" ON org_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage org memberships" ON org_members
  FOR ALL
  USING (is_org_admin(organization_id))
  WITH CHECK (is_org_admin(organization_id));

GRANT SELECT, INSERT, UPDATE, DELETE ON org_members TO authenticated;
GRANT ALL ON org_members TO service_role;

-- 2. Helper functions (SECURITY DEFINER for safe subquery use) ------------------
CREATE OR REPLACE FUNCTION is_org_member(org_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION is_org_admin(org_id UUID)
  RETURNS BOOLEAN
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path = public, row_security = off
AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE organization_id = org_id
      AND user_id = auth.uid()
      AND role = 'admin'
  );
$$;

-- 3. Replace USING (true) policies — tables with direct organization_id ---------

-- signage_layouts
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_layouts;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_layouts;
CREATE POLICY "org_members_read_signage_layouts" ON signage_layouts
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_signage_layouts" ON signage_layouts
  FOR ALL USING (is_org_admin(organization_id));

-- signage_displays
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_displays;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_displays;
CREATE POLICY "org_members_read_signage_displays" ON signage_displays
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_signage_displays" ON signage_displays
  FOR ALL USING (is_org_admin(organization_id));

-- signage_devices (migrated in 20260614000002)
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_devices;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_devices;
CREATE POLICY "org_members_read_signage_devices" ON signage_devices
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_signage_devices" ON signage_devices
  FOR ALL USING (is_org_admin(organization_id));

-- signage_decks (migrated in 20260614000002)
DROP POLICY IF EXISTS "Enable read access for all organization members" ON signage_decks;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON signage_decks;
CREATE POLICY "org_members_read_signage_decks" ON signage_decks
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_signage_decks" ON signage_decks
  FOR ALL USING (is_org_admin(organization_id));

-- vessel_profiles
DROP POLICY IF EXISTS "Enable read access for all organization members" ON vessel_profiles;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON vessel_profiles;
CREATE POLICY "org_members_read_vessel_profiles" ON vessel_profiles
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_vessel_profiles" ON vessel_profiles
  FOR ALL USING (is_org_admin(organization_id));

-- master_ingredients
DROP POLICY IF EXISTS "Enable read access for all organization members" ON master_ingredients;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON master_ingredients;
CREATE POLICY "org_members_read_master_ingredients" ON master_ingredients
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_master_ingredients" ON master_ingredients
  FOR ALL USING (is_org_admin(organization_id));

-- recipes
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipes;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipes;
CREATE POLICY "org_members_read_recipes" ON recipes
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_recipes" ON recipes
  FOR ALL USING (is_org_admin(organization_id));

-- recipe_categories
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_categories;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_categories;
CREATE POLICY "org_members_read_recipe_categories" ON recipe_categories
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_recipe_categories" ON recipe_categories
  FOR ALL USING (is_org_admin(organization_id));

-- recipe_tags
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_tags;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_tags;
CREATE POLICY "org_members_read_recipe_tags" ON recipe_tags
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_recipe_tags" ON recipe_tags
  FOR ALL USING (is_org_admin(organization_id));

-- integrations
DROP POLICY IF EXISTS "Enable read access for all organization members" ON integrations;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON integrations;
CREATE POLICY "org_members_read_integrations" ON integrations
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_integrations" ON integrations
  FOR ALL USING (is_org_admin(organization_id));

-- pos_items (square_items was dropped; pos_items is its successor)
DROP POLICY IF EXISTS "Enable read access for all organization members" ON pos_items;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON pos_items;
CREATE POLICY "org_members_read_pos_items" ON pos_items
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_items" ON pos_items
  FOR ALL USING (is_org_admin(organization_id));

-- pos_modifier_groups
DROP POLICY IF EXISTS "Enable read access for all organization members" ON pos_modifier_groups;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON pos_modifier_groups;
CREATE POLICY "org_members_read_pos_modifier_groups" ON pos_modifier_groups
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_modifier_groups" ON pos_modifier_groups
  FOR ALL USING (is_org_admin(organization_id));

-- pos_modifier_options
DROP POLICY IF EXISTS "Enable read access for all organization members" ON pos_modifier_options;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON pos_modifier_options;
CREATE POLICY "org_members_read_pos_modifier_options" ON pos_modifier_options
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_modifier_options" ON pos_modifier_options
  FOR ALL USING (is_org_admin(organization_id));

-- pos_item_local_overlays
DROP POLICY IF EXISTS "Enable read access for all organization members" ON pos_item_local_overlays;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON pos_item_local_overlays;
CREATE POLICY "org_members_read_pos_item_local_overlays" ON pos_item_local_overlays
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_item_local_overlays" ON pos_item_local_overlays
  FOR ALL USING (is_org_admin(organization_id));

-- vendors
DROP POLICY IF EXISTS "Enable read access for all organization members" ON vendors;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON vendors;
CREATE POLICY "org_members_read_vendors" ON vendors
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_vendors" ON vendors
  FOR ALL USING (is_org_admin(organization_id));

-- whiteboard_items
DROP POLICY IF EXISTS "Enable read access for all organization members" ON whiteboard_items;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON whiteboard_items;
CREATE POLICY "org_members_read_whiteboard_items" ON whiteboard_items
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_whiteboard_items" ON whiteboard_items
  FOR ALL USING (is_org_admin(organization_id));

-- purchase_orders
DROP POLICY IF EXISTS "Enable read access for all organization members" ON purchase_orders;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON purchase_orders;
CREATE POLICY "org_members_read_purchase_orders" ON purchase_orders
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_purchase_orders" ON purchase_orders
  FOR ALL USING (is_org_admin(organization_id));

-- 4. Join tables: no direct organization_id — route through parent --------------

-- recipe_ingredients → recipes
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_ingredients;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_ingredients;
CREATE POLICY "org_members_read_recipe_ingredients" ON recipe_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND is_org_member(r.organization_id)
    )
  );
CREATE POLICY "org_admins_write_recipe_ingredients" ON recipe_ingredients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_ingredients.recipe_id
        AND is_org_admin(r.organization_id)
    )
  );

-- recipe_tag_assignments → recipes
DROP POLICY IF EXISTS "Enable read access for all organization members" ON recipe_tag_assignments;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON recipe_tag_assignments;
CREATE POLICY "org_members_read_recipe_tag_assignments" ON recipe_tag_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_tag_assignments.recipe_id
        AND is_org_member(r.organization_id)
    )
  );
CREATE POLICY "org_admins_write_recipe_tag_assignments" ON recipe_tag_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = recipe_tag_assignments.recipe_id
        AND is_org_admin(r.organization_id)
    )
  );

-- formula_versions → recipes
DROP POLICY IF EXISTS "Enable read access for all organization members" ON formula_versions;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON formula_versions;
CREATE POLICY "org_members_read_formula_versions" ON formula_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = formula_versions.recipe_id
        AND is_org_member(r.organization_id)
    )
  );
CREATE POLICY "org_admins_write_formula_versions" ON formula_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM recipes r
      WHERE r.id = formula_versions.recipe_id
        AND is_org_admin(r.organization_id)
    )
  );

-- pos_item_modifier_groups → pos_items
DROP POLICY IF EXISTS "Enable read access for all organization members" ON pos_item_modifier_groups;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON pos_item_modifier_groups;
CREATE POLICY "org_members_read_pos_item_modifier_groups" ON pos_item_modifier_groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pos_items pi
      WHERE pi.id = pos_item_modifier_groups.pos_item_id
        AND is_org_member(pi.organization_id)
    )
  );
CREATE POLICY "org_admins_write_pos_item_modifier_groups" ON pos_item_modifier_groups
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pos_items pi
      WHERE pi.id = pos_item_modifier_groups.pos_item_id
        AND is_org_admin(pi.organization_id)
    )
  );

-- purchase_order_items → purchase_orders (FK column is po_id)
DROP POLICY IF EXISTS "Enable read access for all organization members" ON purchase_order_items;
DROP POLICY IF EXISTS "Enable write access for organization admins" ON purchase_order_items;
CREATE POLICY "org_members_read_purchase_order_items" ON purchase_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND is_org_member(po.organization_id)
    )
  );
CREATE POLICY "org_admins_write_purchase_order_items" ON purchase_order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM purchase_orders po
      WHERE po.id = purchase_order_items.po_id
        AND is_org_admin(po.organization_id)
    )
  );

-- 5. Indexes for helper function performance ------------------------------------
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_role ON org_members(organization_id, role);

-- 6. Grants ---------------------------------------------------------------------
GRANT EXECUTE ON FUNCTION is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_org_admin(UUID) TO authenticated;
