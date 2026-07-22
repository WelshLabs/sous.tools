import { useEffect, useState, useCallback, useMemo } from "react";
import { type SignageDisplay, type PosItem, type SignageLayoutConfig } from "@soustools/api-types";
import { type SignageLayout } from "./types";
import { mapDbItemToPosItem, registerDisplayDevice, type RawDbPosItem } from "./helpers";
import { createWebSocketClient } from "@soustools/api-client";

export function useDisplayPlayer(
  displayId: string,
  initialDisplay?: SignageDisplay | null,
  initialLayout?: SignageLayout | null,
  initialItems?: RawDbPosItem[],
  initialErrorState?: string | null
) {
  const [display, setDisplay] = useState<SignageDisplay | null>(initialDisplay || null);
  const [layout, setLayout] = useState<SignageLayout | null>(initialLayout || null);
  const [items, setItems] = useState<PosItem[]>(() => {
    if (initialItems && initialItems.length > 0) {
      return initialItems.map(mapDbItemToPosItem);
    }
    return [];
  });
  const [loading, setLoading] = useState(!initialDisplay && !initialErrorState);
  const [errorState, setErrorState] = useState<string | null>(initialErrorState || null);

  const CACHE_DISPLAY = useMemo(() => `display_${displayId}`, [displayId]);
  const CACHE_LAYOUT = useMemo(() => `layout_${displayId}`, [displayId]);
  const CACHE_ITEMS = useMemo(() => `items_${displayId}`, [displayId]);

  const fetchDisplayAndLayout = useCallback(async () => {
    try {
      const displayRes = await fetch(`/api/signage/displays/${displayId}`);
      const displayJson = await displayRes.json();
      if (!displayJson.success || !displayJson.data) {
        throw new Error("Display not found");
      }
      const displayData = displayJson.data;

      const displayObj = {
        id: displayData.id,
        organizationId: displayData.organization_id,
        name: displayData.name,
        deviceId: displayData.device_id ?? null,
        portLabel: displayData.port_label ?? null,
        deckId: displayData.deck_id ?? null,
        lastSeenAt: displayData.last_seen_at,
        createdAt: displayData.created_at,
      } as SignageDisplay;

      setDisplay(displayObj);
      localStorage.setItem(CACHE_DISPLAY, JSON.stringify(displayObj));

      if (displayObj.deckId) {
        const [layoutRes, itemsRes] = await Promise.all([
          fetch(`/api/signage/layouts/${displayObj.deckId}`),
          fetch(`/api/pos/items?organizationId=${displayObj.organizationId}`),
        ]);
        const layoutData = await layoutRes.json();
        const itemsData = await itemsRes.json();

        if (layoutData.success && layoutData.data) {
          setLayout(layoutData.data as SignageLayout);
          localStorage.setItem(CACHE_LAYOUT, JSON.stringify(layoutData.data));
        }
        if (itemsData.success && itemsData.data) {
          const parsedItems = (itemsData.data as RawDbPosItem[]).map(mapDbItemToPosItem);
          setItems(parsedItems);
          localStorage.setItem(CACHE_ITEMS, JSON.stringify(parsedItems));
        }
      }
      setLoading(false);
    } catch (err) {
      console.warn("Network fetch failed, loading from offline cache:", err);
      const cachedDisp = localStorage.getItem(CACHE_DISPLAY);
      const cachedLay = localStorage.getItem(CACHE_LAYOUT);
      const cachedItms = localStorage.getItem(CACHE_ITEMS);

      if (cachedDisp) {
        setDisplay(JSON.parse(cachedDisp));
        if (cachedLay) setLayout(JSON.parse(cachedLay));
        if (cachedItms) setItems(JSON.parse(cachedItms));
        setLoading(false);
      } else {
        setErrorState(err instanceof Error ? err.message : "Fetch failed");
        setLoading(false);
      }
    }
  }, [CACHE_DISPLAY, CACHE_LAYOUT, CACHE_ITEMS, displayId]);

  useEffect(() => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(displayId)) {
      registerDisplayDevice(displayId)
        .then((newId) => {
          if (newId) {
            window.location.href = `/display/${newId}`;
          } else {
            setErrorState("Failed to register display device");
            setLoading(false);
          }
        })
        .catch((err) => {
          setErrorState(`Registration error: ${err instanceof Error ? err.message : String(err)}`);
          setLoading(false);
        });
    } else {
      fetchDisplayAndLayout();
    }
  }, [displayId, fetchDisplayAndLayout]);

  useEffect(() => {
    const socket = createWebSocketClient({
      query: { displayId, deckId: display?.deckId || "" },
    });

    const handleConnect = () => {
      socket.emit("join", { displayId, deckId: display?.deckId });
    };

    const handleDeckUpdated = (payload: { deckId: string; config: SignageLayoutConfig }) => {
      if (payload.deckId === display?.deckId) {
        setLayout((prev) => (prev ? { ...prev, config: payload.config } : null));
      }
    };

    const handleItemsUpdated = (payload: { deckId: string; items: RawDbPosItem[] }) => {
      if (payload.deckId === display?.deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    };

    const handleLayoutUpdated = () => {
      fetchDisplayAndLayout();
    };

    socket.on("connect", handleConnect);
    socket.on("deck_updated", handleDeckUpdated);
    socket.on("items_updated", handleItemsUpdated);
    socket.on("layout_updated", handleLayoutUpdated);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("deck_updated", handleDeckUpdated);
      socket.off("items_updated", handleItemsUpdated);
      socket.off("layout_updated", handleLayoutUpdated);
      socket.disconnect();
    };
  }, [displayId, display?.deckId, fetchDisplayAndLayout]);

  return { display, layout, items, loading, errorState };
}
