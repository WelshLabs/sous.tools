CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create ENUMs
DO $$ BEGIN
  CREATE TYPE item_category AS ENUM ('INGREDIENT', 'PACKAGING', 'CLEANING', 'SMALLWARES', 'OTHER');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE purchase_unit AS ENUM ('EACH', 'CASE', 'LB', 'KG', 'OZ', 'G', 'L', 'ML', 'GAL', 'QT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CREATE TABLE items
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category item_category NOT NULL DEFAULT 'INGREDIENT',
  purchase_unit purchase_unit NOT NULL DEFAULT 'LB',
  units_per_case NUMERIC,
  each_weight_g NUMERIC,
  density_g_ml NUMERIC NOT NULL DEFAULT 1.0,
  shelf_life_days INTEGER,
  is_animal_product BOOLEAN DEFAULT false,
  is_meat BOOLEAN DEFAULT false,
  is_seafood BOOLEAN DEFAULT false,
  is_dairy BOOLEAN DEFAULT false,
  is_egg BOOLEAN DEFAULT false,
  is_gluten_source BOOLEAN DEFAULT false,
  allergens TEXT[] DEFAULT '{}',
  fdc_id INTEGER,
  nutrition_macros JSONB DEFAULT '{}'::jsonb,
  current_cost_per_g NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE price_history
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  purchase_unit purchase_unit NOT NULL,
  unit_cost NUMERIC NOT NULL,
  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE TABLE wastage_ledger
CREATE TABLE IF NOT EXISTS wastage_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  amount_g NUMERIC NOT NULL,
  reason TEXT, -- 'TRIM', 'SPOILAGE', 'OVERPRODUCTION', 'SPILL'
  recorded_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- CREATE TABLE inventory_on_hand
CREATE TABLE IF NOT EXISTS inventory_on_hand (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity_g NUMERIC NOT NULL DEFAULT 0,
  lot_number TEXT,
  lot_expiry DATE,
  location TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_inventory_item_lot UNIQUE (organization_id, item_id, lot_number)
);

-- CREATE TABLE container_mapping
CREATE TABLE IF NOT EXISTS container_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL REFERENCES vessel_profiles(id) ON DELETE CASCADE,
  target_weight_g NUMERIC NOT NULL,
  notes TEXT,
  CONSTRAINT uq_container_mapping UNIQUE (recipe_id, vessel_id)
);

-- Data migration: copy master_ingredients into items
INSERT INTO items (
  id, organization_id, name, category, density_g_ml,
  is_animal_product, is_meat, is_seafood, is_dairy, is_egg,
  is_gluten_source, allergens, fdc_id, nutrition_macros, created_at, updated_at
)
SELECT 
  id, organization_id, name, 'INGREDIENT'::item_category, density_g_ml,
  COALESCE(is_animal_product, false), COALESCE(is_meat, false),
  COALESCE(is_seafood, false), COALESCE(is_dairy, false),
  COALESCE(is_egg, false), COALESCE(is_gluten_source, false),
  (SELECT ARRAY(SELECT jsonb_array_elements_text(COALESCE(allergens, '[]'::jsonb)))), fdc_id, COALESCE(nutrition_macros, '{}'::jsonb),
  created_at, updated_at
FROM master_ingredients
ON CONFLICT (id) DO NOTHING;

-- Bridge recipe_ingredients to items
ALTER TABLE recipe_ingredients ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES items(id) ON DELETE SET NULL;
UPDATE recipe_ingredients SET item_id = master_ingredient_id WHERE master_ingredient_id IS NOT NULL AND item_id IS NULL;

-- Trigger function update_item_current_cost
CREATE OR REPLACE FUNCTION update_item_current_cost()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  grams_per_unit NUMERIC;
  item_density NUMERIC;
  item_each_weight NUMERIC;
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
    WHEN 'L'    THEN 1000.0 * COALESCE(item_density, 1.0)
    WHEN 'ML'   THEN 1.0 * COALESCE(item_density, 1.0)
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

-- Enable RLS
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE wastage_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_on_hand ENABLE ROW LEVEL SECURITY;
ALTER TABLE container_mapping ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "org_members_read_items" ON items FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_items" ON items FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "org_members_read_price_history" ON price_history FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_price_history" ON price_history FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "org_members_read_wastage_ledger" ON wastage_ledger FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_wastage_ledger" ON wastage_ledger FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "org_members_read_inventory" ON inventory_on_hand FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_inventory" ON inventory_on_hand FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "org_members_read_container_mapping" ON container_mapping FOR SELECT 
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = container_mapping.recipe_id AND is_org_member(r.organization_id)));
CREATE POLICY "org_admins_write_container_mapping" ON container_mapping FOR ALL 
  USING (EXISTS (SELECT 1 FROM recipes r WHERE r.id = container_mapping.recipe_id AND is_org_admin(r.organization_id)));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_items_org ON items(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_name_trgm ON items USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_price_history_item_date ON price_history(item_id, effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_wastage_org_date ON wastage_ledger(organization_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_wastage_item ON wastage_ledger(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_org_item ON inventory_on_hand(organization_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory_on_hand(lot_expiry ASC) WHERE lot_expiry IS NOT NULL;
