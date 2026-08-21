"use client";

import { useState } from "react";
import {
  LayoutGrid,
  History,
  Lock,
  Settings,
  ChevronRight,
  X,
  FileText,
  DollarSign,
} from "lucide-react";
import { Button, OmniBar } from "@soustools/design-system";
import { WaffleMenuDropdown } from "@soustools/design-system";
import { type POSUser } from "../pos.types";

export interface POSAppBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  savedChecksCount: number;
  onOpenSavedChecks: () => void;
  onOpenDrawer: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onLockRegister: () => void;
  currentUser: POSUser | null;
  isAdmin?: boolean;
}

export function POSAppBar({
  selectedCategory,
  onSelectCategory,
  savedChecksCount,
  onOpenSavedChecks,
  onOpenDrawer,
  onOpenHistory,
  onOpenSettings,
  onLockRegister,
  currentUser,
  isAdmin = true,
}: POSAppBarProps) {
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);

  return (
    <header className="border-border bg-card/70 sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md">
      {/* Left: Waffle Menu & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {/* Waffle Launcher */}
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

        {/* Breadcrumbs */}
        <nav
          aria-label="POS Breadcrumbs"
          className="flex items-center gap-1.5 text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => onSelectCategory("")}
            className={`cursor-pointer transition-colors ${
              selectedCategory === ""
                ? "text-foreground font-black tracking-tight"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Menu
          </button>

          {selectedCategory !== "" && (
            <>
              <ChevronRight className="text-muted-foreground/60 h-4 w-4" />
              <div className="bg-primary/10 border-primary/20 text-primary flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold">
                <span>{selectedCategory}</span>
                <button
                  type="button"
                  onClick={() => onSelectCategory("")}
                  className="hover:bg-primary/20 rounded p-0.5 transition-colors"
                  aria-label="Close category"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Center/Right: Omnibar & Fast POS Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Embedded Omnibar */}
        <div className="hidden sm:block">
          <OmniBar />
        </div>

        {/* Saved Checks Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSavedChecks}
          className={`relative flex items-center gap-1.5 rounded-xl border font-bold transition-all ${
            savedChecksCount > 0
              ? "border-amber-500/40 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              : "text-muted-foreground hover:text-foreground border-white/10 bg-white/5"
          }`}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden md:inline">Checks</span>
          {savedChecksCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-xs font-black text-zinc-950">
              {savedChecksCount}
            </span>
          )}
        </Button>

        {/* Open Drawer Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenDrawer}
          title="Open Cash Drawer"
          className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl hover:bg-white/10"
        >
          <DollarSign className="h-4 w-4 text-emerald-400" />
        </Button>

        {/* Past Orders / History Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenHistory}
          title="Order History & Voids"
          className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl hover:bg-white/10"
        >
          <History className="h-4 w-4" />
        </Button>

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenSettings}
          title="POS Settings & Tax"
          className="text-muted-foreground hover:text-foreground h-10 w-10 rounded-xl hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* User Badge & PIN Lock */}
        <button
          type="button"
          onClick={onLockRegister}
          title="Lock Register / Switch PIN"
          className="bg-primary hover:bg-primary/90 flex h-10 items-center gap-2 rounded-xl px-3 font-bold text-zinc-950 transition-all hover:scale-105 active:scale-95"
        >
          <span className="text-xs font-extrabold tracking-wider uppercase">
            {currentUser?.initials || "STAFF"}
          </span>
          <Lock className="h-3.5 w-3.5 opacity-80" />
        </button>
      </div>
    </header>
  );
}
POSAppBar.displayName = "POSAppBar";
