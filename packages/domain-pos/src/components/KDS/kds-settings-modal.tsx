/* eslint-disable max-lines */
"use client";

import {
  Settings,
  Volume2,
  VolumeX,
  Search,
  PackageX,
  Eye,
  EyeOff,
} from "lucide-react";

export interface POSItem {
  id: string;
  name: string;
  is_sold_out?: boolean;
  [key: string]: unknown;
}

interface KDSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundsEnabled: boolean;
  onToggleSounds: (enabled: boolean) => void;
  soundVolume: number;
  onChangeVolume: (vol: number) => void;
  textSize: "sm" | "md" | "lg";
  onChangeTextSize: (sz: "sm" | "md" | "lg") => void;
  density: "compact" | "standard" | "spacious";
  onChangeDensity: (den: "compact" | "standard" | "spacious") => void;
  posItems: POSItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSoldOut: (itemId: string, currentStatus: boolean) => void;
}

export function KDSSettingsModal({
  isOpen,
  onClose,
  soundsEnabled,
  onToggleSounds,
  soundVolume,
  onChangeVolume,
  textSize,
  onChangeTextSize,
  density,
  onChangeDensity,
  posItems,
  searchQuery,
  onSearchChange,
  onToggleSoldOut,
}: KDSSettingsModalProps) {
  if (!isOpen) return null;

  const filteredItems = posItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="dark:bg-card relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-black/10 bg-zinc-50 text-zinc-900 shadow-2xl dark:border-white/10 dark:text-zinc-100">
        <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 dark:border-white/5">
          <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
            <Settings className="h-5 w-5 text-sky-400" /> KDS Display Settings
          </h3>
          <button
            onClick={onClose}
            className="bg-card text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1 transition-colors hover:bg-black/5"
          >
            Close
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold tracking-wider text-sky-400 uppercase">
              Audio & Sound Controls
            </h4>
            <div className="bg-card flex items-center justify-between rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/5">
              <div className="flex items-center gap-3">
                {soundsEnabled ? (
                  <Volume2 className="h-5 w-5 animate-pulse text-green-400" />
                ) : (
                  <VolumeX className="text-muted-foreground h-5 w-5" />
                )}
                <div>
                  <p className="text-sm font-semibold">Chime Alerts</p>
                  <p className="text-muted-foreground text-xs">
                    Play chiming sounds on ticket updates
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggleSounds(!soundsEnabled)}
                className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                  soundsEnabled
                    ? "border-green-500/20 bg-green-500/10 text-green-400"
                    : "border-zinc-700 bg-zinc-800 text-zinc-500"
                }`}
              >
                {soundsEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            {soundsEnabled && (
              <div className="bg-card space-y-2 rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/5">
                <label className="text-foreground block text-xs font-semibold">
                  Chime Volume: {Math.round(soundVolume * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={soundVolume}
                  onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
                  className="w-full accent-sky-400"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-extrabold tracking-wider text-sky-400 uppercase">
              Sizing & Density
            </h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="bg-card space-y-2 rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/5">
                <p className="text-foreground text-xs font-semibold">
                  Text Size
                </p>
                <div className="flex rounded-lg border border-black/5 bg-black/5 p-1 text-xs dark:border-white/5 dark:bg-black/40">
                  {(["sm", "md", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onChangeTextSize(sz)}
                      className={`flex-1 cursor-pointer rounded-md py-2 text-center font-bold transition-all ${
                        textSize === sz
                          ? "text-foreground bg-black/10 dark:bg-white/10"
                          : "text-muted-foreground"
                      }`}
                    >
                      {sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card space-y-2 rounded-xl border border-black/5 bg-black/5 p-4 dark:border-white/5">
                <p className="text-foreground text-xs font-semibold">
                  Grid Layout Density
                </p>
                <div className="flex rounded-lg border border-black/5 bg-black/5 p-1 text-xs dark:border-white/5 dark:bg-black/40">
                  {(["compact", "standard", "spacious"] as const).map((den) => (
                    <button
                      key={den}
                      onClick={() => onChangeDensity(den)}
                      className={`flex-1 cursor-pointer rounded-md py-2 text-center font-bold transition-all ${
                        density === den
                          ? "text-foreground bg-black/10 dark:bg-white/10"
                          : "text-muted-foreground"
                      }`}
                    >
                      {den === "compact"
                        ? "Compact"
                        : den === "standard"
                          ? "Standard"
                          : "Spacious"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-black/5 pt-4 dark:border-white/5">
            <h4 className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-sky-400 uppercase">
              <PackageX className="h-4 w-4 text-sky-400" /> Manage Unavailable
              (86'd) Items
            </h4>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search menu items to 86..."
                className="text-foreground w-full rounded-xl border border-black/10 bg-white/50 px-4 py-3 pl-10 text-sm transition-colors focus:border-sky-500 focus:outline-none dark:border-white/10 dark:bg-black/60"
              />
              <Search className="text-muted-foreground absolute top-3.5 left-3.5 h-4 w-4" />
            </div>

            <div className="max-h-48 divide-y divide-white/5 overflow-y-auto rounded-xl border border-black/5 bg-black/20 p-2 dark:border-white/5">
              {filteredItems.length === 0 ? (
                <div className="text-muted-foreground py-6 text-center text-xs">
                  No matching POS items.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card flex items-center justify-between px-2 py-2.5 transition-colors hover:bg-black/5"
                  >
                    <span
                      className={`text-sm font-semibold ${item.is_sold_out ? "text-muted-foreground line-through" : "text-foreground"}`}
                    >
                      {item.name}
                    </span>
                    <button
                      onClick={() =>
                        onToggleSoldOut(item.id, item.is_sold_out ?? false)
                      }
                      className={`flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                        item.is_sold_out
                          ? "border-red-500/20 bg-red-500/10 text-red-400"
                          : "bg-card text-muted-foreground border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10"
                      }`}
                    >
                      {item.is_sold_out ? (
                        <>
                          <EyeOff className="h-3.5 w-3.5" /> Sold Out (86'd)
                        </>
                      ) : (
                        <>
                          <Eye className="h-3.5 w-3.5" /> Available
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
