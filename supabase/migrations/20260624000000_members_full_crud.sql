-- ============================================================
-- Migration: members_full_crud
-- Allow org members full CRUD within their tenant scope for public tables.
-- Special-case: auth.users — allow users to manage their own account; org admins may manage any user in their org.
-- Seed: make conar@dtown.cafe an org admin.
-- ============================================================

-- NOTE: This migration assumes `org_members`, `is_org_member()` and `is_org_admin()`
-- helper functions were created by a prior migration (rls_tightening).

-- -----------------------------
-- Helper: convenience for DROP then CREATE
-- -----------------------------

-- 1) Tables with direct organization_id: grant members full CRUD scoped to organization_id

-- signage_layouts
DROP POLICY IF EXISTS "org_members_read_signage_layouts" ON signage_layouts;
DROP POLICY IF EXISTS "org_admins_write_signage_layouts" ON signage_layouts;
CREATE POLICY "org_members_full_crud_signage_layouts" ON signage_layouts
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- signage_displays
DROP POLICY IF EXISTS "org_members_read_signage_displays" ON signage_displays;
DROP POLICY IF EXISTS "org_admins_write_signage_displays" ON signage_displays;
CREATE POLICY "org_members_full_crud_signage_displays" ON signage_displays
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- signage_devices
DROP POLICY IF EXISTS "org_members_read_signage_devices" ON signage_devices;
DROP POLICY IF EXISTS "org_admins_write_signage_devices" ON signage_devices;
CREATE POLICY "org_members_full_crud_signage_devices" ON signage_devices
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- signage_decks
DROP POLICY IF EXISTS "org_members_read_signage_decks" ON signage_decks;
DROP POLICY IF EXISTS "org_admins_write_signage_decks" ON signage_decks;
CREATE POLICY "org_members_full_crud_signage_decks" ON signage_decks
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- vessel_profiles
DROP POLICY IF EXISTS "org_members_read_vessel_profiles" ON vessel_profiles;
DROP POLICY IF EXISTS "org_admins_write_vessel_profiles" ON vessel_profiles;
CREATE POLICY "org_members_full_crud_vessel_profiles" ON vessel_profiles
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- master_ingredients
DROP POLICY IF EXISTS "org_members_read_master_ingredients" ON master_ingredients;
DROP POLICY IF EXISTS "org_admins_write_master_ingredients" ON master_ingredients;
CREATE POLICY "org_members_full_crud_master_ingredients" ON master_ingredients
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- recipes
DROP POLICY IF EXISTS "org_members_read_recipes" ON recipes;
DROP POLICY IF EXISTS "org_admins_write_recipes" ON recipes;
CREATE POLICY "org_members_full_crud_recipes" ON recipes
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- recipe_categories
DROP POLICY IF EXISTS "org_members_read_recipe_categories" ON recipe_categories;
DROP POLICY IF EXISTS "org_admins_write_recipe_categories" ON recipe_categories;
CREATE POLICY "org_members_full_crud_recipe_categories" ON recipe_categories
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- recipe_tags
DROP POLICY IF EXISTS "org_members_read_recipe_tags" ON recipe_tags;
DROP POLICY IF EXISTS "org_admins_write_recipe_tags" ON recipe_tags;
CREATE POLICY "org_members_full_crud_recipe_tags" ON recipe_tags
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- integrations
DROP POLICY IF EXISTS "org_members_read_integrations" ON integrations;
DROP POLICY IF EXISTS "org_admins_write_integrations" ON integrations;
CREATE POLICY "org_members_full_crud_integrations" ON integrations
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- pos_items
DROP POLICY IF EXISTS "org_members_read_pos_items" ON pos_items;
DROP POLICY IF EXISTS "org_admins_write_pos_items" ON pos_items;
CREATE POLICY "org_members_full_crud_pos_items" ON pos_items
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- pos_modifier_groups
DROP POLICY IF EXISTS "org_members_read_pos_modifier_groups" ON pos_modifier_groups;
DROP POLICY IF EXISTS "org_admins_write_pos_modifier_groups" ON pos_modifier_groups;
CREATE POLICY "org_members_full_crud_pos_modifier_groups" ON pos_modifier_groups
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- pos_modifier_options
DROP POLICY IF EXISTS "org_members_read_pos_modifier_options" ON pos_modifier_options;
DROP POLICY IF EXISTS "org_admins_write_pos_modifier_options" ON pos_modifier_options;
CREATE POLICY "org_members_full_crud_pos_modifier_options" ON pos_modifier_options
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- pos_item_local_overlays
DROP POLICY IF EXISTS "org_members_read_pos_item_local_overlays" ON pos_item_local_overlays;
DROP POLICY IF EXISTS "org_admins_write_pos_item_local_overlays" ON pos_item_local_overlays;
CREATE POLICY "org_members_full_crud_pos_item_local_overlays" ON pos_item_local_overlays
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- vendors
DROP POLICY IF EXISTS "org_members_read_vendors" ON vendors;
DROP POLICY IF EXISTS "org_admins_write_vendors" ON vendors;
CREATE POLICY "org_members_full_crud_vendors" ON vendors
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- whiteboard_items
DROP POLICY IF EXISTS "org_members_read_whiteboard_items" ON whiteboard_items;
DROP POLICY IF EXISTS "org_admins_write_whiteboard_items" ON whiteboard_items;
CREATE POLICY "org_members_full_crud_whiteboard_items" ON whiteboard_items
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- purchase_orders
DROP POLICY IF EXISTS "org_members_read_purchase_orders" ON purchase_orders;
DROP POLICY IF EXISTS "org_admins_write_purchase_orders" ON purchase_orders;
CREATE POLICY "org_members_full_crud_purchase_orders" ON purchase_orders
  FOR ALL
  USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- purchase_order_items (uses parent purchase_orders)
DROP POLICY IF EXISTS "org_members_read_purchase_order_items" ON purchase_order_items;
DROP POLICY IF EXISTS "org_admins_write_purchase_order_items" ON purchase_order_items;
CREATE POLICY "org_members_full_crud_purchase_order_items" ON purchase_order_items
  FOR ALL
  USING (
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

-- pos_item_modifier_groups (join table: use pos_items -> organization_id)
DROP POLICY IF EXISTS "org_members_read_pos_item_modifier_groups" ON pos_item_modifier_groups;
DROP POLICY IF EXISTS "org_admins_write_pos_item_modifier_groups" ON pos_item_modifier_groups;
CREATE POLICY "org_members_full_crud_pos_item_modifier_groups" ON pos_item_modifier_groups
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM pos_items pi WHERE pi.id = pos_item_modifier_groups.pos_item_id AND is_org_member(pi.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pos_items pi WHERE pi.id = pos_item_modifier_groups.pos_item_id AND is_org_member(pi.organization_id)
    )
  );

-- recipe_ingredients (join -> recipes)
DROP POLICY IF EXISTS "org_members_read_recipe_ingredients" ON recipe_ingredients;
DROP POLICY IF EXISTS "org_admins_write_recipe_ingredients" ON recipe_ingredients;
CREATE POLICY "org_members_full_crud_recipe_ingredients" ON recipe_ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes r WHERE r.id = recipe_ingredients.recipe_id AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r WHERE r.id = recipe_ingredients.recipe_id AND is_org_member(r.organization_id)
    )
  );

-- recipe_tag_assignments (join -> recipes)
DROP POLICY IF EXISTS "org_members_read_recipe_tag_assignments" ON recipe_tag_assignments;
DROP POLICY IF EXISTS "org_admins_write_recipe_tag_assignments" ON recipe_tag_assignments;
CREATE POLICY "org_members_full_crud_recipe_tag_assignments" ON recipe_tag_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM recipes r WHERE r.id = recipe_tag_assignments.recipe_id AND is_org_member(r.organization_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM recipes r WHERE r.id = recipe_tag_assignments.recipe_id AND is_org_member(r.organization_id)
    )
  );

-- 2) auth.users special policy: users may manage their own row; org admins may manage any user in their organization
-- Note: this relies on `org_members` linking users -> organizations.
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users_self_or_org_admin" ON auth.users;
CREATE POLICY "users_self_or_org_admin" ON auth.users
  FOR ALL
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM org_members target
      WHERE target.user_id = auth.users.id
        AND EXISTS (
          SELECT 1 FROM org_members caller
          WHERE caller.user_id = auth.uid()
            AND caller.organization_id = target.organization_id
            AND caller.role = 'admin'
        )
    )
  )
  WITH CHECK (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM org_members target
      WHERE target.user_id = auth.users.id
        AND EXISTS (
          SELECT 1 FROM org_members caller
          WHERE caller.user_id = auth.uid()
            AND caller.organization_id = target.organization_id
            AND caller.role = 'admin'
        )
    )
  );

-- 3) Seed: ensure `conar@dtown.cafe` is an admin of the seeded organization
INSERT INTO org_members (organization_id, user_id, role)
VALUES ('d0000000-0000-0000-0000-000000000000', 'd0000000-0000-0000-0000-000000000000', 'admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

-- End of migration
