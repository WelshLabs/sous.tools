/* eslint-disable max-lines */
"use client";

import React from "react";
import Link from "next/link";
import { type SignageDisplay } from "@soustools/api-types";
import { Button } from "@soustools/design-system";
import {
  Monitor,
  Plus,
  RefreshCw,
  Trash2,
  Wifi,
  WifiOff,
  ExternalLink,
  Settings,
  Edit2,
  Copy,
  Check,
  Eye,
} from "lucide-react";
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
    <div className="bg-card border-border text-foreground mx-auto max-w-4xl space-y-6 rounded-2xl border p-6">
      <header className="border-border flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-foreground flex items-center gap-2 text-xl font-bold">
            <Monitor className="text-primary h-5 w-5" /> Display Manager
          </h2>
          <p className="text-muted-foreground text-xs">
            Monitor live signage terminals, pair TVs, or add browser displays.
          </p>
        </div>
        <div className="flex gap-2">
          {onRefreshData && (
            <button
              onClick={onRefreshData}
              className="bg-muted hover:bg-muted-foreground/10 text-muted-foreground cursor-pointer rounded p-2"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          <Button size="sm" variant="outline" onClick={handleAddBrowserDisplay}>
            <Plus className="mr-1 inline h-4 w-4" /> Browser Display
          </Button>
          <Button size="sm" onClick={() => setShowPairModal(true)}>
            <Plus className="mr-1 inline h-4 w-4" /> Pair TV Device
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

export const DisplayPickerView: React.FC<DisplayPickerViewProps> = ({
  deckId,
  displays,
  onToggleDisplay,
}) => {
  if (!deckId || displays.length === 0) return null;

  return (
    <>
      <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase">
        <Monitor className="h-3 w-3" /> Assign Displays
      </p>
      <div className="space-y-1.5">
        {displays.map((disp) => {
          const isAssigned = disp.deckId === deckId;
          return (
            <label
              key={disp.id}
              className="group flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={isAssigned}
                onChange={(e) => onToggleDisplay(disp.id, e.target.checked)}
                className="accent-primary h-3.5 w-3.5"
              />
              <span className="text-muted-foreground group-hover:text-foreground text-xs transition-colors">
                {disp.name}
              </span>
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
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-[oklch(0.26_0.03_180)] bg-[oklch(0.16_0.02_180)] p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-foreground text-sm font-bold">{display.name}</h3>
          {display.portLabel ? (
            <span className="text-muted-foreground font-mono text-[10px]">
              HDMI output: {display.portLabel}
            </span>
          ) : (
            <span className="text-primary font-mono text-[10px] font-medium">
              Standalone Web View
            </span>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold tracking-wider uppercase">
            {isOnline ? (
              <span className="flex items-center gap-0.5 text-emerald-400">
                <Wifi className="h-3.5 w-3.5" /> Live
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-0.5">
                <WifiOff className="h-3.5 w-3.5" /> Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {display.deviceId && onDeviceSettingsClick && (
            <button
              onClick={() => onDeviceSettingsClick(display.deviceId!)}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 flex cursor-pointer items-center justify-center rounded border-0 bg-transparent p-1 transition-colors"
              title="Device Settings"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          )}
          <a
            href={`/display/${display.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 flex cursor-pointer items-center justify-center rounded p-1 transition-colors"
            title="View Display Content"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => onDelete(display.id)}
            className="text-muted-foreground flex cursor-pointer items-center justify-center rounded border-0 bg-transparent p-1 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete Display"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="border-border flex items-center gap-2 border-t pt-2">
        <span className="text-muted-foreground text-[10px] font-semibold whitespace-nowrap">
          Show Deck:
        </span>
        <select
          value={display.deckId || ""}
          onChange={(e) => onDeckAssign(display.id, e.target.value || null)}
          className="bg-card border-border text-foreground focus:border-primary w-full cursor-pointer rounded border px-2 py-1 font-sans text-xs focus:outline-none"
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
  onEditClick,
}) => {
  return (
    <div className="bg-card/60 border-border flex flex-col rounded-xl border p-5 backdrop-blur transition-all duration-300 hover:border-white/20">
      <div className="min-w-0 flex-1">
        {isEditing ? (
          <div className="mb-3 space-y-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSaveRename}
              onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
              className="bg-background text-foreground focus:border-primary w-full rounded border border-white/15 px-2 py-1 text-sm focus:outline-none"
              placeholder="Deck Name"
              autoFocus
            />
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground font-mono text-[10px]">
                /s/
              </span>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                onBlur={handleSaveRename}
                onKeyDown={(e) => e.key === "Enter" && handleSaveRename()}
                className="bg-background text-muted-foreground focus:border-primary flex-1 rounded border border-white/15 px-2 py-0.5 font-mono text-xs focus:outline-none"
                placeholder="slug"
              />
            </div>
          </div>
        ) : (
          <div className="mb-3">
            <div className="group flex items-center gap-2">
              <h3 className="text-foreground max-w-[200px] truncate text-base font-bold">
                {deck.name}
              </h3>
              <button
                onClick={() => setIsEditing(true)}
                className="hover:bg-background/10 dark:bg-background/10 text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 opacity-0 transition-all group-hover:opacity-100"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-muted-foreground mt-1 truncate font-mono text-xs">
              /s/{deck.slug}
            </p>
          </div>
        )}

        <div className="mb-4 flex items-center gap-2">
          <span className="bg-secondary text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
            {slideCount} {slideCount === 1 ? "slide" : "slides"}
          </span>
        </div>
      </div>

      <div className="border-border flex items-center justify-between gap-2 border-t pt-4">
        <button
          onClick={onEditClick}
          className="bg-primary hover:bg-primary/90 text-foreground flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-center text-xs font-semibold transition-colors"
        >
          Edit
        </button>
        <Link
          href={`/signage/${deck.id}/preview`}
          className="border-border hover:border-primary/40 hover:bg-primary/10 text-muted-foreground hover:text-primary flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-all"
          title="Preview Deck"
        >
          <Eye className="h-4 w-4" />
        </Link>
        <a
          href={getLiveUrl(deck.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className="border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground flex cursor-pointer items-center justify-center rounded-lg border p-2 transition-all hover:border-white/25"
          title="Open Live View in New Tab"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          onClick={handleCopyUrl}
          className="border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg border p-2 transition-all hover:border-white/25"
          title="Copy Deck URL"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
        <button
          onClick={() => onDelete(deck.id)}
          className="border-border text-muted-foreground cursor-pointer rounded-lg border p-2 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          title="Delete Deck"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
