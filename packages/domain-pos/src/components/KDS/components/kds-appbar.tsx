"use client";

import { useState } from "react";
import {
  LayoutGrid,
  ChefHat,
  RefreshCw,
  Settings,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button, OmniBar, WaffleMenuDropdown } from "@soustools/design-system";
import { type KDSStationFilter, type KDSUser } from "../kds.types";

export interface KDSAppBarProps {
  viewFilter: "OPEN" | "CLOSED";
  onSetViewFilter: (filter: "OPEN" | "CLOSED") => void;
  openTicketsCount: number;
  closedTicketsCount: number;
  onOpenSettings: () => void;
  onSyncSquare: () => Promise<void>;
  isSyncingSquare: boolean;
  stationFilter: KDSStationFilter;
  onSelectStation: (station: KDSStationFilter) => void;
  currentUser?: KDSUser | null;
  isAdmin?: boolean;
}

const STATIONS: Array<{ id: KDSStationFilter; label: string }> = [
  { id: "ALL", label: "All Stations" },
  { id: "KITCHEN", label: "Kitchen Line" },
  { id: "BAR", label: "Bar Drinks" },
  { id: "EXPO", label: "Expo Screen" },
];

export function KDSAppBar({
  viewFilter,
  onSetViewFilter,
  openTicketsCount,
  closedTicketsCount,
  onOpenSettings,
  onSyncSquare,
  isSyncingSquare,
  stationFilter,
  onSelectStation,
  currentUser,
  isAdmin = true,
}: KDSAppBarProps) {
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);

  return (
    <header className="border-border bg-card/70 sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md">
      {/* Left: Waffle Launcher & Title */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWaffleOpen((prev) => !prev)}
            aria-label="App Launcher"
            className="hover:bg-muted text-foreground flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-all hover:scale-105 active:scale-95"
          >
            <LayoutGrid className="h-5 w-5 text-sky-400" />
          </button>
          {isWaffleOpen && (
            <WaffleMenuDropdown
              onCloseMenus={() => setIsWaffleOpen(false)}
              isAdmin={isAdmin}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
            <ChefHat className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <h1 className="text-foreground text-sm font-black tracking-tight">
                Kitchen Display
              </h1>
              <span className="rounded border border-sky-500/20 bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase">
                Live KDS
              </span>
            </div>
            <p className="text-muted-foreground text-[11px]">
              Real-time ticket fulfillment & prep
            </p>
          </div>
        </div>
      </div>

      {/* Center: Open / Completed Tabs */}
      <div className="flex items-center justify-center">
        <div className="border-border bg-background/50 flex rounded-xl border p-1 text-xs font-semibold shadow-inner">
          <button
            type="button"
            onClick={() => onSetViewFilter("OPEN")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${
              viewFilter === "OPEN"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-amber-400" />
            <span>Open</span>
            <span
              className={`py-0.2 ml-0.5 rounded-full px-1.5 text-[10px] font-black ${
                viewFilter === "OPEN"
                  ? "bg-black/20 text-white"
                  : "text-muted-foreground bg-white/10"
              }`}
            >
              {openTicketsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSetViewFilter("CLOSED")}
            className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-all ${
              viewFilter === "CLOSED"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Completed</span>
            <span
              className={`py-0.2 ml-0.5 rounded-full px-1.5 text-[10px] font-black ${
                viewFilter === "CLOSED"
                  ? "bg-black/20 text-white"
                  : "text-muted-foreground bg-white/10"
              }`}
            >
              {closedTicketsCount}
            </span>
          </button>
        </div>
      </div>

      {/* Right: Station Selector, Square Sync, Omnibar, Settings */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden items-center lg:flex">
          <select
            value={stationFilter}
            onChange={(e) => onSelectStation(e.target.value)}
            className="border-border bg-background/60 text-foreground focus:ring-primary rounded-xl border px-3 py-1.5 text-xs font-bold focus:ring-2 focus:outline-none"
            aria-label="Filter Station"
          >
            {STATIONS.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="bg-card text-foreground"
              >
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onSyncSquare}
          disabled={isSyncingSquare}
          title="Sync Square Orders & Catalog"
          className="relative flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 font-bold transition-all hover:bg-white/10"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-sky-400 ${isSyncingSquare ? "animate-spin" : ""}`}
          />
          <span className="hidden text-xs md:inline">
            {isSyncingSquare ? "Syncing..." : "Sync Square"}
          </span>
        </Button>

        <div className="hidden xl:block">
          <OmniBar />
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="KDS Display & Sound Settings"
          className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <div
          title="Active Station Terminal"
          className="bg-primary/20 border-primary/30 text-primary hidden h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold tracking-wider uppercase sm:flex"
        >
          <span>{currentUser?.initials || "KDS"}</span>
        </div>
      </div>
    </header>
  );
}
KDSAppBar.displayName = "KDSAppBar";
