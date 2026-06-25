-- Create par_level_suggestions table
CREATE TABLE IF NOT EXISTS par_level_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  suggested_par_g NUMERIC NOT NULL,
  current_par_g NUMERIC,
  avg_daily_usage_g NUMERIC,
  lead_time_days NUMERIC,
  safety_factor NUMERIC DEFAULT 1.25,
  confidence NUMERIC CHECK (confidence >= 0 AND confidence <= 1),
  reasoning TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED')),
  generated_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE par_level_suggestions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "org_members_read_par_level_suggestions" ON par_level_suggestions
  FOR SELECT USING (is_org_member(organization_id));
CREATE POLICY "org_admins_write_par_level_suggestions" ON par_level_suggestions
  FOR ALL USING (is_org_admin(organization_id));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_par_suggestions_org_status ON par_level_suggestions(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_par_suggestions_item ON par_level_suggestions(item_id);
