-- ============================================================
-- Migration: user_profiles
-- Create user_profiles table to extend auth.users with full_name 
-- and other user-specific attributes.
-- ============================================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies: users may update their own profile; admins may update any user in their org
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

-- 4. Auto-create profile for existing users in seed
INSERT INTO user_profiles (user_id, full_name)
SELECT id, (raw_user_meta_data->>'name')::TEXT
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- 5. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT ALL ON user_profiles TO service_role;

-- 6. Index
CREATE INDEX IF NOT EXISTS idx_user_profiles_user ON user_profiles(user_id);
