"use client";

import Link from "next/link";
import { Bell, LayoutGrid, LogOut, Settings, Check } from "lucide-react";
import { PrimaryLogo, Lettermark } from "../Logos/Logo";
import { ThemeToggle } from "../ThemeToggle/ThemeToggle";
import { Hamburger } from "../Hamburger/Hamburger";
import { useSidebarStore } from "../../store/sidebarStore";
import { WaffleMenuDropdown } from "./WaffleMenuDropdown";

export interface AppBarNotification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
}

export interface AppBarPresentationProps {
  notifications: AppBarNotification[];
  isProfileOpen: boolean;
  isNotificationsOpen: boolean;
  isWaffleOpen: boolean;
  onToggleProfile: () => void;
  onToggleNotifications: () => void;
  onToggleWaffle: () => void;
  onCloseMenus: () => void;
  onLogout: () => void;
  onMarkAllAsRead: () => void;
  isAdmin?: boolean;
}

export function AppBarPresentation({
  notifications,
  isProfileOpen,
  isNotificationsOpen,
  isWaffleOpen,
  onToggleProfile,
  onToggleNotifications,
  onToggleWaffle,
  onCloseMenus,
  onLogout,
  onMarkAllAsRead,
  isAdmin,
}: AppBarPresentationProps) {
  const { hasSidebar, isExpanded, toggleExpanded } = useSidebarStore();
  const isAnyMenuOpen = isProfileOpen || isNotificationsOpen || isWaffleOpen;

  return (
    <header className="sticky top-0 z-[100000] w-full bg-background/80 backdrop-blur-md border-b border-border h-16 px-4 md:px-6 flex items-center justify-between">
      {/* Click-Outside Overlay - Rendered INSIDE the header stacking context so it covers the header itself */}
      {isAnyMenuOpen && (
        <div
          className="fixed inset-0 z-[100001]"
          onClick={onCloseMenus}
        />
      )}

      {/* Left: Brand Logo & Hamburger */}
      <div className="flex items-center gap-2 relative z-[100002]">
        {hasSidebar && (
          <Hamburger
            isOpen={isExpanded}
            onClick={toggleExpanded}
            className="md:hidden text-zinc-300 hover:text-white"
          />
        )}
        {hasSidebar ? (
          <button
            onClick={toggleExpanded}
            className="flex items-center gap-2 text-sky-500 cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
          >
            <PrimaryLogo
              gradient
              className="hidden md:block h-12 w-auto text-foreground"
            />
            <Lettermark className="block md:hidden h-10 w-10 text-foreground" />
          </button>
        ) : (
          <Link
            href="/home"
            className="flex items-center gap-2 text-sky-500 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <PrimaryLogo
              gradient
              className="hidden md:block h-12 w-auto text-foreground"
            />
            <Lettermark className="block md:hidden h-10 w-10 text-foreground" />
          </Link>
        )}
      </div>

      {/* Center/Right-Align: OmniBar mounts at the layout level */}
      <div className="flex-1 flex justify-end mr-4 relative z-10"></div>

      {/* Right: Action Group — Elevated above Omnibar */}
      <div className="flex items-center gap-2 md:gap-4 relative z-[100002]">
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            aria-label="Notifications"
            className={`relative p-2 transition-colors rounded-full focus:outline-none outline-none ${isNotificationsOpen ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-destructive)] px-1 text-[10px] font-bold text-foreground">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-2 z-[100003]">
              <div className="px-4 py-2 border-b border-border flex justify-between items-center">
                <span className="text-sm font-semibold text-foreground">
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="text-xs text-[var(--color-primary)] flex items-center gap-1 cursor-pointer hover:underline focus:outline-none transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-[var(--color-muted-foreground)]">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 border-b border-border hover:bg-zinc-800/50 transition-colors cursor-pointer text-left"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {n.title}
                      </p>
                      <p className="text-xs text-[var(--color-muted-foreground)] mt-1 line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-border bg-black/20 text-center">
                <Link 
                  href="/notifications" 
                  onClick={onCloseMenus}
                  className="text-xs text-[var(--color-primary)] font-medium hover:underline transition-colors"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Waffle Menu */}
        <div className="relative">
          <button
            onClick={onToggleWaffle}
            aria-label="App launcher"
            className={`p-2 transition-colors rounded-full focus:outline-none outline-none ${isWaffleOpen ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {isWaffleOpen && (
            <WaffleMenuDropdown onCloseMenus={onCloseMenus} isAdmin={isAdmin} />
          )}
        </div>

        {/* User Profile Avatar / Dropdown */}
        <div className="relative">
          <button
            onClick={onToggleProfile}
            aria-label="User profile"
            className={`w-8 h-8 rounded-full bg-[var(--color-primary)] text-zinc-950 font-bold flex items-center justify-center ml-2 transition-transform focus:outline-none outline-none ${isProfileOpen ? "scale-110 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-zinc-950" : "hover:scale-105"}`}
          >
            CW
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-1 z-[100003]">
              <Link
                href="/settings"
                onClick={onCloseMenus}
                className="w-full px-4 py-2 text-sm text-left flex items-center gap-2 text-muted-foreground hover:bg-card transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  onCloseMenus();
                  onLogout();
                }}
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
