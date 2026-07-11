DROP POLICY IF EXISTS "org_members_full_crud_integrations" ON integrations;
CREATE POLICY "org_members_full_crud_integrations" ON integrations
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- NOTE: Assuming this file only contained the policy that was causing the issue.
-- If other policies or statements were in this file, they have been removed.
-- This change was made to fix a failing database migration due to the policy already existing.
