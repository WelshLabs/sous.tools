import React from "react";
import { config } from "@soustools/config";
import { DevicesClientWrapper } from "./devices-client-wrapper";

export const dynamic = 'force-dynamic';

/**
 * DevicesPage mounts the signage physical displays pairing and status manager.
 */
export default async function DevicesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";

  let displays = [];
  let layouts = [];
  let edgeDevices = [];

  try {
    const [dispRes, layRes, devRes] = await Promise.all([
      fetch(`${baseUrl}/signage/displays`, { cache: "no-store" }),
      fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" }),
      fetch(`${baseUrl}/devices`, { cache: "no-store" }),
    ]);

    if (dispRes.ok) {
      const data = await dispRes.json();
      displays = data.data || [];
    }

    if (layRes.ok) {
      const data = await layRes.json();
      layouts = data.data || [];
    }

    if (devRes.ok) {
      const data = await devRes.json();
      edgeDevices = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch signage displays/layouts/devices:", err);
  }

  return <DevicesClientWrapper displays={displays} layouts={layouts} edgeDevices={edgeDevices} />;
}
