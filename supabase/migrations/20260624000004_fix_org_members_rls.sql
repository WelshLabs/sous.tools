-- Fix infinite recursion on org_members by checking JWT directly

-- Drop the old recursive policies
DROP POLICY IF EXISTS "Members can view own org memberships" ON org_members;
DROP POLICY IF EXISTS "Admins can manage org memberships" ON org_members;

-- Create non-recursive policies relying on JWT claims or basic auth.uid() checks

-- A user can view their own membership row, OR any membership in an org they belong to.
-- To avoid recursion querying org_members inside org_members, we check the auth.jwt() metadata
-- assuming `org_id` might be present, OR we just let them see memberships where user_id = auth.uid().
-- Usually, letting a user see all members of their org is needed. 
-- We can do this without recursion by checking if the organization_id is in their JWT, 
-- or we can just restrict them to their own row if that's sufficient, but if they need to see others, 
-- we should use the JWT claim or a separate materialized view.
-- Here we'll allow reading if user_id = auth.uid() OR if the organization_id matches their JWT org_id.

CREATE POLICY "Members can view own org memberships non-recursive" 
ON org_members FOR SELECT 
USING (
  user_id = auth.uid() OR 
  organization_id = (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid
);

CREATE POLICY "Admins can manage org memberships non-recursive" 
ON org_members FOR ALL 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid = organization_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'org_id')::uuid = organization_id 
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);
