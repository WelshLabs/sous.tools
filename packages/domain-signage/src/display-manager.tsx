"use client";

import React, { useState } from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Button } from "@soustools/ui";
import { Monitor, Plus, RefreshCw } from "lucide-react";
import { PairDisplayDialog } from "./pair-display-dialog";
import { DisplayCard } from "./display-card";
import { DeviceSettingsDialog } from "./device-settings-dialog";
import { isOnline } from "./display-utils";

/**
 * DisplayManager lists all display terminals, showing their status,
 * paired devices, and active deck assignments.
 *
 * @tenant-docs-export
 * Manage display configurations, pair new TV hardware, or configure devices settings.
 */
export interface DisplayManagerProps {
  displays: SignageDisplay[];
  layouts: any[];
  onAddBrowserDisplay: (name: string) => Promise<void>;
  onDeleteDisplay: (id: string) => Promise<void>;
  onAssignDeck: (displayId: string, deckId: string | null) => Promise<void>;
  onRefreshData?: () => void;
  // Modals will need to be hoisted or accept their own mutation callbacks.
  // We can leave them here but pass callbacks into them.
  onPairDisplay?: (code: string) => Promise<void>;
  onSaveDevice?: (deviceId: string, payload: any) => Promise<void>;
  onFetchDevice?: (deviceId: string) => Promise<any>;
}

export const DisplayManager: React.FC<DisplayManagerProps> = ({
  displays,
  layouts,
  onAddBrowserDisplay,
  onDeleteDisplay,
  onAssignDeck,
  onRefreshData,
  onPairDisplay,
  onSaveDevice,
  onFetchDevice,
}) => {
  const [showPairModal, setShowPairModal] = useState<boolean>(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const handleAddBrowserDisplay = async () => {
    const name = prompt("Enter standalone browser display name:", "Browser View");
    if (!name) return;
    await onAddBrowserDisplay(name);
  };

  const handleDeleteDisplay = async (id: string) => {
    if (!confirm("Remove this display terminal?")) return;
    await onDeleteDisplay(id);
  };

  return (
    <div className="space-y-6 bg-card p-6 rounded-2xl border border-border text-foreground max-w-4xl mx-auto">
      <header className="flex justify-between items-center pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" /> Display Manager
          </h2>
          <p className="text-xs text-muted-foreground">
            Monitor live signage terminals, pair TVs, or add browser displays.
          </p>
        </div>
        <div className="flex gap-2">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="p-2 rounded bg-muted hover:bg-muted-foreground/10 text-muted-foreground cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
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
            decks={layouts}
            isOnline={isOnline(disp.lastSeenAt)}
            onDeckAssign={onAssignDeck}
            onDelete={handleDeleteDisplay}
            onDeviceSettingsClick={setSelectedDeviceId}
          />
        ))}
      </div>

      <PairDisplayDialog
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
        onSuccess={onRefreshData}
        onPairDisplay={onPairDisplay}
      />
      <DeviceSettingsDialog
        isOpen={!!selectedDeviceId}
        deviceId={selectedDeviceId}
        onClose={() => setSelectedDeviceId(null)}
        onSuccess={onRefreshData}
        onSaveDevice={onSaveDevice}
        onFetchDevice={onFetchDevice}
      />
    </div>
  );
};

export default DisplayManager;
