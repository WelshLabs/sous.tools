import React from "react";
import { config } from "@soustools/config";
import { DisplayPlayer } from "./display-player";

export interface DisplayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const resolvedParams = await params;
  const displayId = resolvedParams.id;
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";

  let initialDisplay = null;
  let initialLayout = null;
  let initialItems = [];
  let initialErrorState = null;

  // We only fetch server-side if it's a valid UUID (not a pairing code)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidRegex.test(displayId)) {
    try {
      const displayRes = await fetch(`${baseUrl}/signage/displays/${displayId}`, { cache: "no-store" });
      const displayJson = await displayRes.json();
      
      if (displayJson.success && displayJson.data) {
        const displayData = displayJson.data;
        initialDisplay = {
          id: displayData.id,
          organizationId: displayData.organization_id,
          name: displayData.name,
          deviceId: displayData.device_id ?? null,
          portLabel: displayData.port_label ?? null,
          deckId: displayData.deck_id ?? null,
          lastSeenAt: displayData.last_seen_at,
          createdAt: displayData.created_at,
        };

        if (initialDisplay.deckId) {
          const [layoutRes, itemsRes] = await Promise.all([
            fetch(`${baseUrl}/signage/layouts/${initialDisplay.deckId}`, { cache: "no-store" }),
            fetch(`${baseUrl}/pos-simulator/items?organizationId=${initialDisplay.organizationId}`, { cache: "no-store" }),
          ]);
          
          if (layoutRes.ok) {
            const layoutData = await layoutRes.json();
            if (layoutData.success) initialLayout = layoutData.data;
          }
          if (itemsRes.ok) {
            const itemsData = await itemsRes.json();
            if (itemsData.success) initialItems = itemsData.data || [];
          }
        }
      } else {
        initialErrorState = "Display not found";
      }
    } catch (err) {
      console.warn("Server-side fetch failed:", err);
      // Let client handle offline cache fallback
    }
  }

  return (
    <DisplayPlayer 
      displayId={displayId} 
      initialDisplay={initialDisplay}
      initialLayout={initialLayout}
      initialItems={initialItems}
      initialErrorState={initialErrorState}
    />
  );
}
