/* eslint-disable max-lines */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, createWebSocketClient } from "@soustools/api-client";
import { POSRegisterView } from "./pos.view";
import { POSAppBar } from "./components/pos-appbar";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import {
  POSModifiersModal,
  type ModifierGroup,
  type ModifierOption,
} from "./components/pos-modifiers-modal";
import { POSTenderModal } from "./components/pos-tender-modal";
import { POSSettingsModal } from "./components/pos-settings-modal";
import { POSPinScreen } from "./components/pos-pin-screen";
import { POSReceiptModal } from "./components/pos-receipt-modal";
import { POSPastOrdersModal } from "./components/pos-past-orders-modal";
import { POSCustomAmountModal } from "./components/pos-custom-amount-modal";
import { POSSavedChecksModal } from "./components/pos-saved-checks-modal";
import { POSItemActionModal } from "./components/pos-item-action-modal";
import {
  type CatalogItem,
  type CategoryItem,
  type CartItem,
  type OrderType,
  type SavedCheck,
  type POSSettings,
  type POSUser,
  type PastOrder,
} from "./pos.types";
import {
  getFilteredItems,
  calculateTotals,
  buildCartWithAddedItem,
  parseCatalogPayload,
  playAudioChime,
  DEFAULT_TAX_RATE,
} from "./pos.helpers";

const DEFAULT_SETTINGS: POSSettings = {
  taxRate: DEFAULT_TAX_RATE,
  defaultOrderType: "for_here",
  layoutGrid: "standard",
  pinRequired: false,
  pinCode: "1234",
  printerIp: "192.168.1.150:9100",
  cashDrawerEnabled: true,
};

const DEFAULT_STAFF: POSUser = {
  id: "u-admin",
  name: "Conar Welsh",
  initials: "CW",
  role: "admin",
  pin: "1234",
};

export function POSRegisterContainer() {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryItems, setCategoryItems] = useState<CategoryItem[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Navigation State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Cart & Order State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("for_here");
  const [savedChecks, setSavedChecks] = useState<SavedCheck[]>([]);
  const [pastOrders, setPastOrders] = useState<PastOrder[]>([]);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Settings & Security State
  const [settings, setSettings] = useState<POSSettings>(DEFAULT_SETTINGS);
  const [currentUser, setCurrentUser] = useState<POSUser | null>(DEFAULT_STAFF);
  const [isLocked, setIsLocked] = useState(false);

  // Modals Local State
  const [selectedItemForModifiers, setSelectedItemForModifiers] =
    useState<CatalogItem | null>(null);
  const [activeModifiersForModal, setActiveModifiersForModal] = useState<
    ModifierGroup[]
  >([]);
  const [isModifiersOpen, setIsModifiersOpen] = useState(false);
  const [isTenderOpen, setIsTenderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedChecksOpen, setIsSavedChecksOpen] = useState(false);
  const [isPastOrdersOpen, setIsPastOrdersOpen] = useState(false);
  const [isCustomAmountOpen, setIsCustomAmountOpen] = useState(false);
  const [selectedItemForAction, setSelectedItemForAction] =
    useState<CatalogItem | null>(null);
  const [isItemActionOpen, setIsItemActionOpen] = useState(false);

  // Receipt Modal State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceiptData, setLastReceiptData] = useState<{
    items: CartItem[];
    orderType: OrderType;
    subtotal: number;
    tax: number;
    total: number;
    tenderMethod: string;
    amountTendered: number;
    changeDue: number;
  } | null>(null);

  // Load Settings and Local Storage State
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettingsRaw = localStorage.getItem("pos_settings");
        if (savedSettingsRaw) {
          const parsed = JSON.parse(savedSettingsRaw);
          setSettings((prev) => ({ ...prev, ...parsed }));
          if (parsed.defaultOrderType) {
            setOrderType(parsed.defaultOrderType);
          }
        }
        const savedChecksRaw = localStorage.getItem("pos_saved_checks");
        if (savedChecksRaw) {
          setSavedChecks(JSON.parse(savedChecksRaw));
        }
      } catch (e) {
        console.error("Failed to load POS localStorage data", e);
      }
    }
  }, []);

  // Fetch Catalog & Orders
  useEffect(() => {
    const targetOrgId = "d0000000-0000-0000-0000-000000000000";

    const loadCatalog = async () => {
      setLoading(true);
      try {
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
          setCategoryItems(parsed.categoryItems);
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

    const loadPastOrders = async () => {
      try {
        const { data, error } = await api.GET("/pos/orders", {
          params: { query: { orgId: targetOrgId } },
        });
        if (!error && data) {
          const payload = (data as any).data || data;
          if (Array.isArray(payload)) {
            setPastOrders(
              payload.map((o: any) => ({
                id: o.id,
                external_id: o.external_id || o.id.slice(0, 8),
                state: o.state || "COMPLETED",
                total_money: Number(o.total_money || 0),
                order_type: o.location_id,
                created_at: o.created_at || new Date().toISOString(),
              })),
            );
          }
        }
      } catch (err) {
        console.error("Failed to load past orders", err);
      }
    };

    loadCatalog();
    loadPastOrders();

    const socket = createWebSocketClient({
      namespace: "/pos",
      query: { orgId: targetOrgId },
    });

    socket.on("catalog_updated", () => {
      loadCatalog();
    });

    socket.on("orders_updated", () => {
      loadPastOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredItems = getFilteredItems(items, searchQuery, selectedCategory);
  const { total } = calculateTotals(cart, settings.taxRate);

  const addToCartDirect = (
    item: CatalogItem,
    selectedMods: ModifierOption[],
    notes?: string,
  ) => {
    setCart((prev) => buildCartWithAddedItem(prev, item, selectedMods, notes));
    playAudioChime("item");
    toast.success(`Added ${item.name} to ticket.`);
  };

  const handleItemClick = (item: CatalogItem) => {
    const itemMgIds = item.modifierGroupIds || [];
    // Only show modifier groups assigned to this item
    const matchingGroups =
      itemMgIds.length > 0
        ? modifierGroups.filter((g) => itemMgIds.includes(g.id))
        : [];

    if (matchingGroups.length > 0) {
      setSelectedItemForModifiers(item);
      setActiveModifiersForModal(matchingGroups);
      setIsModifiersOpen(true);
    } else {
      addToCartDirect(item, []);
    }
  };

  const handleModifierSubmit = (selected: ModifierOption[], notes?: string) => {
    if (selectedItemForModifiers) {
      addToCartDirect(selectedItemForModifiers, selected, notes);
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
    playAudioChime("clear");
    toast.success("Item removed from ticket.");
  };

  const handleClearCart = () => {
    setCart([]);
    playAudioChime("clear");
    toast.info("Ticket cleared.");
  };

  const handleSaveCheck = () => {
    if (cart.length === 0) return;
    const {
      subtotal,
      tax,
      total: checkTotal,
    } = calculateTotals(cart, settings.taxRate);
    const newCheck: SavedCheck = {
      id: `check-${Date.now()}`,
      checkName: `Check #${savedChecks.length + 1} - ${
        orderType === "for_here" ? "Table" : "To-Go"
      }`,
      orderType,
      items: cart,
      subtotal,
      tax,
      total: checkTotal,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCheck, ...savedChecks];
    setSavedChecks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_saved_checks", JSON.stringify(updated));
    }

    setCart([]);
    playAudioChime("success");
    toast.success(`Saved "${newCheck.checkName}".`);
  };

  const handleResumeCheck = (check: SavedCheck) => {
    setCart(check.items);
    setOrderType(check.orderType);
    const updated = savedChecks.filter((c) => c.id !== check.id);
    setSavedChecks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_saved_checks", JSON.stringify(updated));
    }
    toast.success(`Resumed ${check.checkName}.`);
  };

  const handleDeleteCheck = (id: string) => {
    const updated = savedChecks.filter((c) => c.id !== id);
    setSavedChecks(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_saved_checks", JSON.stringify(updated));
    }
    toast.info("Deleted saved check.");
  };

  const handleAddCustomAmount = (name: string, amount: number) => {
    const customItem: CartItem = {
      id: `custom-${Date.now()}`,
      baseItemId: "custom",
      external_id: null,
      name,
      basePrice: amount,
      price: amount,
      quantity: 1,
      modifiers: [],
    };
    setCart((prev) => [...prev, customItem]);
    playAudioChime("item");
    toast.success(`Added ${name} ($${amount.toFixed(2)}) to ticket.`);
  };

  const handleOpenDrawer = () => {
    playAudioChime("drawer");
    toast.success("Cash drawer kicked open.");
  };

  const handleSaveSettings = (newSettings: POSSettings) => {
    setSettings(newSettings);
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_settings", JSON.stringify(newSettings));
    }
    toast.success("POS settings saved.");
  };

  const handleToggleSoldOut = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId ? { ...it, isSoldOut: nextStatus } : it,
      ),
    );

    try {
      await api.POST("/pos-simulator/items/toggle-sold-out", {
        body: { itemId, isSoldOut: nextStatus } as any,
      });
      toast.success(
        nextStatus ? "Item marked Sold Out (86)." : "Item marked Available.",
      );
    } catch {
      toast.info(
        nextStatus
          ? "Item updated locally (86)."
          : "Item restored availability locally.",
      );
    }
  };

  const handleVoidRefund = async (
    orderId: string,
    action: "VOID" | "REFUND",
  ) => {
    setPastOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, state: action === "VOID" ? "VOIDED" : "REFUNDED" }
          : o,
      ),
    );

    try {
      await api.PATCH("/pos/orders/{id}/status" as any, {
        params: { path: { id: orderId } },
        body: {
          status: action === "VOID" ? "VOIDED" : "REFUNDED",
          orgId: "d0000000-0000-0000-0000-000000000000",
        },
      });
      toast.success(`Order ${action.toLowerCase()} processed.`);
    } catch {
      toast.success(`Order ${action.toLowerCase()} updated locally.`);
    }
  };

  const handleCheckoutSubmit = async (
    paymentType: string,
    amountTendered: number,
    options?: { printReceipt: boolean; openDrawer: boolean },
  ) => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);

    const {
      subtotal,
      tax,
      total: orderTotal,
    } = calculateTotals(cart, settings.taxRate);
    const changeDue = Math.max(0, amountTendered - orderTotal);

    try {
      const transactionsToInsert = cart.map((item) => ({
        organization_id: "d0000000-0000-0000-0000-000000000000",
        pos_item_id: item.id.startsWith("custom")
          ? null
          : item.id.split("-")[0],
        quantity_sold: item.quantity,
        gross_revenue: item.price * item.quantity,
        transaction_time: new Date().toISOString(),
        source: "pos_register",
      }));

      await api.POST("/pos/transactions/bulk", {
        body: transactionsToInsert as any,
      });

      // Play appropriate sound
      if (options?.openDrawer || paymentType === "cash") {
        playAudioChime("drawer");
      } else {
        playAudioChime("success");
      }

      // Add to local past orders
      const newPastOrder: PastOrder = {
        id: `ord-${Date.now()}`,
        external_id: Math.floor(1000 + Math.random() * 9000).toString(),
        state: "COMPLETED",
        total_money: orderTotal,
        order_type: orderType,
        created_at: new Date().toISOString(),
      };
      setPastOrders((prev) => [newPastOrder, ...prev]);

      // Save receipt data
      const receiptData = {
        items: [...cart],
        orderType,
        subtotal,
        tax,
        total: orderTotal,
        tenderMethod: paymentType,
        amountTendered,
        changeDue,
      };
      setLastReceiptData(receiptData);

      toast.success("Order processed successfully.");
      setCart([]);
      setIsTenderOpen(false);

      if (options?.printReceipt) {
        setIsReceiptOpen(true);
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      toast.error(`Checkout notice: ${message}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      <POSRegisterView
        header={
          <POSAppBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            savedChecksCount={savedChecks.length}
            onOpenSavedChecks={() => setIsSavedChecksOpen(true)}
            onOpenDrawer={handleOpenDrawer}
            onOpenHistory={() => setIsPastOrdersOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLockRegister={() => setIsLocked(true)}
            currentUser={currentUser}
            isAdmin={currentUser?.role === "admin"}
          />
        }
        catalog={
          loading ? (
            <div className="flex min-h-[300px] flex-1 items-center justify-center">
              <span className="text-muted-foreground animate-pulse text-sm font-bold">
                Loading POS Catalog...
              </span>
            </div>
          ) : (
            <POSCatalog
              items={filteredItems}
              categories={categories}
              categoryItems={categoryItems}
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
              layoutGrid={settings.layoutGrid}
              onSearchChange={setSearchQuery}
              onCategorySelect={setSelectedCategory}
              onItemClick={handleItemClick}
              onOpenCustomAmount={() => setIsCustomAmountOpen(true)}
              onItemAction={(item) => {
                setSelectedItemForAction(item);
                setIsItemActionOpen(true);
              }}
            />
          )
        }
        ticket={
          <POSTicket
            items={cart}
            orderType={orderType}
            taxRate={settings.taxRate}
            onSetOrderType={setOrderType}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onSaveCheck={handleSaveCheck}
            onCheckout={() => setIsTenderOpen(true)}
            onOpenCustomAmount={() => setIsCustomAmountOpen(true)}
            isCheckingOut={isCheckingOut}
          />
        }
        pinScreen={
          isLocked ? (
            <POSPinScreen
              onUnlock={(user) => {
                setCurrentUser(user);
                setIsLocked(false);
                toast.success(`Unlocked as ${user.name}.`);
              }}
              correctPin={settings.pinCode || "1234"}
            />
          ) : null
        }
      />

      {/* Modifiers Selection Modal */}
      <POSModifiersModal
        isOpen={isModifiersOpen}
        onClose={() => {
          setIsModifiersOpen(false);
          setSelectedItemForModifiers(null);
        }}
        item={selectedItemForModifiers}
        groups={activeModifiersForModal}
        onSubmit={handleModifierSubmit}
      />

      {/* Tender / Payment Modal */}
      <POSTenderModal
        isOpen={isTenderOpen}
        onClose={() => setIsTenderOpen(false)}
        amountDue={total}
        onSubmit={handleCheckoutSubmit}
      />

      {/* POS Settings Modal */}
      <POSSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onTestPrint={() => {
          window.print();
          toast.success("Sent test print to thermal printer.");
        }}
        onTestCashDrawer={handleOpenDrawer}
      />

      {/* Saved / Held Checks Modal */}
      <POSSavedChecksModal
        isOpen={isSavedChecksOpen}
        onClose={() => setIsSavedChecksOpen(false)}
        savedChecks={savedChecks}
        onResumeCheck={handleResumeCheck}
        onDeleteCheck={handleDeleteCheck}
      />

      {/* Past Orders / History Modal */}
      <POSPastOrdersModal
        isOpen={isPastOrdersOpen}
        onClose={() => setIsPastOrdersOpen(false)}
        orders={pastOrders}
        onVoidRefund={handleVoidRefund}
      />

      {/* Custom Amount Modal */}
      <POSCustomAmountModal
        isOpen={isCustomAmountOpen}
        onClose={() => setIsCustomAmountOpen(false)}
        onAddCustomAmount={handleAddCustomAmount}
      />

      {/* Thermal Receipt Preview Modal */}
      {lastReceiptData && (
        <POSReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          items={lastReceiptData.items}
          orderType={lastReceiptData.orderType}
          subtotal={lastReceiptData.subtotal}
          tax={lastReceiptData.tax}
          total={lastReceiptData.total}
          tenderMethod={lastReceiptData.tenderMethod}
          amountTendered={lastReceiptData.amountTendered}
          changeDue={lastReceiptData.changeDue}
        />
      )}

      {/* Item Quick Action / 86 Modal */}
      <POSItemActionModal
        isOpen={isItemActionOpen}
        onClose={() => {
          setIsItemActionOpen(false);
          setSelectedItemForAction(null);
        }}
        item={selectedItemForAction}
        onToggleSoldOut={handleToggleSoldOut}
      />
    </>
  );
}
POSRegisterContainer.displayName = "POSRegisterContainer";
