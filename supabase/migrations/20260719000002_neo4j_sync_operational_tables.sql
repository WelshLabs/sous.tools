-- 1. Create Sales Tables if not exists
CREATE TABLE IF NOT EXISTS public.tickets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_number    TEXT,
  section         TEXT,
  status          TEXT CHECK (status IN ('OPEN', 'CLOSED')) DEFAULT 'OPEN',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id       UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  status          TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  recipe_id       UUID REFERENCES recipes(id) ON DELETE SET NULL,
  quantity        NUMERIC NOT NULL DEFAULT 1,
  unit_price      NUMERIC NOT NULL DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2. Create Labor Tables if not exists
CREATE TABLE IF NOT EXISTS public.shifts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  start_time      TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time        TIMESTAMP WITH TIME ZONE,
  role            TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.time_clocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clock_in        TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out       TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 3. Create Ledger/Ingestion Tables if not exists
CREATE TABLE IF NOT EXISTS public.invoices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  po_id           UUID REFERENCES purchase_orders(id) ON DELETE SET NULL,
  invoice_number  TEXT NOT NULL,
  total_amount    NUMERIC NOT NULL,
  invoice_date    DATE NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.invoice_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  raw_name        TEXT NOT NULL,
  item_id         UUID REFERENCES items(id) ON DELETE SET NULL,
  quantity        NUMERIC NOT NULL,
  unit_price      NUMERIC NOT NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 4. Create Kitchen Ops Tables if not exists
CREATE TABLE IF NOT EXISTS public.wastage_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  item_id         UUID REFERENCES items(id) ON DELETE SET NULL,
  recipe_id       UUID REFERENCES recipes(id) ON DELETE SET NULL,
  quantity        NUMERIC NOT NULL,
  reason          TEXT,
  recorded_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 5. Drop triggers if they exist
DROP TRIGGER IF EXISTS on_ticket_sync ON public.tickets;
DROP TRIGGER IF EXISTS on_order_sync ON public.orders;
DROP TRIGGER IF EXISTS on_order_item_sync ON public.order_items;
DROP TRIGGER IF EXISTS on_shift_sync ON public.shifts;
DROP TRIGGER IF EXISTS on_time_clock_sync ON public.time_clocks;
DROP TRIGGER IF EXISTS on_invoice_sync ON public.invoices;
DROP TRIGGER IF EXISTS on_invoice_item_sync ON public.invoice_items;
DROP TRIGGER IF EXISTS on_wastage_log_sync ON public.wastage_logs;

-- 6. Register triggers on public schema operational tables
CREATE TRIGGER on_ticket_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_order_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_order_item_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_shift_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_time_clock_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.time_clocks
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_invoice_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_invoice_item_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.invoice_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_wastage_log_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.wastage_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();
