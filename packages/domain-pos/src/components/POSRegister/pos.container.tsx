/* eslint-disable max-lines, @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api, createWebSocketClient } from "@soustools/api-client";
import { OmniBar } from "@soustools/design-system";
import { POSRegisterView } from "./pos.view";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import {
  POSModifiersModal,
  type ModifierGroup,
  type ModifierOption,
} from "./components/pos-modifiers-modal";
import { POSTenderModal } from "./components/pos-tender-modal";
import { type CatalogItem, type CartItem } from "./pos.types";
import {
  getFilteredItems,
  calculateTotals,
  buildCartWithAddedItem,
  parseCatalogPayload,
} from "./pos.helpers";

export function POSRegisterContainer() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals Local State
  const [selectedItemForModifiers, setSelectedItemForModifiers] =
    useState<CatalogItem | null>(null);
  const [activeModifiersForModal, setActiveModifiersForModal] = useState<
    ModifierGroup[]
  >([]);
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const targetOrgId = "d0000000-0000-0000-0000-000000000000";
        const { data, error } = await api.GET("/pos/catalog", {
          params: { query: { orgId: targetOrgId } },
        });

        if (error) {
          throw new Error(
            typeof error === "string" ? error : JSON.stringify(error),
          );
        }
        if (data) {
          const parsed = parseCatalogPayload(data);
          setCategories(parsed.categories);
          setModifierGroups(parsed.modifierGroups);
          setItems(parsed.items);
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : String(e);
        toast.error(`Failed to load POS catalog: ${message}`);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();

    const targetOrgId = "d0000000-0000-0000-0000-000000000000";
    const socket = createWebSocketClient({
      namespace: "/pos",
      query: { orgId: targetOrgId },
    });

    socket.on("catalog_updated", () => {
      loadCatalog();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredItems = getFilteredItems(items, searchQuery, selectedCategory);
  const { total } = calculateTotals(cart);

  const addToCartDirect = (
    item: CatalogItem,
    selectedMods: ModifierOption[],
  ) => {
    setCart((prev) => buildCartWithAddedItem(prev, item, selectedMods));
    toast.success(`Added ${item.name} to ticket.`);
  };

  const handleItemClick = (item: CatalogItem) => {
    const itemMgIds = item.modifierGroupIds || [];
    const matchingGroups =
      itemMgIds.length > 0
        ? modifierGroups.filter((g) => itemMgIds.includes(g.id))
        : modifierGroups;

    if (matchingGroups.length > 0) {
      setSelectedItemForModifiers(item);
      setActiveModifiersForModal(matchingGroups);
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
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item,
      ),
    );
  };

  const handleRemoveItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from ticket.");
  };

  const handleCheckoutSubmit = async (
    _paymentType: string,
    _amountTendered: number,
  ) => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    try {
      const transactionsToInsert = cart.map((item) => ({
        organization_id: "d0000000-0000-0000-0000-000000000000",
        pos_item_id: item.id.split("-")[0],
        quantity_sold: item.quantity,
        gross_revenue:
          (item.price + item.modifiers.reduce((s, m) => s + m.price, 0)) *
          item.quantity,
        transaction_time: new Date().toISOString(),
        source: "pos_register",
      }));

      const { error } = await api.POST("/pos/transactions/bulk", {
        body: transactionsToInsert as any,
      });

      if (error) {
        throw new Error(
          typeof error === "string" ? error : JSON.stringify(error),
        );
      }

      toast.success(
        "Order processed successfully. Synced to POS transactions.",
      );
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
              className="border-border bg-card/40 hover:bg-card text-muted-foreground hover:text-foreground shrink-0 rounded-[var(--radius-sm)] border p-2 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <div className="shrink-0">
              <OmniBar />
            </div>
          </div>
        }
        catalog={
          loading ? (
            <div className="flex min-h-[300px] flex-1 items-center justify-center">
              <span className="text-muted-foreground animate-pulse text-sm">
                Loading POS Catalog...
              </span>
            </div>
          ) : (
            <POSCatalog
              items={filteredItems}
              categories={categories}
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
        groups={activeModifiersForModal}
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
