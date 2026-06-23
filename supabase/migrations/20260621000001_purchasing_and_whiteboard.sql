-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_method TEXT NOT NULL CHECK (order_method IN ('EMAIL', 'SMS', 'MANUAL')),
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create whiteboard items table
CREATE TABLE IF NOT EXISTS whiteboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('DRAFT', 'SUBMITTED', 'RECONCILED')),
  order_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create purchase order items table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  raw_name TEXT NOT NULL,
  ordered_qty NUMERIC NOT NULL,
  price_per_unit NUMERIC DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE whiteboard_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
DROP POLICY IF EXISTS "Enable read access for all organization members" ON vendors;
CREATE POLICY "Enable read access for all organization members" ON vendors FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON vendors;
CREATE POLICY "Enable write access for organization admins" ON vendors FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON whiteboard_items;
CREATE POLICY "Enable read access for all organization members" ON whiteboard_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON whiteboard_items;
CREATE POLICY "Enable write access for organization admins" ON whiteboard_items FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON purchase_orders;
CREATE POLICY "Enable read access for all organization members" ON purchase_orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON purchase_orders;
CREATE POLICY "Enable write access for organization admins" ON purchase_orders FOR ALL USING (true);

DROP POLICY IF EXISTS "Enable read access for all organization members" ON purchase_order_items;
CREATE POLICY "Enable read access for all organization members" ON purchase_order_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable write access for organization admins" ON purchase_order_items;
CREATE POLICY "Enable write access for organization admins" ON purchase_order_items FOR ALL USING (true);


-- Grant permissions to Supabase roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
