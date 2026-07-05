"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DisplayManager } from "@soustools/domain-signage";
import { SignageDisplay } from "@soustools/api-types";

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
    await fetch("/api/signage/displays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    router.refresh();
  };

  const handleDeleteDisplay = async (id: string) => {
    await fetch(`/api/signage/displays/${id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleAssignDeck = async (displayId: string, deckId: string | null) => {
    await fetch(`/api/signage/displays/${displayId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deckId }),
    });
    router.refresh();
  };

  const handlePairDisplay = async (code: string) => {
    await fetch("/api/signage/displays/pair/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pairingCode: code, name: "New TV Display" }),
    });
    router.refresh();
  };

  const handleSaveDevice = async (deviceId: string, payload: any) => {
    await fetch(`/api/signage/devices/${deviceId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    router.refresh();
  };

  const handleFetchDevice = async (deviceId: string) => {
    const res = await fetch(`/api/signage/devices/${deviceId}`);
    const data = await res.json();
    return data.data;
  };

  const handleRevokeDevice = async (id: string) => {
    await fetch(`/api/devices/${id}/revoke`, { method: "POST" });
    router.refresh();
  };

  const renderEdgeDevices = () => {
    const devices = edgeDevices && edgeDevices.length > 0 ? edgeDevices : [
      { id: "mock-1", name: "Kitchen WearOS", deviceType: "wearos", assignedUser: "Chef Gordon" },
      { id: "mock-2", name: "Prep RPi", deviceType: "rpi", assignedUser: "Line Cook A" }
    ];

    return (
      <div className="mt-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white tracking-wide mb-4">Edge Devices</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-sm">
                <th className="pb-3 px-4 font-medium">Device Name</th>
                <th className="pb-3 px-4 font-medium">Type</th>
                <th className="pb-3 px-4 font-medium">Assigned User</th>
                <th className="pb-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device: any) => (
                <tr key={device.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="py-4 px-4 text-zinc-300 font-medium">{device.name || "Unknown Device"}</td>
                  <td className="py-4 px-4 text-zinc-400 uppercase text-xs tracking-wider">{device.deviceType || "wearos"}</td>
                  <td className="py-4 px-4 text-zinc-400">{device.assignedUser || "Unassigned"}</td>
                  <td className="py-4 px-4 text-right">
                    <button 
                      onClick={() => handleRevokeDevice(device.id)}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-colors border border-red-500/20"
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
