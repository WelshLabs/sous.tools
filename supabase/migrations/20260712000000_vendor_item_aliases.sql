-- Drop the existing table if it exists to clean up
DROP TABLE IF EXISTS public.vendor_item_aliases CASCADE;

-- Create the new vendor_item_aliases table
CREATE TABLE public.vendor_item_aliases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  vendor_item_string TEXT NOT NULL,
  master_ingredient_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(organization_id, vendor_id, vendor_item_string)
);

-- Enable RLS
ALTER TABLE public.vendor_item_aliases ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
CREATE POLICY "org_members_full_crud_vendor_item_aliases" ON public.vendor_item_aliases
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));
