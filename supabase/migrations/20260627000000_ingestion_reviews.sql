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

ALTER TABLE ingestion_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all organization members" ON ingestion_reviews FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON ingestion_reviews FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON ingestion_reviews TO anon, authenticated, service_role;

-- Vendor Item Aliases Table
CREATE TABLE IF NOT EXISTS vendor_item_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id TEXT NOT NULL,
  vendor_item_name TEXT NOT NULL,
  internal_item_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE vendor_item_aliases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all organization members" ON vendor_item_aliases FOR SELECT USING (true);
CREATE POLICY "Enable write access for organization admins" ON vendor_item_aliases FOR ALL USING (true) WITH CHECK (true);

GRANT ALL ON vendor_item_aliases TO anon, authenticated, service_role;

