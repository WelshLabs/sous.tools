"use client";

import React, { useState, useEffect } from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Monitor, Wifi, WifiOff, Plus, RefreshCw } from "lucide-react";
import { PairDisplayDialog } from "./pair-display-dialog";
import { MOCK_DISPLAYS } from "./mock-data";


/**
 * DisplayManager monitors and manages signage devices and pairing codes.
 *
 * @tenant-docs-export
 * Use the Display Manager to manage digital signage devices and monitor their online/offline state.
 */
export const DisplayManager: React.FC = () => {
  const [displays, setDisplays] = useState<SignageDisplay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPairModal, setShowPairModal] = useState<boolean>(false);

  const fetchDisplays = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch("/api/signage/displays");
      if (res.ok) {
        const payload = await res.json();
        setDisplays(payload.data || []);
      } else {
        setMockData();
      }
    } catch {
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  const setMockData = (): void => {
    setDisplays(MOCK_DISPLAYS);
  };

  useEffect(() => {
    fetchDisplays();
  }, []);

  const isOnline = (lastSeen: string | null): boolean => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 30000;
  };

  return (
    <div className="space-y-6 bg-[oklch(0.12_0.02_180)] p-6 rounded-2xl border border-[oklch(0.22_0.02_180)] text-slate-100 max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" /> Display Manager
          </h2>
          <p className="text-xs text-slate-400">
            Monitor live signage terminals and pair new TVs.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchDisplays}
            className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Button size="sm" onClick={() => setShowPairModal(true)}>
            <Plus className="w-4 h-4 mr-1 inline" /> Pair Screen
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displays.map((disp) => {
          const online = isOnline(disp.lastSeenAt);
          return (
            <div
              key={disp.id}
              className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  {disp.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Layout:{" "}
                  {disp.layoutId ? `Linked (${disp.layoutId})` : "Unlinked"}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider">
                  {disp.isPaired ? (
                    online ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Wifi className="w-3.5 h-3.5" /> Online
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <WifiOff className="w-3.5 h-3.5" /> Offline
                      </span>
                    )
                  ) : (
                    <span className="text-amber-400">
                      Unpaired (Code: {disp.pairingCode})
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PairDisplayDialog
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
        onSuccess={fetchDisplays}
      />
    </div>
  );
};

/**
 * Default export of the DisplayManager component.
 *
 * @tenant-docs-export
 * Use the Display Manager to manage digital signage devices and monitor their online/offline state.
 */
export default DisplayManager;

