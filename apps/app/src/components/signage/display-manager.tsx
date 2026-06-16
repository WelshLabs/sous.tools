"use client";

import React, { useState, useEffect } from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Monitor, Plus, RefreshCw } from "lucide-react";
import { PairDisplayDialog } from "./pair-display-dialog";
import { DisplayCard } from "./display-card";
import { DeviceSettingsDialog } from "./device-settings-dialog";
import { mapDisplay, isOnline } from "./display-utils";

/**
 * DisplayManager lists all display terminals, showing their status,
 * paired devices, and active deck assignments.
 *
 * @tenant-docs-export
 * Manage display configurations, pair new TV hardware, or configure devices settings.
 */
export const DisplayManager: React.FC = () => {
  const [displays, setDisplays] = useState<SignageDisplay[]>([]);
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPairModal, setShowPairModal] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    try {
      const [dispRes, deckRes] = await Promise.all([
        fetch("/api/signage/displays").then((r) => r.json()),
        fetch("/api/signage/layouts").then((r) => r.json()),
      ]);
      if (dispRes.success) {
        const rawList = dispRes.data || [];
        setDisplays(
          rawList.map((d: any) => mapDisplay(d)).filter(Boolean) as SignageDisplay[]
        );
      }
      if (deckRes.success) setDecks(deckRes.data || []);
    } catch (err) {
      console.error("Failed to load display manager data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeckAssign = async (displayId: string, deckId: string | null) => {
    try {
      const res = await fetch(`/api/signage/displays/${displayId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckId }),
      });
      const data = await res.json();
      if (data.success) {
        const mapped = mapDisplay(data.data);
        if (mapped) {
          setDisplays((prev) => prev.map((d) => (d.id === displayId ? mapped : d)));
        }
      } else {
        alert(data.error || "Failed to assign deck");
      }
    } catch (err) {
      console.error("Failed to assign deck", err);
      alert("Network error: Failed to assign deck");
    }
  };

  const handleAddBrowserDisplay = async () => {
    const name = prompt("Enter standalone browser display name:", "Browser View");
    if (!name) return;
    try {
      const res = await fetch("/api/signage/displays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        const mapped = mapDisplay(data.data);
        if (mapped) {
          setDisplays((prev) => [...prev, mapped]);
        }
      } else {
        alert(data.error || "Failed to add browser display");
      }
    } catch (err) {
      console.error("Failed to add browser display", err);
      alert("Network error: Failed to add browser display");
    }
  };

  const handleDeleteDisplay = async (id: string) => {
    if (!confirm("Remove this display terminal?")) return;
    try {
      const res = await fetch(`/api/signage/displays/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setDisplays((prev) => prev.filter((d) => d.id !== id));
      } else {
        alert(data.error || "Failed to delete display");
      }
    } catch (err) {
      console.error("Failed to delete display", err);
      alert("Network error: Failed to delete display");
    }
  };

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" /> Display Manager
          </h2>
          <p className="text-xs text-slate-400">
            Monitor live signage terminals, pair TVs, or add browser displays.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button size="sm" variant="outline" onClick={handleAddBrowserDisplay}>
            <Plus className="w-4 h-4 mr-1 inline" /> Browser Display
          </Button>
          <Button size="sm" onClick={() => setShowPairModal(true)}>
            <Plus className="w-4 h-4 mr-1 inline" /> Pair TV Device
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displays.map((disp) => (
          <DisplayCard
            key={disp.id}
            display={disp}
            decks={decks}
            isOnline={isOnline(disp.lastSeenAt)}
            onDeckAssign={handleDeckAssign}
            onDelete={handleDeleteDisplay}
            onDeviceSettingsClick={setSelectedDeviceId}
          />
        ))}
      </div>

      <PairDisplayDialog
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
        onSuccess={fetchData}
      />
      <DeviceSettingsDialog
        isOpen={!!selectedDeviceId}
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default DisplayManager;
