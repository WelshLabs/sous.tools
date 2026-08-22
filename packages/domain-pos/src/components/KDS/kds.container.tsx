/* eslint-disable max-lines */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { graphqlClient, createWebSocketClient } from "@soustools/api-client";

import {
  type KDSTicket,
  type KDSTicketItem,
  type KDSSettings,
  type KDSStationFilter,
  type KDSUser,
} from "./kds.types";
import { KDSView } from "./kds.view";
import { KDSSettingsModal, type POSItem } from "./kds-settings-modal";
import { playChime, mapOrderToKDSTicket } from "./kds.helpers";

const GET_POS_ITEMS_QUERY = `
  query GetPosSimulatorItems {
    posSimulatorItems {
      id
      name
      price
      is_sold_out
      square_id
    }
  }
`;

const GET_POS_ORDERS_QUERY = `
  query GetPosOrders {
    posOrders {
      id
      order_number
      state
      total_money
      customer_name
      created_at
      pos_order_line_items {
        id
        name
        quantity
        unit_price
        total_price
        status
        modifiers
      }
    }
  }
`;

const SYNC_SQUARE_MUTATION = `
  mutation SyncSquareCatalog {
    syncSquareCatalog
  }
`;

const UPDATE_LINE_ITEM_STATUS_MUTATION = `
  mutation UpdatePosLineItemStatus($id: String!, $status: String!) {
    updatePosLineItemStatus(id: $id, status: $status)
  }
`;

const UPDATE_ORDER_STATUS_MUTATION = `
  mutation UpdatePosOrderStatus($id: String!, $status: String!) {
    updatePosOrderStatus(id: $id, status: $status)
  }
`;

const TOGGLE_SOLD_OUT_MUTATION = `
  mutation TogglePosItemSoldOut($itemId: String, $isSoldOut: Boolean!) {
    togglePosItemSoldOut(itemId: $itemId, isSoldOut: $isSoldOut) {
      id
      name
    }
  }
`;

const DEFAULT_SETTINGS: KDSSettings = {
  textSize: "md",
  density: "standard",
  soundsEnabled: true,
  soundVolume: 0.5,
  timerAlertSounds: true,
  warningMinutes: 10,
  rushMinutes: 15,
  ticketSortOrder: "oldest_first",
  stationFilter: "ALL",
  autoRefreshInterval: 10,
};

const DEFAULT_STAFF: KDSUser = {
  id: "u-kds",
  name: "Kitchen Expo",
  initials: "KDS",
  role: "kitchen",
};

export function KDSContainer() {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [posItems, setPosItems] = useState<POSItem[]>([]);
  const [orgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<"OPEN" | "CLOSED">("OPEN");

  // Settings state
  const [settings, setSettings] = useState<KDSSettings>(DEFAULT_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncingSquare, setIsSyncingSquare] = useState(false);
  const [currentUser] = useState<KDSUser | null>(DEFAULT_STAFF);

  const previousOpenTicketIdsRef = useRef<Set<string>>(new Set());
  const isInitialLoadRef = useRef(true);

  // Load Settings from LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettingsRaw = localStorage.getItem("kds_settings");
        if (savedSettingsRaw) {
          const parsed = JSON.parse(savedSettingsRaw);
          setSettings((prev) => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to load KDS settings from localStorage", e);
      }
    }
  }, []);

  const triggerSound = useCallback(
    (type: "new" | "complete" | "alert" | "reopen" | "click") => {
      playChime(type, settings.soundsEnabled, settings.soundVolume);
    },
    [settings.soundsEnabled, settings.soundVolume],
  );

  const fetchItems = useCallback(async () => {
    try {
      const res = await graphqlClient.request<{ posSimulatorItems: any[] }>(
        GET_POS_ITEMS_QUERY,
      );
      if (res.data?.posSimulatorItems) {
        setPosItems(res.data.posSimulatorItems as POSItem[]);
      }
    } catch (err) {
      console.error("Failed to fetch pos items", err);
    }
  }, []);

  const fetchOrders = useCallback(
    async (silent = false) => {
      try {
        const res = await graphqlClient.request<{ posOrders: any[] }>(
          GET_POS_ORDERS_QUERY,
        );
        const payload = res.data?.posOrders || [];
        if (Array.isArray(payload)) {
          const mappedTickets = payload.map(mapOrderToKDSTicket);

          const currentOpenIds = new Set(
            mappedTickets.filter((t) => t.status === "OPEN").map((t) => t.id),
          );

          if (!isInitialLoadRef.current && !silent) {
            let hasNewTicket = false;
            for (const id of currentOpenIds) {
              if (!previousOpenTicketIdsRef.current.has(id)) {
                hasNewTicket = true;
                break;
              }
            }
            if (hasNewTicket) {
              triggerSound("new");
              toast.info("New kitchen order received!");
            }
          }

          previousOpenTicketIdsRef.current = currentOpenIds;
          isInitialLoadRef.current = false;
          setTickets(mappedTickets);
        }
      } catch (err) {
        console.error("Failed to fetch pos orders", err);
      }
    },
    [triggerSound],
  );

  // Initial Data Fetch & WebSocket Setup
  useEffect(() => {
    Promise.all([fetchItems(), fetchOrders(true)]).finally(() =>
      setLoading(false),
    );

    const socket = createWebSocketClient({
      namespace: "/pos",
      query: { orgId },
    });

    socket.on("orders_updated", () => {
      fetchOrders();
    });

    socket.on("catalog_updated", () => {
      fetchItems();
    });

    return () => {
      socket.disconnect();
    };
  }, [orgId, fetchItems, fetchOrders]);

  // Auto-refresh fallback polling
  useEffect(() => {
    if (settings.autoRefreshInterval <= 0) return;
    const intervalMs = settings.autoRefreshInterval * 1000;
    const intervalId = setInterval(() => {
      fetchOrders(true);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [settings.autoRefreshInterval, fetchOrders]);

  // Handle Manual Square Sync
  const handleSyncSquare = async () => {
    setIsSyncingSquare(true);
    try {
      await graphqlClient.request(SYNC_SQUARE_MUTATION);
      await Promise.all([fetchItems(), fetchOrders(false)]);
      toast.success("Square orders & catalog synchronized.");
      triggerSound("click");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Square sync error: ${msg}`);
    } finally {
      setIsSyncingSquare(false);
    }
  };

  // Handle Save Settings
  const handleSaveSettings = (newSettings: KDSSettings) => {
    setSettings(newSettings);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("kds_settings", JSON.stringify(newSettings));
      } catch (e) {
        console.error("Failed to save KDS settings to localStorage", e);
      }
    }
    toast.success("KDS settings saved and applied.");
  };

  // Handle Toggle Line Item
  const handleToggleLineItem = async (
    ticketId: string,
    item: KDSTicketItem,
  ) => {
    const nextStatus: "OPEN" | "COMPLETED" =
      item.status === "COMPLETED" ? "OPEN" : "COMPLETED";

    triggerSound("click");

    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id !== ticketId) return ticket;
        const updatedItems = ticket.items.map((i) =>
          i.id === item.id ? { ...i, status: nextStatus } : i,
        );
        const allDone = updatedItems.every((i) => i.status === "COMPLETED");
        return {
          ...ticket,
          items: updatedItems,
          status: allDone ? "CLOSED" : "OPEN",
          closedAt: allDone ? new Date().toISOString() : null,
        };
      }),
    );

    try {
      if (!item.id.startsWith("fallback-")) {
        await graphqlClient.request(UPDATE_LINE_ITEM_STATUS_MUTATION, {
          id: item.id,
          status: nextStatus,
        });
      }
      toast.success(`Marked ${item.name} as ${nextStatus.toLowerCase()}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update item status: ${msg}`);
    }
  };

  // Handle Complete Ticket
  const handleCompleteTicket = async (ticketId: string) => {
    const t = tickets.find((ticket) => ticket.id === ticketId);
    if (!t) return;

    triggerSound("complete");

    const nowIso = new Date().toISOString();
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: "CLOSED",
              closedAt: nowIso,
              items: ticket.items.map((i) => ({ ...i, status: "COMPLETED" })),
            }
          : ticket,
      ),
    );

    try {
      await graphqlClient.request(UPDATE_ORDER_STATUS_MUTATION, {
        id: ticketId,
        status: "COMPLETED",
      });
      toast.success(`Ticket #${t.ticketNumber} completed.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Completed locally, DB error: ${msg}`);
    }
  };

  // Handle Re-open Ticket
  const handleReopenTicket = async (ticketId: string) => {
    const t = tickets.find((ticket) => ticket.id === ticketId);
    if (!t) return;

    triggerSound("reopen");

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: "OPEN",
              closedAt: null,
              items: ticket.items.map((i) => ({ ...i, status: "OPEN" })),
            }
          : ticket,
      ),
    );

    try {
      await graphqlClient.request(UPDATE_ORDER_STATUS_MUTATION, {
        id: ticketId,
        status: "OPEN",
      });
      toast.success(`Ticket #${t.ticketNumber} re-opened to active queue.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Re-opened locally, DB error: ${msg}`);
    }
  };

  // Handle 86 / Sold Out Item Toggle
  const handleToggleSoldOut = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    try {
      await graphqlClient.request(TOGGLE_SOLD_OUT_MUTATION, {
        itemId,
        isSoldOut: nextStatus,
      });
      setPosItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_sold_out: nextStatus } : item,
        ),
      );
      toast.success(
        nextStatus ? "Item marked Sold Out (86)." : "Item marked Available.",
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update item availability: ${msg}`);
    }
  };

  // Sort and filter tickets according to settings
  const sortedTickets = [...tickets].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return settings.ticketSortOrder === "oldest_first"
      ? aTime - bTime
      : bTime - aTime;
  });

  const getOpenTicketsPrepSummary = (): Array<[string, number]> => {
    const counts: Record<string, number> = {};
    tickets
      .filter((t) => t.status === "OPEN")
      .forEach((t) => {
        t.items
          .filter((i) => i.status !== "COMPLETED")
          .forEach((item) => {
            counts[item.name] = (counts[item.name] || 0) + item.qty;
          });
      });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  };

  if (loading) {
    return (
      <div className="bg-background text-foreground flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="border-border h-10 w-10 animate-spin rounded-full border-4 border-t-sky-500" />
          <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
            Loading Kitchen Display System...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      <KDSView
        tickets={sortedTickets}
        viewFilter={viewFilter}
        onSetViewFilter={setViewFilter}
        onOpenSettings={() => setShowSettings(true)}
        onCompleteTicket={handleCompleteTicket}
        onReopenTicket={handleReopenTicket}
        onToggleLineItem={handleToggleLineItem}
        onSyncSquare={handleSyncSquare}
        isSyncingSquare={isSyncingSquare}
        stationFilter={settings.stationFilter}
        onSelectStation={(st: KDSStationFilter) =>
          handleSaveSettings({ ...settings, stationFilter: st })
        }
        allDayPrep={getOpenTicketsPrepSummary()}
        density={settings.density}
        textSize={settings.textSize}
        warningMinutes={settings.warningMinutes}
        rushMinutes={settings.rushMinutes}
        currentUser={currentUser}
        isAdmin={currentUser?.role === "admin" || true}
      />
      <KDSSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        posItems={posItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSoldOut={handleToggleSoldOut}
        onSyncSquare={handleSyncSquare}
        isSyncingSquare={isSyncingSquare}
      />
    </>
  );
}
KDSContainer.displayName = "KDSContainer";
