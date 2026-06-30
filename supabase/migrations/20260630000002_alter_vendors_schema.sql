-- Add missing columns to vendors table since the create table in 20260629135700_create_vendors.sql was skipped due to IF NOT EXISTS

ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS order_days JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;

-- Update the order_method check constraint to support both old and new values
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_order_method_check;
ALTER TABLE public.vendors ADD CONSTRAINT vendors_order_method_check CHECK (order_method IN ('email', 'text', 'EMAIL', 'SMS', 'MANUAL'));
