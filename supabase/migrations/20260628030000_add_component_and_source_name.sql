-- Add component to recipe_ingredients
ALTER TABLE public.recipe_ingredients
ADD COLUMN IF NOT EXISTS component text;

-- Add source_name to ingestion_reviews
ALTER TABLE public.ingestion_reviews
ADD COLUMN IF NOT EXISTS source_name text;
