"use client";


import { Bell, LayoutGrid, LogOut, Settings } from "lucide-react";
import { PrimaryLogo } from "../logos/PrimaryLogo";
import { OmniBar } from "../OmniBar";

export interface GlobalAppBarPresentationProps {
  notificationCount: number;
  isProfileOpen: boolean;
  onToggleProfile: () => void;
  onLogout: () => void;
}

export function GlobalAppBarPresentation({
  notificationCount,
  isProfileOpen,
  onToggleProfile,
  onLogout,
}: GlobalAppBarPresentationProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/80 border-b border-white/5 h-16 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2 text-sky-500">
        <PrimaryLogo className="h-8 w-auto text-[var(--color-primary)]" />
      </div>

      {/* Center/Right-Align: OmniBar (Mounts here, handles its own positioning via Framer Motion) */}
      <div className="flex-1 flex justify-end mr-4">
        <OmniBar />
      </div>

      {/* Right: Action Group */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <button className="relative p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[var(--color-destructive)]" />
          )}
        </button>

        {/* Waffle Menu */}
        <button className="p-2 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* User Profile Avatar / Dropdown */}
        <div className="relative">
          <button 
            onClick={onToggleProfile}
            className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-zinc-950 font-bold flex items-center justify-center ml-2"
          >
            CW
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-1">
              <button className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-zinc-300 hover:bg-white/5 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button 
                onClick={onLogout}
                className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
