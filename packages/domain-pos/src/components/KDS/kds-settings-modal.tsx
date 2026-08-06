"use client";

import { Settings, Volume2, VolumeX, Search, PackageX, Eye, EyeOff } from "lucide-react";

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
  posItems: Record<string, unknown>[];
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
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-zinc-50 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl text-zinc-900 dark:text-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5 dark:border-white/5">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" /> KDS Display Settings
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-black/5 bg-card rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
              Audio & Sound Controls
            </h4>
            <div className="flex items-center justify-between p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                {soundsEnabled ? (
                  <Volume2 className="w-5 h-5 text-green-400 animate-pulse" />
                ) : (
                  <VolumeX className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-semibold">Chime Alerts</p>
                  <p className="text-xs text-muted-foreground">Play chiming sounds on ticket updates</p>
                </div>
              </div>
              <button
                onClick={() => onToggleSounds(!soundsEnabled)}
                className={`text-xs px-4 py-2 font-bold rounded-lg border transition-all cursor-pointer ${
                  soundsEnabled
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-zinc-800 text-zinc-500 border-zinc-700"
                }`}
              >
                {soundsEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            {soundsEnabled && (
              <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                <label className="text-xs font-semibold block text-foreground">
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
            <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider">
              Sizing & Density
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-foreground">Text Size</p>
                <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                  {(["sm", "md", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onChangeTextSize(sz)}
                      className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                        textSize === sz ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {sz === "sm" ? "Small" : sz === "md" ? "Medium" : "Large"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-black/5 bg-card border border-black/5 dark:border-white/5 rounded-xl space-y-2">
                <p className="text-xs font-semibold text-foreground">Grid Layout Density</p>
                <div className="flex bg-black/5 dark:bg-black/40 border border-black/5 dark:border-white/5 rounded-lg p-1 text-xs">
                  {(["compact", "standard", "spacious"] as const).map((den) => (
                    <button
                      key={den}
                      onClick={() => onChangeDensity(den)}
                      className={`flex-1 text-center py-2 rounded-md font-bold transition-all cursor-pointer ${
                        density === den ? "bg-black/10 dark:bg-white/10 text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {den === "compact" ? "Compact" : den === "standard" ? "Standard" : "Spacious"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5">
            <h4 className="text-xs uppercase font-extrabold text-sky-400 tracking-wider flex items-center gap-1.5">
              <PackageX className="w-4 h-4 text-sky-400" /> Manage Unavailable (86'd) Items
            </h4>

            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search menu items to 86..."
                className="w-full bg-white/50 dark:bg-black/60 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-foreground focus:outline-none focus:border-sky-500 transition-colors"
              />
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3.5" />
            </div>

            <div className="border border-black/5 dark:border-white/5 rounded-xl max-h-48 overflow-y-auto p-2 bg-black/20 divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs">No matching POS items.</div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2.5 px-2 hover:bg-black/5 bg-card transition-colors">
                    <span className={`text-sm font-semibold ${item.is_sold_out ? "text-muted-foreground line-through" : "text-foreground"}`}>
                      {item.name}
                    </span>
                    <button
                      onClick={() => onToggleSoldOut(item.id, item.is_sold_out)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        item.is_sold_out
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-black/5 bg-card text-muted-foreground border-black/10 dark:border-white/10 hover:bg-black/10"
                      }`}
                    >
                      {item.is_sold_out ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Sold Out (86'd)
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" /> Available
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
