-- Remove the signage-os-images bucket policies

-- Drop policies
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Service Role Delete Access" ON storage.objects;
