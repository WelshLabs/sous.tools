import React from "react";
import { clientConfig as config } from "@soustools/config/client";
import { createApiClient } from "@soustools/api-client";
import { DevicesManagerContainer } from "@soustools/domain-signage";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  const serverApi = createApiClient({ baseUrl: config.NEXT_PUBLIC_API_URL });

  let displays = [];
  let layouts = [];
  const edgeDevices: any[] = [];

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

  return (
    <DevicesManagerContainer
      displays={displays}
      layouts={layouts}
      edgeDevices={edgeDevices}
    />
  );
}
