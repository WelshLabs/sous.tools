-- Update the signage-os-images bucket to allow 5GB file uploads if it was created with a lower default limit
UPDATE storage.buckets
SET file_size_limit = 5368709120
WHERE id = 'signage-os-images';
