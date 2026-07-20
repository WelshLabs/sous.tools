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
      setLoading(true);
      try {
        const targetOrgId = "d0000000-0000-0000-0000-000000000000";
        const { data, error } = await api.GET("/pos-simulator/items", {
          params: { query: { organizationId: targetOrgId } },
        });

        if (error) {
          throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
        if (data) setItems(data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error(`Failed to load POS catalog: ${message}`);
      } finally {
        setLoading(false);
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
      setSelectedItemForModifiers(item);
      setIsModifiersOpen(true);
    } else {
      addToCartDirect(item, []);
    }
  };

  const handleModifierSubmit = (selected: ModifierOption[]) => {
    if (selectedItemForModifiers) {
      addToCartDirect(selectedItemForModifiers, selected);
      setIsModifiersOpen(false);
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
      items: cart.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers.map((m) => ({
          external_id: m.external_id,
          name: m.name,
        })),
      })),
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (api.POST as any)("/integrations/checkout", {
        body: { orgId: "d0000000-0000-0000-0000-000000000000", orderData },
      });

      if (error) {
        throw new Error(typeof error === "string" ? error : JSON.stringify(error));
      }

      toast.success("Order processed successfully. Synced to Square POS API.");
      setCart([]);
      setIsTenderOpen(false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(`Checkout failed: ${message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <POSRegisterView
        header={
          <div className="flex w-full items-center gap-4 px-6 py-3">
            <Link
              href="/home"
              className="p-2 rounded-[var(--radius-sm)] border border-border bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
            <div className="shrink-0">
              <OmniBar />
            </div>
          </div>
        }
        catalog={
          loading ? (
            <div className="flex flex-1 items-center justify-center min-h-[300px]">
              <span className="text-sm text-muted-foreground animate-pulse">Loading POS Catalog...</span>
            </div>
          ) : (
            <POSCatalog
              items={filteredItems}
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onCategorySelect={setSelectedCategory}
              onItemClick={handleItemClick}
            />
          )
        }
        ticket={
          <POSTicket
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={() => setCart([])}
            onCheckout={() => setIsTenderOpen(true)}
            isCheckingOut={isCheckingOut}
          />
        }
      />

      <POSModifiersModal
        isOpen={isModifiersOpen}
        onClose={() => setIsModifiersOpen(false)}
        item={selectedItemForModifiers}
        groups={MOCK_BURGER_MODIFIERS}
        onSubmit={handleModifierSubmit}
      />

      <POSTenderModal
        isOpen={isTenderOpen}
        onClose={() => setIsTenderOpen(false)}
        amountDue={total}
        onSubmit={handleCheckoutSubmit}
      />
    </>
  );
}
POSRegisterContainer.displayName = "POSRegisterContainer";
