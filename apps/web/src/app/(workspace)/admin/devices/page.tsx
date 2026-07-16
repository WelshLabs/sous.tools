import React from "react";
import { config } from "@soustools/config";
import { createApiClient } from "@soustools/api-client";
import { DevicesClientWrapper } from "./devices-client-wrapper";

export const dynamic = 'force-dynamic';

/**
 * DevicesPage mounts the signage physical displays pairing and status manager.
 */
export default async function DevicesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";
  const serverApi = createApiClient({ baseUrl });

  let displays = [];
  let layouts = [];
  const edgeDevices: any[] = []; // Uses fallback mock edge devices since list endpoint is not implemented on API

  try {
    const [dispRes, layRes] = await Promise.all([
      (serverApi as any).GET("/signage/displays", { cache: "no-store" }),
      (serverApi as any).GET("/signage/layouts", { cache: "no-store" }),
    ]);

    if (dispRes && dispRes.data) {
      displays = (dispRes.data as any).data || [];
    }

    if (layRes && layRes.data) {
      layouts = (layRes.data as any).data || [];
    }
  } catch (err) {
    console.error("Failed to fetch signage displays/layouts:", err);
  }

  return <DevicesClientWrapper displays={displays} layouts={layouts} edgeDevices={edgeDevices} />;
}
