-- Add POS Item ID to recipes table
ALTER TABLE "public"."recipes" 
ADD COLUMN "pos_item_id" text;

-- Add comment
COMMENT ON COLUMN "public"."recipes"."pos_item_id" IS 'Links recipe to a synced POS item catalog entry';
