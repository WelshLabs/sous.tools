/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Search,
  PackageX,
  Eye,
  EyeOff,
  Palette,
  Clock,
  LayoutGrid,
  Type,
  RefreshCw,
  X,
  Play,
} from "lucide-react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  ThemeToggle,
} from "@soustools/design-system";
import {
  type KDSSettings,
  type KDSTextSize,
  type KDSDensity,
  type KDSSortOrder,
  type KDSStationFilter,
} from "./kds.types";
import { playChime } from "./kds.helpers";

export interface POSItem {
  id: string;
  name: string;
  is_sold_out?: boolean;
  [key: string]: unknown;
}

interface KDSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: KDSSettings;
  onSaveSettings: (newSettings: KDSSettings) => void;
  posItems: POSItem[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleSoldOut: (itemId: string, currentStatus: boolean) => Promise<void>;
  onSyncSquare?: () => Promise<void>;
  isSyncingSquare?: boolean;
}

export function KDSSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  posItems,
  searchQuery,
  onSearchChange,
  onToggleSoldOut,
  onSyncSquare,
  isSyncingSquare = false,
}: KDSSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "display" | "audio" | "timers" | "items86" | "appearance"
  >("display");

  // Local working copy of settings
  const [textSize, setTextSize] = useState<KDSTextSize>(settings.textSize);
  const [density, setDensity] = useState<KDSDensity>(settings.density);
  const [soundsEnabled, setSoundsEnabled] = useState(settings.soundsEnabled);
  const [soundVolume, setSoundVolume] = useState(settings.soundVolume);
  const [timerAlertSounds, setTimerAlertSounds] = useState(
    settings.timerAlertSounds,
  );
  const [warningMinutes, setWarningMinutes] = useState(settings.warningMinutes);
  const [rushMinutes, setRushMinutes] = useState(settings.rushMinutes);
  const [ticketSortOrder, setTicketSortOrder] = useState<KDSSortOrder>(
    settings.ticketSortOrder,
  );
  const [stationFilter, setStationFilter] = useState<KDSStationFilter>(
    settings.stationFilter,
  );
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(
    settings.autoRefreshInterval,
  );

  if (!isOpen) return null;

  const filteredItems = posItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSave = () => {
    onSaveSettings({
      textSize,
      density,
      soundsEnabled,
      soundVolume,
      timerAlertSounds,
      warningMinutes: Math.max(1, warningMinutes),
      rushMinutes: Math.max(warningMinutes + 1, rushMinutes),
      ticketSortOrder,
      stationFilter,
      autoRefreshInterval,
    });
    onClose();
  };

  const handleTestChime = (type: "new" | "complete" | "alert") => {
    playChime(type, true, soundVolume);
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-400">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground text-lg font-black">
                Kitchen Display Settings
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Configure KDS layout, audio chimes, timers, and station routing
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-white/5 bg-black/20 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("display")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "display"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Layout & Sizing
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("audio")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "audio"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            Audio & Chimes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timers")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "timers"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Timers & Urgency
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("items86")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "items86"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <PackageX className="h-3.5 w-3.5" />
            86d Items
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "appearance"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Theme
          </button>
        </div>

        <CardContent className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* TAB: DISPLAY */}
          {activeTab === "display" && (
            <div className="space-y-4">
              {/* Text Size */}
              <div className="space-y-1.5">
                <label className="text-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  <Type className="h-3.5 w-3.5 text-sky-400" />
                  Ticket Font & Text Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["sm", "md", "lg"] as const).map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setTextSize(sz)}
                      className={`cursor-pointer rounded-xl border p-3 text-xs font-bold capitalize transition-all ${
                        textSize === sz
                          ? "border-sky-500 bg-sky-500/15 font-black text-sky-400"
                          : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                      }`}
                    >
                      {sz === "sm"
                        ? "Small (Compact)"
                        : sz === "md"
                          ? "Medium (Standard)"
                          : "Large (High-Vis)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Density */}
              <div className="space-y-1.5">
                <label className="text-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
                  <LayoutGrid className="h-3.5 w-3.5 text-sky-400" />
                  Grid Layout Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["compact", "standard", "spacious"] as const).map((den) => (
                    <button
                      key={den}
                      type="button"
                      onClick={() => setDensity(den)}
                      className={`cursor-pointer rounded-xl border p-3 text-xs font-bold capitalize transition-all ${
                        density === den
                          ? "border-sky-500 bg-sky-500/15 font-black text-sky-400"
                          : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                      }`}
                    >
                      {den === "compact"
                        ? "Compact (5-6 Cols)"
                        : den === "standard"
                          ? "Standard (3-4 Cols)"
                          : "Spacious (2-3 Cols)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Ticket Sort Order
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTicketSortOrder("oldest_first")}
                    className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-all ${
                      ticketSortOrder === "oldest_first"
                        ? "border-sky-500 bg-sky-500/15 font-black text-sky-400"
                        : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                    }`}
                  >
                    Oldest First (FIFO Priority)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTicketSortOrder("newest_first")}
                    className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-all ${
                      ticketSortOrder === "newest_first"
                        ? "border-sky-500 bg-sky-500/15 font-black text-sky-400"
                        : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                    }`}
                  >
                    Newest First (Recent)
                  </button>
                </div>
              </div>

              {/* Station Routing */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Station Routing & Filter
                </label>
                <select
                  value={stationFilter}
                  onChange={(e) => setStationFilter(e.target.value)}
                  className="border-border text-foreground focus:ring-primary w-full rounded-xl border bg-black/30 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:outline-none"
                >
                  <option value="ALL">All Stations (Master Kitchen)</option>
                  <option value="KITCHEN">Kitchen Line (Hot & Prep)</option>
                  <option value="BAR">Bar Drinks & Cocktails</option>
                  <option value="EXPO">Expo Pass & Packing</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB: AUDIO */}
          {activeTab === "audio" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3">
                  {soundsEnabled ? (
                    <Volume2 className="h-5 w-5 animate-pulse text-emerald-400" />
                  ) : (
                    <VolumeX className="text-muted-foreground h-5 w-5" />
                  )}
                  <div>
                    <h4 className="text-foreground text-sm font-bold">
                      Audio Chime Alerts
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      Play acoustic notifications for new orders and ticket
                      completion
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundsEnabled(!soundsEnabled)}
                  className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                    soundsEnabled
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {soundsEnabled ? "Enabled" : "Disabled"}
                </button>
              </div>

              {soundsEnabled && (
                <>
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-amber-400" />
                      <div>
                        <h4 className="text-foreground text-sm font-bold">
                          Urgency & Rush Alarm Sounds
                        </h4>
                        <p className="text-muted-foreground text-xs">
                          Play audio alarms when tickets exceed warning or rush
                          thresholds
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTimerAlertSounds(!timerAlertSounds)}
                      className={`cursor-pointer rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                        timerAlertSounds
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
                          : "border-zinc-700 bg-zinc-800 text-zinc-500"
                      }`}
                    >
                      {timerAlertSounds ? "Enabled" : "Disabled"}
                    </button>
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-foreground text-xs font-bold">
                        Master Chime Volume: {Math.round(soundVolume * 100)}%
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={soundVolume}
                      onChange={(e) =>
                        setSoundVolume(parseFloat(e.target.value))
                      }
                      className="w-full accent-sky-400"
                    />
                  </div>

                  <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-4">
                    <label className="text-foreground block text-xs font-bold tracking-wider uppercase">
                      Sound Previews
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChime("new")}
                        className="flex items-center gap-1 text-xs font-bold"
                      >
                        <Play className="h-3 w-3 text-sky-400" /> New Order
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChime("complete")}
                        className="flex items-center gap-1 text-xs font-bold"
                      >
                        <Play className="h-3 w-3 text-emerald-400" /> Complete
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestChime("alert")}
                        className="flex items-center gap-1 text-xs font-bold"
                      >
                        <Play className="h-3 w-3 text-amber-400" /> Rush Alert
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB: TIMERS */}
          {activeTab === "timers" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-foreground flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                  <span>Warning Threshold (Amber)</span>
                  <span className="text-amber-400">
                    {warningMinutes} minutes
                  </span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="30"
                  step="1"
                  value={warningMinutes}
                  onChange={(e) =>
                    setWarningMinutes(parseInt(e.target.value, 10))
                  }
                  className="w-full accent-amber-400"
                />
                <p className="text-muted-foreground text-[11px]">
                  Tickets active longer than this threshold highlight in amber.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground flex items-center justify-between text-xs font-bold tracking-wider uppercase">
                  <span>Rush / Critical Threshold (Red)</span>
                  <span className="text-red-400">{rushMinutes} minutes</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="45"
                  step="1"
                  value={rushMinutes}
                  onChange={(e) => setRushMinutes(parseInt(e.target.value, 10))}
                  className="w-full accent-red-400"
                />
                <p className="text-muted-foreground text-[11px]">
                  Tickets active longer than this threshold highlight in urgent
                  red and pulse.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Background Auto-Refresh & Fallback Sync
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 5, label: "5 sec" },
                    { val: 10, label: "10 sec" },
                    { val: 30, label: "30 sec" },
                    { val: 0, label: "Off" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setAutoRefreshInterval(opt.val)}
                      className={`cursor-pointer rounded-xl border p-2.5 text-xs font-bold transition-all ${
                        autoRefreshInterval === opt.val
                          ? "border-sky-500 bg-sky-500/15 font-black text-sky-400"
                          : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {onSyncSquare && (
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onSyncSquare}
                    disabled={isSyncingSquare}
                    className="flex w-full items-center justify-center gap-2 font-bold"
                  >
                    <RefreshCw
                      className={`h-4 w-4 text-sky-400 ${isSyncingSquare ? "animate-spin" : ""}`}
                    />
                    {isSyncingSquare
                      ? "Synchronizing with Square..."
                      : "Manual Square Sync Now"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB: 86d ITEMS */}
          {activeTab === "items86" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search catalog items to 86 / mark sold out..."
                  className="text-foreground w-full rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 pl-10 text-sm transition-colors focus:border-sky-500 focus:outline-none"
                />
                <Search className="text-muted-foreground absolute top-3 left-3.5 h-4 w-4" />
              </div>

              <div className="max-h-60 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-2">
                {filteredItems.length === 0 ? (
                  <div className="text-muted-foreground py-8 text-center text-xs">
                    No matching catalog items found.
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <span
                        className={`text-sm font-semibold ${
                          item.is_sold_out
                            ? "text-muted-foreground line-through opacity-70"
                            : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onToggleSoldOut(item.id, item.is_sold_out ?? false)
                        }
                        className={`flex cursor-pointer items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                          item.is_sold_out
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20 hover:bg-white/10"
                        }`}
                      >
                        {item.is_sold_out ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5" /> Sold Out (86)
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
          )}

          {/* TAB: APPEARANCE */}
          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <h4 className="text-foreground text-sm font-bold">
                    Theme Color Mode
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Toggle between Midnight Slate (Dark) and Light theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex flex-row items-center justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            className="font-black"
            onClick={handleSave}
          >
            Apply & Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
KDSSettingsModal.displayName = "KDSSettingsModal";
