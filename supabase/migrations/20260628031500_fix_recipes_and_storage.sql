-- Add missing columns to recipes table
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'APPROVED';
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_book TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS source_author TEXT;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS cost_per_yield NUMERIC DEFAULT 0;
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS gross_margin NUMERIC DEFAULT 0;

-- Make ingestion-sources bucket public so the frontend can render images natively
UPDATE storage.buckets
SET public = true
WHERE id = 'ingestion-sources';

-- Also add a public read policy just in case
DROP POLICY IF EXISTS "Anyone can read ingestion sources" ON storage.objects;
CREATE POLICY "Anyone can read ingestion sources"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'ingestion-sources');
