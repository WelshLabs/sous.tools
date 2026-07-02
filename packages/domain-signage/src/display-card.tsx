"use client";

import React from "react";
import { SignageDisplay } from "@soustools/api-types";
import { Trash2, Wifi, WifiOff, ExternalLink, Settings } from "lucide-react";

interface DisplayCardProps {
  display: SignageDisplay;
  decks: { id: string; name: string }[];
  isOnline: boolean;
  onDeckAssign: (displayId: string, deckId: string | null) => void;
  onDelete: (id: string) => void;
  onDeviceSettingsClick?: (deviceId: string) => void;
}

export const DisplayCard: React.FC<DisplayCardProps> = ({
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
          <h3 className="text-sm font-bold text-slate-200">{display.name}</h3>
          {display.portLabel ? (
            <span className="text-[10px] text-slate-500 font-mono">
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
              <span className="text-slate-500 flex items-center gap-0.5">
                <WifiOff className="w-3.5 h-3.5" /> Offline
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1.5 items-center">
          {display.deviceId && onDeviceSettingsClick && (
            <button
              onClick={() => onDeviceSettingsClick(display.deviceId!)}
              className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-black/5 dark:bg-white/5 cursor-pointer transition-colors flex items-center justify-center border-0 bg-transparent"
              title="Device Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          )}
          <a
            href={`/display/${display.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 text-slate-400 hover:text-slate-200 rounded hover:bg-black/5 dark:bg-white/5 cursor-pointer transition-colors flex items-center justify-center"
            title="View Display Content"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => onDelete(display.id)}
            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 cursor-pointer transition-colors flex items-center justify-center border-0 bg-transparent"
            title="Delete Display"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-black/5 dark:border-white/5 pt-2">
        <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
          Show Deck:
        </span>
        <select
          value={display.deckId || ""}
          onChange={(e) => onDeckAssign(display.id, e.target.value || null)}
          className="w-full text-xs bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-primary font-sans cursor-pointer"
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
