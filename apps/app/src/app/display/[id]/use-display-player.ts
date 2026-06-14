import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { supabase } from "../../../lib/supabase";
import { SignageDisplay, PosItem } from "@soustools/api-types";
import { SignageLayout } from "./types";
import { mapDbItemToPosItem, registerDisplayDevice, RawDbSquareItem } from "./helpers";

/**
 * A custom hook to manage the TV signage display player state and socket updates.
 *
 * @tenant-docs-export
 * Displays connect to the central signage service via socket.io to receive live updates.
 * If a display is unregistered, it registers itself automatically.
 *
 * @param displayId - The unique ID or temporary pairing name of the display.
 * @returns An object containing the current display state, layout, items, and loading/error states.
 */
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
      const { data: displayData, error: displayErr } = await supabase
        .from("signage_displays")
        .select("*")
        .eq("id", displayId)
        .single();

      if (displayErr || !displayData) {
        throw new Error(displayErr?.message || "Display not found");
      }

      const displayObj = {
        id: displayData.id,
        organizationId: displayData.organization_id,
        name: displayData.name,
        layoutId: displayData.layout_id,
        pairingCode: displayData.pairing_code,
        isPaired: displayData.is_paired,
        lastSeenAt: displayData.last_seen_at,
        createdAt: displayData.created_at,
      } as SignageDisplay;

      setDisplay(displayObj);
      localStorage.setItem(CACHE_DISPLAY, JSON.stringify(displayObj));

      if (displayObj.isPaired && displayObj.layoutId) {
        const [layoutRes, itemsRes] = await Promise.all([
          supabase
            .from("signage_layouts")
            .select("*")
            .eq("id", displayObj.layoutId)
            .single(),
          supabase
            .from("square_items")
            .select("*")
            .eq("organization_id", displayObj.organizationId),
        ]);

        if (layoutRes.data) {
          setLayout(layoutRes.data as SignageLayout);
          localStorage.setItem(CACHE_LAYOUT, JSON.stringify(layoutRes.data));
        }
        if (itemsRes.data) {
          const parsedItems = (itemsRes.data as RawDbSquareItem[]).map(mapDbItemToPosItem);
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
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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
    const socketUrl = `${window.location.protocol}//${window.location.hostname}:6000`;
    const socket = io(socketUrl, {
      query: { displayId },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      socket.emit("join", { displayId });
    });

    socket.on("layout_updated", () => {
      fetchDisplayAndLayout();
    });

    return () => {
      socket.disconnect();
    };
  }, [displayId, fetchDisplayAndLayout]);

  return { display, layout, items, loading, errorState };
}
