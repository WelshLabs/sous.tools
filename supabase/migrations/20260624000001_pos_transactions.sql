-- Create pos_transactions table
CREATE TABLE IF NOT EXISTS pos_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_item_id UUID REFERENCES pos_items(id) ON DELETE SET NULL,
  quantity_sold INTEGER NOT NULL DEFAULT 1,
  gross_revenue NUMERIC NOT NULL,
  discount_amount NUMERIC DEFAULT 0,
  transaction_time TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'square',
  external_transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_pos_ext_txn UNIQUE (external_transaction_id)
);

-- Create pos_item_recipe_links table
CREATE TABLE IF NOT EXISTS pos_item_recipe_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  pos_item_id UUID NOT NULL REFERENCES pos_items(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  portion_fraction NUMERIC NOT NULL DEFAULT 1.0,
  CONSTRAINT uq_pos_item_recipe UNIQUE (pos_item_id, recipe_id)
);

-- Create views for sales velocity
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

-- Enable RLS
ALTER TABLE pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_item_recipe_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "org_members_read_pos_transactions" ON pos_transactions 
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_transactions" ON pos_transactions 
  FOR ALL USING (is_org_admin(organization_id));

CREATE POLICY "org_members_read_pos_links" ON pos_item_recipe_links 
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_pos_links" ON pos_item_recipe_links 
  FOR ALL USING (is_org_admin(organization_id));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pos_transactions_org_time ON pos_transactions(organization_id, transaction_time DESC);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_item ON pos_transactions(pos_item_id);
CREATE INDEX IF NOT EXISTS idx_pos_txn_ext_id ON pos_transactions(external_transaction_id) WHERE external_transaction_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pos_item_recipe_links_pos ON pos_item_recipe_links(pos_item_id);
CREATE INDEX IF NOT EXISTS idx_pos_item_recipe_links_recipe ON pos_item_recipe_links(recipe_id);
