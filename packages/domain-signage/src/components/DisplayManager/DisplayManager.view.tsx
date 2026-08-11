/* eslint-disable max-lines */
"use client";

import React from "react";
import Link from "next/link";
import { type SignageDisplay } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import { Monitor, Plus, RefreshCw, Trash2, Wifi, WifiOff, ExternalLink, Settings, Edit2, Copy, Check, Eye } from "lucide-react";
import { PairDisplayDialog } from "../../pair-display-dialog";
import { DeviceSettingsDialog } from "../../device-settings-dialog";
import { isOnline } from "../../display-utils";
import { DisplayCard } from "./DisplayManager.container";

// ---------------------------
// Display Manager View
// ---------------------------
export interface DisplayManagerViewProps {
  displays: SignageDisplay[];
  layouts: any[];
  onRefreshData?: () => void;
  handleAddBrowserDisplay: () => void;
  setShowPairModal: (show: boolean) => void;
  showPairModal: boolean;
  onPairDisplay?: (code: string) => Promise<void>;
  selectedDeviceId: string | null;
  setSelectedDeviceId: (id: string | null) => void;
  onSaveDevice?: (deviceId: string, payload: any) => Promise<void>;
  onFetchDevice?: (deviceId: string) => Promise<any>;
  onAssignDeck: (displayId: string, deckId: string | null) => Promise<void>;
  handleDeleteDisplay: (id: string) => void;
}

export const DisplayManagerView: React.FC<DisplayManagerViewProps> = ({
  displays,
  layouts,
  onRefreshData,
  handleAddBrowserDisplay,
  setShowPairModal,
  showPairModal,
  onPairDisplay,
  selectedDeviceId,
  setSelectedDeviceId,
  onSaveDevice,
  onFetchDevice,
  onAssignDeck,
  handleDeleteDisplay,
}) => {
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

// ---------------------------
// Display Picker View
// ---------------------------
export interface DisplayPickerViewProps {
  deckId?: string;
  displays: SignageDisplay[];
  onToggleDisplay: (displayId: string, isAssigned: boolean) => Promise<void>;
}

export const DisplayPickerView: React.FC<DisplayPickerViewProps> = ({ deckId, displays, onToggleDisplay }) => {
  if (!deckId || displays.length === 0) return null;

  return (
    <>
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
        <Monitor className="w-3 h-3" /> Assign Displays
      </p>
      <div className="space-y-1.5">
        {displays.map((disp) => {
          const isAssigned = disp.deckId === deckId;
          return (
            <label key={disp.id} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={isAssigned}
                onChange={(e) => onToggleDisplay(disp.id, e.target.checked)}
                className="accent-primary w-3.5 h-3.5" />
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{disp.name}</span>
            </label>
          );
        })}
      </div>
    </>
  );
};

// ---------------------------
// Display Card View
// ---------------------------
export interface DisplayCardViewProps {
  display: SignageDisplay;
  decks: { id: string; name: string }[];
  isOnline: boolean;
  onDeckAssign: (displayId: string, deckId: string | null) => void;
  onDelete: (id: string) => void;
  onDeviceSettingsClick?: (deviceId: string) => void;
}

export const DisplayCardView: React.FC<DisplayCardViewProps> = ({
  display,
  decks,
  isOnline,
  onDeckAssign,
  onDelete,
  onDeviceSettingsClick,
}) => {
  return (
    <div className="p-4 rounded-xl bg-[oklch(0.16_0.02_180)] border border-[oklch(0.26_0.03_180)] flex flex-col justify-between gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-bold text-foreground">{display.name}</h3>
          {display.portLabel ? (
            <span className="text-[10px] text-muted-foreground font-mono">
              HDMI output: {display.portLabel}
            </span>
          ) : (
            <span className="text-[10px] text-primary font-mono font-medium">
              Standalone Web View
            </span>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider">
            {isOnline ? (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <Wifi className="w-3.5 h-3.5" /> Live
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-0.5">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          {display.deviceId && onDeviceSettingsClick && (
            <button
              onClick={() => onDeviceSettingsClick(display.deviceId!)}
              className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-center border-0 bg-transparent"
              title="Device Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={`/display/${display.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-center"
            title="View Display Content"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onDelete(display.id)}
            className="p-1 text-muted-foreground hover:text-red-400 rounded hover:bg-red-500/10 cursor-pointer transition-colors flex items-center justify-center border-0 bg-transparent"
            title="Delete Display"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-2">
        <span className="text-[10px] text-muted-foreground font-semibold whitespace-nowrap">
          Show Deck:
        </span>
        <select
          value={display.deckId || ""}
          onChange={(e) => onDeckAssign(display.id, e.target.value || null)}
          className="w-full text-xs bg-card border border-border rounded px-2 py-1 text-foreground focus:outline-none focus:border-primary font-sans cursor-pointer"
        >
          <option value="">-- Unassigned --</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ---------------------------
// Deck Card View
// ---------------------------
export interface DeckCardViewProps {
  deck: any;
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  name: string;
  setName: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  handleSaveRename: () => void;
  copied: boolean;
  handleCopyUrl: () => void;
  onDelete: (id: string) => void;
  getLiveUrl: (s: string) => string;
  slideCount: number;
  onEditClick: () => void;
}

export const DeckCardView: React.FC<DeckCardViewProps> = ({
  deck,
  isEditing,
  setIsEditing,
  name,
  setName,
  slug,
  setSlug,
  handleSaveRename,
  copied,
  handleCopyUrl,
  onDelete,
  getLiveUrl,
  slideCount,
  onEditClick
}) => {
  return (
    <div className="flex flex-col bg-card/60 backdrop-blur border border-border rounded-xl p-5 hover:border-white/20 transition-all duration-300">
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="w-full px-2 py-1 text-sm bg-background border border-white/15 rounded text-foreground focus:outline-none focus:border-primary"
              placeholder="Deck Name"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-mono">/s/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="flex-1 px-2 py-0.5 text-xs bg-background border border-white/15 rounded text-muted-foreground font-mono focus:outline-none focus:border-primary"
                placeholder="slug"
              />
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="flex items-center gap-2 group">
              <h3 className="text-base font-bold text-foreground truncate max-w-[200px]">
                {deck.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-background/10 dark:bg-background/10 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate mt-1">
              /s/{deck.slug}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground font-medium">
            {slideCount} {slideCount === 1 ? "slide" : "slides"}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <button
          onClick={onEditClick}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-primary hover:bg-primary/90 text-foreground rounded-lg transition-colors cursor-pointer text-center"
        >
          Edit
        </button>
        <Link
          href={`/signage/${deck.id}/preview`}
          className="p-2 border border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Preview Deck"
        >
          <Eye className="w-4 h-4" />
        </Link>
        <a
          href={getLiveUrl(deck.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 border border-border hover:border-white/25 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer flex items-center justify-center"
          title="Open Live View in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={handleCopyUrl}
          className="p-2 border border-border hover:border-white/25 hover:bg-muted/50 text-muted-foreground hover:text-foreground rounded-lg transition-all cursor-pointer"
          title="Copy Deck URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="p-2 border border-border hover:border-red-500/30 hover:bg-red-500/10 text-muted-foreground hover:text-red-400 rounded-lg transition-all cursor-pointer"
          title="Delete Deck"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
