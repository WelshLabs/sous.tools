-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding vector(768) columns if they do not exist
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS embedding vector(768);
ALTER TABLE public.master_ingredients ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create match_items RPC function for cosine similarity search on tenant items
CREATE OR REPLACE FUNCTION public.match_items(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  org_id uuid
)
RETURNS TABLE (
  id uuid,
  name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    items.id,
    items.name,
    (1 - (items.embedding <=> query_embedding))::float AS similarity
  FROM public.items
  WHERE items.organization_id = org_id
    AND items.embedding IS NOT NULL
    AND (1 - (items.embedding <=> query_embedding)) > match_threshold
  ORDER BY items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create match_master_ingredients RPC function for cosine similarity search on global master_ingredients
CREATE OR REPLACE FUNCTION public.match_master_ingredients(
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    master_ingredients.id,
    master_ingredients.name,
    (1 - (master_ingredients.embedding <=> query_embedding))::float AS similarity
  FROM public.master_ingredients
  WHERE master_ingredients.embedding IS NOT NULL
    AND (1 - (master_ingredients.embedding <=> query_embedding)) > match_threshold
  ORDER BY master_ingredients.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
