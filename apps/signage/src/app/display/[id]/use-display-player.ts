import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SignageDisplay, PosItem } from "@soustools/api-types";
import { SignageLayout } from "./types";
import { mapDbItemToPosItem, registerDisplayDevice, RawDbSquareItem } from "./helpers";
import { config } from "@soustools/config";

export function useDisplayPlayer(displayId: string) {
  const [display, setDisplay] = useState<SignageDisplay | null>(null);
  const [layout, setLayout] = useState<SignageLayout | null>(null);
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const CACHE_DISPLAY = `display_${displayId}`;
  const CACHE_LAYOUT = `layout_${displayId}`;
  const CACHE_ITEMS = `items_${displayId}`;

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
          const parsedItems = (itemsData.data as RawDbSquareItem[]).map(mapDbItemToPosItem);
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
  }, [displayId]);

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
    const socketUrl = config.API_BASE_URL || window.location.origin;
    const socket = io(socketUrl, {
      query: { displayId, deckId: display?.deckId || "" },
    });

    socket.on("connect", () => {
      socket.emit("join", { displayId, deckId: display?.deckId });
    });

    socket.on("deck_updated", (payload: { deckId: string; config: any }) => {
      if (payload.deckId === display?.deckId) {
        setLayout((prev) => prev ? { ...prev, config: payload.config } : null);
      }
    });

    socket.on("items_updated", (payload: { deckId: string; items: RawDbSquareItem[] }) => {
      if (payload.deckId === display?.deckId && payload.items) {
        const parsedItems = payload.items.map(mapDbItemToPosItem);
        setItems(parsedItems);
      }
    });

    socket.on("layout_updated", () => {
      fetchDisplayAndLayout();
    });

    return () => {
      socket.disconnect();
    };
  }, [displayId, display?.deckId, fetchDisplayAndLayout]);

  return { display, layout, items, loading, errorState };
}
