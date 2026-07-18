import { useState, useEffect } from "react";
import { POSRegisterView } from "./pos.view";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import { POSModifiersModal, type ModifierOption } from "./components/pos-modifiers-modal";
import { POSTenderModal } from "./components/pos-tender-modal";
import { type CatalogItem, type CartItem } from "./pos.types";
import {
  MOCK_BURGER_MODIFIERS,
  CATEGORIES,
  playSuccessSound,
  getFilteredItems,
  calculateTotals,
  buildCartWithAddedItem,
} from "./pos.helpers";
import { toast } from "sonner";
import { api } from "@soustools/api-client";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

// --- Types ---

interface POSHeaderProps {
  onClose: () => void;
}

interface POSCatalogProps {
  loading: boolean;
  filteredItems: CatalogItem[];
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCategorySelect: (category: string) => void;
  onItemClick: (item: CatalogItem) => void;
}

interface POSTicketProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isCheckingOut: boolean;
}

// --- Reusable Components ---

const POSHeader: React.FC<POSHeaderProps> = ({ onClose }) => {
  return (
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
  );
};

const POSCatalogWrapper: React.FC<POSCatalogProps> = ({
  loading,
  filteredItems,
  categories,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onCategorySelect,
  onItemClick,
}) => {
  return (
    loading ? (
      <div className="flex flex-1 items-center justify-center min-h-[300px]">
        <span className="text-sm text-muted-foreground animate-pulse">Loading POS Catalog...</span>
      </div>
    ) : (
      <POSCatalog
        items={filteredItems}
        categories={categories}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        onCategorySelect={onCategorySelect}
        onItemClick={onItemClick}
      />
    )
  );
};

const POSTicketWrapper: React.FC<POSTicketProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isCheckingOut,
}) => {
  return (
    <POSTicket
      items={items}
      onUpdateQuantity={onUpdateQuantity}
      onRemoveItem={onRemoveItem}
      onClearCart={onClearCart}
      onCheckout={onCheckout}
      isCheckingOut={isCheckingOut}
    />
  );
};

// --- Main POSRegisterContainer Component ---
export function POSRegisterContainer() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Modals Local State
  const [selectedItemForModifiers, setSelectedItemForModifiers] =
    useState<CatalogItem | null>(null);
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      try {
        const targetOrgId = "d0000000-0000-0000-0000-000000000000";
        const { data, error } = await api.GET("/pos-simulator/items", {
          params: { organizationId: targetOrgId },
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

  const addToCartDirect = (
    item: CatalogItem,
    selectedMods: ModifierOption[],
  ) => {
    setCart((prev) => buildCartWithAddedItem(prev, item, selectedMods));
    toast.success(`Added ${item.name} to ticket.`);
  };

  const handleItemClick = (item: CatalogItem) => {
    if (
      item.name.toLowerCase().includes("burger") ||
      item.name.toLowerCase().includes("sandwich")
    ) {
      setSelectedItemForModifiers(item);
      setIsModifiersOpen(true);
    } else {
      addToCartDirect(item, []);
    }
  };

  const handleModifierSubmit = (selected: ModifierOption[]) => {
    if (selectedItemForModifiers) {
      addToCartDirect(selectedItemForModifiers as CatalogItem, selected);
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
      const { error } = await (
        api.POST as (path: string, options: unknown) => Promise<{ error?: unknown }>
      )("/integrations/checkout", {
        body: { orgId: "d0000000-0000-0000-0000-000000000000", orderData },
      });

      if (error) {
        throw new Error(typeof error === "string" ? error : JSON.stringify(error));
      }

      playSuccessSound();

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

  const { total } = calculateTotals(cart);

  return (
    <div className="flex-1 bg-background p-8 min-h-screen">
      <POSHeader onClose={() => {}} />
      <div className="flex bg-muted/50 dark:bg-card/70 rounded-2xl p-1 border border-border dark:border-border mb-12">
        {(["list", "history"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={[
              "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === tab
                ? "bg-background dark:bg-zinc-800 shadow-sm text-primary"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {tab === "list" ? "Living List" : "Order History"}
          </button>
        ))}
      </div>

      {activeTab === "history" ? (
        <OrdersHistoryTab
          historyOrders={purchaseOrders.filter((po: PurchaseOrder) => po.status !== "DRAFT")}
          onShopOrder={onShopOrder}
        />
      ) : (
        <OrdersListTab
          items={items}
          searchQuery={searchQuery}
          suggestions={suggestions}
          suppliers={suppliers}
          groupedItems={groupedItems}
          placingOrderId={placingOrderId}
          onSearchChange={setSearchQuery}
          onSelectSuggestion={() => setSearchQuery("")}
          onAddFreeText={onAddFreeText}
          onRemoveItem={onRemoveItem}
          onChangeQty={onUpdateItemQty}
          onChangeSupplier={onChangeSupplier}
          onPlaceOrder={onPlaceOrder}
          onShopOrder={onShopOrder}
        />
      )}
    </div>
  );
}
