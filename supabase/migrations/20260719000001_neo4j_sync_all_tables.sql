-- Drop triggers if they exist
DROP TRIGGER IF EXISTS on_organization_sync ON public.organizations;
DROP TRIGGER IF EXISTS on_vendor_sync ON public.vendors;
DROP TRIGGER IF EXISTS on_item_sync ON public.items;
DROP TRIGGER IF EXISTS on_recipe_ingredient_sync ON public.recipe_ingredients;
DROP TRIGGER IF EXISTS on_inventory_on_hand_sync ON public.inventory_on_hand;
DROP TRIGGER IF EXISTS on_purchase_order_sync ON public.purchase_orders;
DROP TRIGGER IF EXISTS on_purchase_order_item_sync ON public.purchase_order_items;
DROP TRIGGER IF EXISTS on_vendor_item_alias_sync ON public.vendor_item_aliases;

-- Register triggers on all core tables to forward changes to Neo4j
CREATE TRIGGER on_organization_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_vendor_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_item_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_recipe_ingredient_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_inventory_on_hand_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_on_hand
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_purchase_order_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_purchase_order_item_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();

CREATE TRIGGER on_vendor_item_alias_sync
  AFTER INSERT OR UPDATE OR DELETE ON public.vendor_item_aliases
  FOR EACH ROW EXECUTE FUNCTION public.handle_neo4j_sync();
