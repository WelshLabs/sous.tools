-- Rename the table public.master_ingredients to public.master_items
ALTER TABLE public.master_ingredients RENAME TO master_items;

-- Rename foreign key column master_ingredient_id in recipe_ingredients to master_item_id
ALTER TABLE public.recipe_ingredients RENAME COLUMN master_ingredient_id TO master_item_id;

-- Rename foreign key column master_ingredient_id in vendor_item_aliases to item_id
ALTER TABLE public.vendor_item_aliases RENAME COLUMN master_ingredient_id TO item_id;

-- Drop the old match_master_ingredients function
DROP FUNCTION IF EXISTS public.match_master_ingredients(vector(768), float, int);

-- Create new match_master_items RPC function for cosine similarity search on global master_items
CREATE OR REPLACE FUNCTION public.match_master_items(
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
    master_items.id,
    master_items.name,
    (1 - (master_items.embedding <=> query_embedding))::float AS similarity
  FROM public.master_items
  WHERE master_items.embedding IS NOT NULL
    AND (1 - (master_items.embedding <=> query_embedding)) > match_threshold
  ORDER BY master_items.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
