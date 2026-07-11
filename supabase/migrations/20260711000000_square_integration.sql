-- ==============================================================================
-- Migration: Square Integration Expansion
-- Adds pos_categories, pos_discounts, pos_orders and updates pos_items.
-- Enforces Row Level Security (RLS) for tenant isolation.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. POS Categories
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pos_provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, pos_provider, external_id)
);

ALTER TABLE public.pos_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_full_crud_pos_categories" ON public.pos_categories
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- 2. Update POS Items (Add Category Relation)
-- ------------------------------------------------------------------------------
ALTER TABLE public.pos_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.pos_categories(id) ON DELETE SET NULL;

-- ------------------------------------------------------------------------------
-- 3. POS Discounts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pos_provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL,
  discount_type TEXT NOT NULL, -- FIXED_PERCENTAGE, FIXED_AMOUNT, etc.
  amount_or_percentage NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, pos_provider, external_id)
);

ALTER TABLE public.pos_discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_full_crud_pos_discounts" ON public.pos_discounts
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));

-- ------------------------------------------------------------------------------
-- 4. POS Orders
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pos_provider TEXT NOT NULL,
  external_id TEXT NOT NULL,
  location_id TEXT,
  state TEXT NOT NULL,
  total_money NUMERIC NOT NULL DEFAULT 0,
  total_discount_money NUMERIC NOT NULL DEFAULT 0,
  total_tax_money NUMERIC NOT NULL DEFAULT 0,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (organization_id, pos_provider, external_id)
);

ALTER TABLE public.pos_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "org_members_full_crud_pos_orders" ON public.pos_orders
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));
