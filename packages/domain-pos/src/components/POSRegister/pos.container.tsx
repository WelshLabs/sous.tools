"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { OmniBar } from "@soustools/design-system";
import { POSRegisterView } from "./pos.view";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import { POSModifiersModal, type ModifierOption } from "./components/pos-modifiers-modal";
import { POSTenderModal } from "./components/pos-tender-modal";
import { type CatalogItem, type CartItem } from "./pos.types";
import { MOCK_BURGER_MODIFIERS, CATEGORIES, getFilteredItems, calculateTotals, buildCartWithAddedItem } from "./pos.helpers";

export function POSRegisterContainer() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals Local State
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState<CatalogItem | null>(null);
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setLoading(true);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
try {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const targetOrgId = "d0000000-0000-0000-0000-000000000000";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await api.GET("/pos-simulator/items", {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { query: { organizationId: targetOrgId } },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (error) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    throw new Error(typeof error === "string" ? error : JSON.stringify(error));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (data) setItems(data);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} catch (e: any) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const message = e instanceof Error ? e.message : String(e);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  toast.error(`Failed to load POS catalog: ${message}`);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} finally {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  setLoading(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}
    };
    loadCatalog();
  }, []);

  const filteredItems = getFilteredItems(items, searchQuery, selectedCategory);
  const { total } = calculateTotals(cart);

  const addToCartDirect = (item: CatalogItem, selectedMods: ModifierOption[]) => {
    setCart((prev) => buildCartWithAddedItem(prev, item, selectedMods));
    toast.success(`Added ${item.name} to ticket.`);
  };

  const handleItemClick = (item: CatalogItem) => {
    if (item.name.toLowerCase().includes("burger") || item.name.toLowerCase().includes("sandwich")) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setSelectedItemForModifiers(item);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setIsModifiersOpen(true);
    } else {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
addToCartDirect(item, []);
    }
  };

  const handleModifierSubmit = (selected: ModifierOption[]) => {
    if (selectedItemForModifiers) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
addToCartDirect(selectedItemForModifiers, selected);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setIsModifiersOpen(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setSelectedItemForModifiers(null);
    }
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from ticket.");
  };

  const handleCheckoutSubmit = async (_paymentType: string, _amountTendered: number) => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    const orderData = {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
items: cart.map((item) => ({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  name: item.name,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  quantity: item.quantity,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  price: item.price,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  modifiers: item.modifiers.map((m) => ({
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    external_id: m.external_id,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: m.name,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  })),
// eslint-disable-next-line @typescript-eslint/no-explicit-any
})),
    };

    try {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await (api.POST as unknown)("/integrations/checkout", {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: { orgId: "d0000000-0000-0000-0000-000000000000", orderData },
// eslint-disable-next-line @typescript-eslint/no-explicit-any
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (error) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  throw new Error(typeof error === "string" ? error : JSON.stringify(error));
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
toast.success("Order processed successfully. Synced to Square POS API.");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setCart([]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setIsTenderOpen(false);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const message = e instanceof Error ? e.message : String(e);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
toast.error(`Checkout failed: ${message}`);
    } finally {
// eslint-disable-next-line @typescript-eslint/no-explicit-any
setIsCheckingOut(false);
    }
  };

  return (
    <>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
<POSRegisterView
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  header={
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div className="flex w-full items-center gap-4 px-6 py-3">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
<Link
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  href="/home"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  className="p-2 rounded-[var(--radius-sm)] border border-border bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground transition-all shrink-0"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  <ChevronLeft className="w-4 h-4" />
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
</Link>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
<div className="shrink-0">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  <OmniBar />
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
</div>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    </div>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  catalog={
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    loading ? (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
<div className="flex flex-1 items-center justify-center min-h-[300px]">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  <span className="text-sm text-muted-foreground animate-pulse">Loading POS Catalog...</span>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
</div>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
<POSCatalog
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  items={filteredItems}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories={CATEGORIES}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedCategory={selectedCategory}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchQuery={searchQuery}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSearchChange={setSearchQuery}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onCategorySelect={setSelectedCategory}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onItemClick={handleItemClick}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    )
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  ticket={
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    <POSTicket
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
items={cart}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
onUpdateQuantity={handleUpdateQuantity}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
onRemoveItem={handleRemoveItem}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
onClearCart={() => setCart([])}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
onCheckout={() => setIsTenderOpen(true)}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
isCheckingOut={isCheckingOut}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    />
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
<POSModifiersModal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  isOpen={isModifiersOpen}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose={() => setIsModifiersOpen(false)}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  item={selectedItemForModifiers}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  groups={MOCK_BURGER_MODIFIERS}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit={handleModifierSubmit}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
<POSTenderModal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  isOpen={isTenderOpen}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClose={() => setIsTenderOpen(false)}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  amountDue={total}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit={handleCheckoutSubmit}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
/>
    </>
  );
}
POSRegisterContainer.displayName = "POSRegisterContainer";
