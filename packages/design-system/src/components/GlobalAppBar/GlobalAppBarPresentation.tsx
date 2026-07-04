"use client";

import { Bell, LayoutGrid, LogOut, Settings } from "lucide-react";
import { PrimaryLogo } from "../logos/PrimaryLogo";
import { OmniBar } from "../OmniBar";

export interface GlobalAppBarPresentationProps {
  notificationCount: number;
  isProfileOpen: boolean;
  isNotificationsOpen: boolean;
  isWaffleOpen: boolean;
  onToggleProfile: () => void;
  onToggleNotifications: () => void;
  onToggleWaffle: () => void;
  onLogout: () => void;
}

export function GlobalAppBarPresentation({
  notificationCount,
  isProfileOpen,
  isNotificationsOpen,
  isWaffleOpen,
  onToggleProfile,
  onToggleNotifications,
  onToggleWaffle,
  onLogout,
}: GlobalAppBarPresentationProps) {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-zinc-950/80 border-b border-white/5 h-16 px-4 md:px-6 flex items-center justify-between">
      {/* Left: Brand Logo */}
      <div className="flex items-center gap-2 text-sky-500 cursor-pointer hover:opacity-80 transition-opacity">
        <PrimaryLogo className="h-10 w-auto text-[var(--color-primary)]" />
      </div>

      {/* Center/Right-Align: OmniBar (Mounts here, handles its own positioning via Framer Motion) */}
      <div className="flex-1 flex justify-end mr-4">
        <OmniBar />
      </div>

      {/* Right: Action Group */}
      <div className="flex items-center gap-2 md:gap-4 relative">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={onToggleNotifications}
            className={`relative p-2 transition-colors rounded-full ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-[var(--color-destructive)]" />
            )}
          </button>
          
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-2 z-50">
              <div className="px-4 py-2 border-b border-border text-sm font-semibold text-white">Notifications</div>
              <div className="p-4 text-sm text-zinc-400 text-center">No new notifications</div>
            </div>
          )}
        </div>

        {/* Waffle Menu */}
        <div className="relative">
          <button 
            onClick={onToggleWaffle}
            className={`p-2 transition-colors rounded-full ${isWaffleOpen ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          
          {isWaffleOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-2 z-50 grid grid-cols-2 gap-2 p-2">
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">
                <div className="w-10 h-10 bg-sky-500/10 rounded-full flex items-center justify-center mb-2">
                  <LayoutGrid className="w-5 h-5 text-sky-400" />
                </div>
                <span className="text-xs">Dashboard</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-white/5 transition-colors text-zinc-300 hover:text-white">
                <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center mb-2">
                  <Settings className="w-5 h-5 text-violet-400" />
                </div>
                <span className="text-xs">POS</span>
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar / Dropdown */}
        <div className="relative">
          <button 
            onClick={onToggleProfile}
            className={`w-8 h-8 rounded-full bg-[var(--color-primary)] text-zinc-950 font-bold flex items-center justify-center ml-2 transition-transform ${isProfileOpen ? 'scale-110 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-zinc-950' : 'hover:scale-105'}`}
          >
            CW
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-1 z-50">
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
