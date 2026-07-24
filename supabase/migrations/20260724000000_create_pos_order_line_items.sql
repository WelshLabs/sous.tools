-- ------------------------------------------------------------------------------
-- POS Order Line Items Table & RLS Policy
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pos_order_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  pos_order_id UUID NOT NULL REFERENCES public.pos_orders(id) ON DELETE CASCADE,
  pos_item_id UUID REFERENCES public.pos_items(id) ON DELETE SET NULL,
  external_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT 'Unnamed Item',
  quantity NUMERIC NOT NULL DEFAULT 1,
  base_price_money NUMERIC NOT NULL DEFAULT 0,
  gross_sales_money NUMERIC NOT NULL DEFAULT 0,
  total_discount_money NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pos_order_id, external_id)
);

ALTER TABLE public.pos_order_line_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "org_members_full_crud_pos_order_line_items" ON public.pos_order_line_items
  FOR ALL USING (is_org_member(organization_id))
  WITH CHECK (is_org_member(organization_id));
