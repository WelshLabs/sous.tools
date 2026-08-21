/* eslint-disable max-lines */
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { api, createWebSocketClient } from "@soustools/api-client";

type UntypedClient = {
  PATCH: (
    path: string,
    options?: unknown,
  ) => Promise<{ data?: unknown; error?: unknown }>;
  POST: (
    path: string,
    options?: unknown,
  ) => Promise<{ data?: unknown; error?: unknown }>;
  GET: (
    path: string,
    options?: unknown,
  ) => Promise<{ data?: unknown; error?: unknown }>;
};
const dynamicApi = api as unknown as UntypedClient;
import { type KDSTicket, type KDSTicketItem } from "./kds.types";
import { KDSView } from "./kds.view";
import { KDSSettingsModal, type POSItem } from "./kds-settings-modal";
import { playChime as triggerChime, mapOrderToKDSTicket } from "./kds.helpers";

export function KDSContainer() {
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [posItems, setPosItems] = useState<POSItem[]>([]);
  const [orgId] = useState<string>("d0000000-0000-0000-0000-000000000000");
  const [loading, setLoading] = useState(true);
  const [viewFilter, setViewFilter] = useState<"OPEN" | "CLOSED">("OPEN");

  const [showSettings, setShowSettings] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "md" | "lg">("md");
  const [density, setDensity] = useState<"compact" | "standard" | "spacious">(
    "standard",
  );
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [searchQuery, setSearchQuery] = useState("");

  const playChime = (type: "new" | "complete") =>
    triggerChime(type, soundsEnabled, soundVolume);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedText = localStorage.getItem("kds_text_size") as
        "sm" | "md" | "lg" | null;
      const savedDensity = localStorage.getItem("kds_density") as
        "compact" | "standard" | "spacious" | null;
      const savedSound = localStorage.getItem("kds_sounds_enabled");
      const savedVol = localStorage.getItem("kds_sound_volume");
      if (savedText) setTextSize(savedText);
      if (savedDensity) setDensity(savedDensity);
      if (savedSound) setSoundsEnabled(savedSound === "true");
      if (savedVol) setSoundVolume(parseFloat(savedVol));
    }

    const fetchItems = async () => {
      try {
        const { data } = await api.GET("/pos-simulator/items", {
          params: { query: { organizationId: orgId } },
        });
        if (data)
          setPosItems(
            ((data as Record<string, unknown>).data as POSItem[]) || data || [],
          );
      } catch (err) {
        console.error("Failed to fetch pos items", err);
      }
    };

    const fetchOrders = async () => {
      try {
        const { data, error } = await api.GET("/pos/orders", {
          params: { query: { orgId } },
        });
        if (!error && data) {
          const payload = (data as Record<string, unknown>).data || data;
          if (Array.isArray(payload)) {
            setTickets(payload.map(mapOrderToKDSTicket));
          }
        }
      } catch (err) {
        console.error("Failed to fetch pos orders", err);
      }
    };

    Promise.all([fetchItems(), fetchOrders()]).then(() => setLoading(false));

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
  }, [orgId]);

  const handleToggleLineItem = async (
    ticketId: string,
    item: KDSTicketItem,
  ) => {
    const nextStatus: "OPEN" | "COMPLETED" =
      item.status === "COMPLETED" ? "OPEN" : "COMPLETED";

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
          status: allDone ? "CLOSED" : ticket.status,
        };
      }),
    );

    try {
      if (!item.id.startsWith("fallback-")) {
        await dynamicApi.PATCH("/pos/order-line-items/" + item.id + "/status", {
          params: { path: { id: item.id } },
          body: { status: nextStatus },
        });
      }
      toast.success(`Marked ${item.name} as ${nextStatus.toLowerCase()}.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update item status: ${msg}`);
    }
  };

  const handleCompleteTicket = async (ticketId: string) => {
    const t = tickets.find((ticket) => ticket.id === ticketId);
    if (!t) return;

    playChime("complete");

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: "CLOSED",
              items: ticket.items.map((i) => ({ ...i, status: "COMPLETED" })),
            }
          : ticket,
      ),
    );

    try {
      const { error } = await dynamicApi.PATCH(
        "/pos/orders/" + ticketId + "/status",
        {
          params: { path: { id: ticketId } },
          body: { status: "COMPLETED", orgId },
        },
      );
      if (error) throw new Error("Failed to update ticket status");
      toast.success(`Ticket #${t.ticketNumber} completed.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Completed locally, DB error: ${msg}`);
    }
  };

  const handleToggleSoldOut = async (
    itemId: string,
    currentStatus: boolean,
  ) => {
    const nextStatus = !currentStatus;
    try {
      const { error } = await dynamicApi.POST(
        "/pos-simulator/items/toggle-sold-out",
        {
          body: { itemId, isSoldOut: nextStatus },
        },
      );
      if (error) throw new Error("Failed to update item");
      setPosItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_sold_out: nextStatus } : item,
        ),
      );
      toast.success("Updated item availability.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Failed to update item availability: ${msg}`);
    }
  };

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
      <div className="dark:bg-card flex min-h-screen items-center justify-center bg-zinc-50 text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-sky-500 dark:border-white/10" />
      </div>
    );
  }

  return (
    <>
      <KDSView
        tickets={tickets}
        viewFilter={viewFilter}
        onSetViewFilter={setViewFilter}
        onOpenSettings={() => setShowSettings(true)}
        onCompleteTicket={handleCompleteTicket}
        onToggleLineItem={handleToggleLineItem}
        allDayPrep={getOpenTicketsPrepSummary()}
        density={density}
        textSize={textSize}
      />
      <KDSSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundsEnabled={soundsEnabled}
        onToggleSounds={(e) => {
          setSoundsEnabled(e);
          localStorage.setItem("kds_sounds_enabled", String(e));
        }}
        soundVolume={soundVolume}
        onChangeVolume={(v) => {
          setSoundVolume(v);
          localStorage.setItem("kds_sound_volume", String(v));
        }}
        textSize={textSize}
        onChangeTextSize={(sz) => {
          setTextSize(sz);
          localStorage.setItem("kds_text_size", sz);
        }}
        density={density}
        onChangeDensity={(d) => {
          setDensity(d);
          localStorage.setItem("kds_density", d);
        }}
        posItems={posItems}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleSoldOut={handleToggleSoldOut}
      />
    </>
  );
}
KDSContainer.displayName = "KDSContainer";
