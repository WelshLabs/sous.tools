-- Add source_document_url to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_document_url TEXT;

-- Add source_document_url to ingestion_reviews table  
ALTER TABLE ingestion_reviews ADD COLUMN IF NOT EXISTS source_document_url TEXT;

-- Create the ingestion-sources storage bucket (public=false, authenticated only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ingestion-sources',
  'ingestion-sources',
  false,
  52428800, -- 50MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to read/write their org files
DROP POLICY IF EXISTS "Org members can upload ingestion sources" ON storage.objects;
CREATE POLICY "Org members can upload ingestion sources"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ingestion-sources');

DROP POLICY IF EXISTS "Org members can read ingestion sources" ON storage.objects;
CREATE POLICY "Org members can read ingestion sources"
ON storage.objects FOR SELECT
TO authenticated, service_role
USING (bucket_id = 'ingestion-sources');

DROP POLICY IF EXISTS "Service role can manage ingestion sources" ON storage.objects;
CREATE POLICY "Service role can manage ingestion sources"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'ingestion-sources');
