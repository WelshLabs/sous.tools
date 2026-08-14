"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DisplayManager } from "@soustools/domain-signage";
import { type SignageDisplay } from "@soustools/api-types";
import { api } from "@soustools/api-client";

interface DevicesClientWrapperProps {
  displays: SignageDisplay[];
  layouts: any[];
  edgeDevices?: any[];
}

export function DevicesClientWrapper({
  displays,
  layouts,
  edgeDevices,
}: DevicesClientWrapperProps) {
  const router = useRouter();

  const handleAddBrowserDisplay = async (name: string) => {
    await (api as any).POST("/signage/displays", {
      body: { name },
    });
    router.refresh();
  };

  const handleDeleteDisplay = async (id: string) => {
    await api.DELETE("/signage/displays/{id}", {
      params: { path: { id } },
    });
    router.refresh();
  };

  const handleAssignDeck = async (displayId: string, deckId: string | null) => {
    await (api as any).PUT("/signage/displays/{id}", {
      params: { path: { id: displayId } },
      body: { deckId: deckId || undefined },
    });
    router.refresh();
  };

  const handlePairDisplay = async (code: string) => {
    await (api as any).POST("/signage/displays/pair/confirm", {
      body: { pairingCode: code, name: "New TV Display" },
    });
    router.refresh();
  };

  const handleSaveDevice = async (deviceId: string, payload: any) => {
    await (api as any).PUT("/devices/{deviceId}", {
      params: { path: { deviceId } },
      body: payload,
    });
    router.refresh();
  };

  const handleFetchDevice = async (deviceId: string) => {
    const { data } = await api.GET("/devices/{deviceId}", {
      params: { path: { deviceId } },
    });
    return (data as any)?.data;
  };

  const handleRevokeDevice = async (id: string) => {
    await api.POST("/devices/{id}/revoke", {
      params: { path: { id } },
    });
    router.refresh();
  };

  const renderEdgeDevices = () => {
    const devices =
      edgeDevices && edgeDevices.length > 0
        ? edgeDevices
        : [
            {
              id: "mock-1",
              name: "Kitchen WearOS",
              deviceType: "wearos",
              assignedUser: "Chef Gordon",
            },
            {
              id: "mock-2",
              name: "Prep RPi",
              deviceType: "rpi",
              assignedUser: "Line Cook A",
            },
          ];

    return (
      <div className="bg-card text-card-foreground mt-12 rounded-2xl border border-black/5 p-6 shadow-sm dark:border-white/10">
        <h2 className="mb-4 text-xl font-bold tracking-wide">Edge Devices</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-sm">
                <th className="px-4 pb-3 font-medium">Device Name</th>
                <th className="px-4 pb-3 font-medium">Type</th>
                <th className="px-4 pb-3 font-medium">Assigned User</th>
                <th className="px-4 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: any) => (
                <tr
                  key={device.id}
                  className="border-border hover:bg-muted/50 border-b"
                >
                  <td className="px-4 py-4 font-medium">
                    {device.name || "Unknown Device"}
                  </td>
                  <td className="text-muted-foreground px-4 py-4 text-xs tracking-wider uppercase">
                    {device.deviceType || "wearos"}
                  </td>
                  <td className="text-muted-foreground px-4 py-4">
                    {device.assignedUser || "Unassigned"}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors"
                    >
                      Revoke Access
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col gap-8 pb-20">
      <DisplayManager
        displays={displays}
        layouts={layouts}
        onAddBrowserDisplay={handleAddBrowserDisplay}
        onDeleteDisplay={handleDeleteDisplay}
        onAssignDeck={handleAssignDeck}
        onPairDisplay={handlePairDisplay}
        onSaveDevice={handleSaveDevice}
        onFetchDevice={handleFetchDevice}
        onRefreshData={() => router.refresh()}
      />
      {renderEdgeDevices()}
    </div>
  );
}
