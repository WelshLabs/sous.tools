import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SignageDisplay, PosItem, SignageLayoutConfig } from "@soustools/api-types";
import { SignageLayout } from "./types";
import { mapDbItemToPosItem, registerDisplayDevice, RawDbPosItem } from "./helpers";
import { config } from "@soustools/config";

export function useDisplayPlayer(displayId: string) {
  const [display, setDisplay] = useState<SignageDisplay | null>(null);
  const [layout, setLayout] = useState<SignageLayout | null>(null);
  const [items, setItems] = useState<PosItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [isPaired, setIsPaired] = useState<boolean>(true); // assume true until we check
  const [, setTenantConfig] = useState<{ url: string; key: string; orgId: string } | null>(null);

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
        const headers: Record<string, string> = {};
        const configStr = localStorage.getItem("tenantConfig");
        if (configStr) {
          const conf = JSON.parse(configStr);
          headers["x-organization-id"] = conf.orgId; // if backend needs it, or use standard auth
        }

        const [layoutRes, itemsRes] = await Promise.all([
          fetch(`/api/signage/layouts/${displayObj.deckId}`, { headers }),
          fetch(`/api/pos/items?organizationId=${displayObj.organizationId}`, { headers }),
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
  }, [displayId]);

  useEffect(() => {
    // 1. Check if we have tenant config
    const storedConfig = localStorage.getItem("tenantConfig");
    if (storedConfig) {
      setTenantConfig(JSON.parse(storedConfig));
      setIsPaired(true);
      fetchDisplayAndLayout();
      return;
    }

    // 2. We don't have tenant config, we are unpaired.
    setIsPaired(false);
    
    const checkRegistration = async () => {
      let storedDeviceId = localStorage.getItem("deviceId");
      let storedPairingCode = localStorage.getItem("pairingCode");

      if (!storedDeviceId || !storedPairingCode) {
        // Prevent race condition if two displays load simultaneously
        if (localStorage.getItem("registering") === "true") {
          setTimeout(checkRegistration, 1000);
          return;
        }
        localStorage.setItem("registering", "true");
        
        try {
          const result = await registerDisplayDevice();
          if (result) {
            storedDeviceId = result.deviceId;
            storedPairingCode = result.pairingCode;
            localStorage.setItem("deviceId", storedDeviceId);
            localStorage.setItem("pairingCode", storedPairingCode);
          } else {
            setErrorState("Failed to register device");
          }
        } catch (err) {
          setErrorState(`Registration error: ${err instanceof Error ? err.message : String(err)}`);
        } finally {
          localStorage.removeItem("registering");
        }
      }

      setDeviceId(storedDeviceId);
      setPairingCode(storedPairingCode);
      setLoading(false);
    };

    checkRegistration();
  }, [fetchDisplayAndLayout]);

  useEffect(() => {
    const socketUrl = config.API_BASE_URL || window.location.origin;
    
    // If not paired, connect to the pairing room
    if (!isPaired && deviceId) {
      const socket = io(socketUrl, { query: { pairingDeviceId: deviceId } });
      socket.on("device_paired", async (payload: any) => {
        if (payload.deviceId === deviceId) {
          const newConfig = { url: payload.supabaseUrl, key: payload.supabaseAnonKey, orgId: payload.orgId };
          localStorage.setItem("tenantConfig", JSON.stringify(newConfig));
          setTenantConfig(newConfig);
          
          // Save to local filesystem for host daemon (sync-watchtower)
          try {
            await fetch("/api/config", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                supabaseUrl: payload.supabaseUrl, 
                supabaseAnonKey: payload.supabaseAnonKey, 
                orgId: payload.orgId, 
                deviceId: payload.deviceId 
              })
            });
          } catch (err) {
            console.error("Failed to save tenant config to host volume", err);
          }

          setIsPaired(true);
          window.location.reload(); // Refresh to ensure clean state
        }
      });
      return () => { socket.disconnect(); };
    }

    // If paired, connect to regular rooms
    if (isPaired && display) {
      const socket = io(socketUrl, {
        query: { displayId, deckId: display?.deckId || "" },
      });

      socket.on("connect", () => {
        socket.emit("join", { displayId, deckId: display?.deckId });
      });

      socket.on("deck_updated", (payload: { deckId: string; config: SignageLayoutConfig }) => {
        if (payload.deckId === display?.deckId) {
          setLayout((prev) => prev ? { ...prev, config: payload.config } : null);
        }
      });

      socket.on("items_updated", (payload: { deckId: string; items: RawDbPosItem[] }) => {
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
    }
  }, [displayId, display?.deckId, isPaired, deviceId, fetchDisplayAndLayout]);

  return { display, layout, items, loading, errorState, isPaired, pairingCode };
}
