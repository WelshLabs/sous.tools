"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DisplayManager } from "@soustools/domain-signage";
import { type SignageDisplay } from "@soustools/api-types";
import { api } from "@/lib/api";

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
    const devices = edgeDevices && edgeDevices.length > 0 ? edgeDevices : [
      { id: "mock-1", name: "Kitchen WearOS", deviceType: "wearos", assignedUser: "Chef Gordon" },
      { id: "mock-2", name: "Prep RPi", deviceType: "rpi", assignedUser: "Line Cook A" }
    ];

    return (
      <div className="mt-12 bg-card text-card-foreground border border-black/5 dark:border-white/10 shadow-sm rounded-2xl p-6">
        <h2 className="text-xl font-bold tracking-wide mb-4">Edge Devices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="pb-3 px-4 font-medium">Device Name</th>
                <th className="pb-3 px-4 font-medium">Type</th>
                <th className="pb-3 px-4 font-medium">Assigned User</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: any) => (
                <tr key={device.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-4 px-4 font-medium">{device.name || "Unknown Device"}</td>
                  <td className="py-4 px-4 text-muted-foreground uppercase text-xs tracking-wider">{device.deviceType || "wearos"}</td>
                  <td className="py-4 px-4 text-muted-foreground">{device.assignedUser || "Unassigned"}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleRevokeDevice(device.id)}
                      className="px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg text-sm font-semibold transition-colors"
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
    <div className="flex flex-col gap-8 w-full h-full pb-20">
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

