-- ------------------------------------------------------------------------------
-- Add status column to pos_order_line_items
-- ------------------------------------------------------------------------------
ALTER TABLE public.pos_order_line_items
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'OPEN';
