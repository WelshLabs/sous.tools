import React from "react";
import { config } from "@soustools/config";
import { DevicesClientWrapper } from "./devices-client-wrapper";

/**
 * DevicesPage mounts the signage physical displays pairing and status manager.
 */
export default async function DevicesPage() {
  const baseUrl = config.API_BASE_URL || "http://127.0.0.1:6001";

  let displays = [];
  let layouts = [];

  try {
    const [dispRes, layRes] = await Promise.all([
      fetch(`${baseUrl}/signage/displays`, { cache: "no-store" }),
      fetch(`${baseUrl}/signage/layouts`, { cache: "no-store" }),
    ]);

    if (dispRes.ok) {
      const data = await dispRes.json();
      displays = data.data || [];
    }

    if (layRes.ok) {
      const data = await layRes.json();
      layouts = data.data || [];
    }
  } catch (err) {
    console.error("Failed to fetch signage displays/layouts:", err);
  }

  return <DevicesClientWrapper displays={displays} layouts={layouts} />;
}
