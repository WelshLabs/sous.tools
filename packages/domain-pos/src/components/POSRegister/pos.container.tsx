"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { OmniBar } from "@soustools/design-system";
import { POSRegisterView } from "./pos.view";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import { POSModifiersModal, type ModifierGroup, type ModifierOption } from "./components/pos-modifiers-modal";
import { POSTenderModal } from "./components/pos-tender-modal";
import { type CatalogItem, type CartItem } from "./pos.types";

const MOCK_BURGER_MODIFIERS: ModifierGroup[] = [
  {
    id: "g1",
    name: "Choose Cheese",
    required: true,
    minSelections: 1,
    maxSelections: 1,
    options: [
      { id: "o1", name: "Cheddar", price: 0 },
      { id: "o2", name: "Swiss", price: 0.5 },
      { id: "o3", name: "Provolone", price: 0.5 },
    ],
  },
  {
    id: "g2",
    name: "Add-ons",
    required: false,
    minSelections: 0,
    maxSelections: 3,
    options: [
      { id: "o4", name: "Bacon", price: 1.5 },
      { id: "o5", name: "Avocado", price: 2.0 },
      { id: "o6", name: "Extra Patty", price: 3.0 },
    ],
  },
];

const getCategory = (itemName: string): string => {
  const name = itemName.toLowerCase();
  if (name.includes("burger") || name.includes("sandwich") || name.includes("steak") || name.includes("salmon")) {
    return "Mains";
  }
  if (name.includes("salad") || name.includes("fries") || name.includes("soup") || name.includes("tater")) {
    return "Sides/Salads";
  }
  if (name.includes("beer") || name.includes("ipa") || name.includes("drink") || name.includes("soda") || name.includes("water")) {
    return "Beverages";
  }
  return "Other";
};

const CATEGORIES = ["Mains", "Sides/Salads", "Beverages", "Other"];

export function POSRegisterContainer() {
  const [items, setItems] = useState<any[]>([]);
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
        const { data, error } = await (api as any).GET("/pos-simulator/items", {
          params: { query: { organizationId: targetOrgId } },
        });

        if (error) {
          throw new Error(typeof error === "string" ? error : JSON.stringify(error));
        }
        if (data) setItems(data);
      } catch (e: any) {
        toast.error(`Failed to load POS catalog: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const mappedItems: CatalogItem[] = items.map((item) => ({
    id: item.id,
    name: item.name,
    price: Number(item.price),
    category: getCategory(item.name),
    description: item.description || undefined,
    isSoldOut: item.is_sold_out || false,
    image: item.image || undefined,
  }));

  const filteredItems = mappedItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCartDirect = (item: CatalogItem, selectedMods: ModifierOption[]) => {
    const cartItemKey = `${item.id}-${selectedMods.map((m) => m.id).sort().join("-")}`;
    setCart((prev) => {
      const existingIndex = prev.findIndex((ci) => ci.id === cartItemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          id: cartItemKey,
          external_id: null,
          name: item.name,
          price: item.price,
          quantity: 1,
          modifiers: selectedMods.map((m) => ({
            id: m.id,
            external_id: null,
            name: m.name,
            price: m.price,
          })),
        },
      ];
    });
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

  const handleCheckoutSubmit = async (paymentType: string, amountTendered: number) => {
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
      const res = await fetch("/api/integrations/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId: "d0000000-0000-0000-0000-000000000000", orderData }),
      });

      if (!res.ok) throw new Error(await res.text());

      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); 
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); 
        osc.type = "sine";
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } catch (soundErr) {}

      toast.success("Order processed successfully. Synced to Square POS API.");
      setCart([]);
      setIsTenderOpen(false);
    } catch (e: any) {
      toast.error(`Checkout failed: ${e.message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price + item.modifiers.reduce((mSum, m) => mSum + m.price, 0)) * item.quantity, 0);
  const tax = subtotal * 0.0825;
  const total = subtotal + tax;

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
