"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DisplayManager } from "@soustools/domain-signage";
import { SignageDisplay } from "@soustools/api-types";

interface DevicesClientWrapperProps {
  displays: SignageDisplay[];
  layouts: any[];
}

export function DevicesClientWrapper({
  displays,
  layouts,
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

  return (
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
  );
}
