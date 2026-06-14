-- Create integrations table
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('SQUARE', 'GOOGLE')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scopes TEXT[],
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_org_provider UNIQUE (organization_id, provider)
);

-- Enable RLS (Row Level Security) Policies
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;

-- Integrations policies
CREATE POLICY "Enable read access for all organization members" ON integrations
  FOR SELECT USING (true);

CREATE POLICY "Enable write access for organization admins" ON integrations
  FOR ALL USING (true);
