-- Migration to create the signage-os-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'signage-os-images',
    'signage-os-images',
    true,
    5368709120, -- 5GB
    ARRAY['application/x-xz']
) ON CONFLICT (id) DO NOTHING;

-- Allow public read access to the OS images
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'signage-os-images' );

-- Allow service role (CI/CD) to upload OS images
CREATE POLICY "Service Role Upload Access"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'signage-os-images' );

CREATE POLICY "Service Role Update Access"
ON storage.objects FOR UPDATE
TO service_role
USING ( bucket_id = 'signage-os-images' );

CREATE POLICY "Service Role Delete Access"
ON storage.objects FOR DELETE
TO service_role
USING ( bucket_id = 'signage-os-images' );
