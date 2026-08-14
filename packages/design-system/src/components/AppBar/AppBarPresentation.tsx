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
    <header className="bg-background/80 border-border sticky top-0 z-[100000] flex h-16 w-full items-center justify-between border-b px-4 backdrop-blur-md md:px-6">
      {/* Click-Outside Overlay - Rendered INSIDE the header stacking context so it covers the header itself */}
      {isAnyMenuOpen && (
        <div className="fixed inset-0 z-[100001]" onClick={onCloseMenus} />
      )}

      {/* Left: Brand Logo & Hamburger */}
      <div className="relative z-[100002] flex items-center gap-2">
        {hasSidebar && (
          <Hamburger
            isOpen={isExpanded}
            onClick={toggleExpanded}
            className="text-zinc-300 hover:text-white md:hidden"
          />
        )}
        {hasSidebar ? (
          <button
            onClick={toggleExpanded}
            className="flex cursor-pointer items-center gap-2 text-sky-500 transition-opacity hover:opacity-80 focus:outline-none"
          >
            <PrimaryLogo
              gradient
              className="text-foreground hidden h-12 w-auto md:block"
            />
            <Lettermark className="text-foreground block h-10 w-10 md:hidden" />
          </button>
        ) : (
          <Link
            href="/home"
            className="flex cursor-pointer items-center gap-2 text-sky-500 transition-opacity hover:opacity-80"
          >
            <PrimaryLogo
              gradient
              className="text-foreground hidden h-12 w-auto md:block"
            />
            <Lettermark className="text-foreground block h-10 w-10 md:hidden" />
          </Link>
        )}
      </div>

      {/* Center/Right-Align: OmniBar mounts at the layout level */}
      <div className="relative z-10 mr-4 flex flex-1 justify-end"></div>

      {/* Right: Action Group — Elevated above Omnibar */}
      <div className="relative z-[100002] flex items-center gap-2 md:gap-4">
        <ThemeToggle />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={onToggleNotifications}
            aria-label="Notifications"
            className={`relative rounded-full p-2 transition-colors outline-none focus:outline-none ${isNotificationsOpen ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="text-foreground absolute top-1 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-destructive)] px-1 text-[10px] font-bold">
                {notifications.length}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="border-border absolute right-0 z-[100003] mt-2 w-80 overflow-hidden rounded-xl border bg-[var(--color-card)] py-2 shadow-xl">
              <div className="border-border flex items-center justify-between border-b px-4 py-2">
                <span className="text-foreground text-sm font-semibold">
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={onMarkAllAsRead}
                    className="flex cursor-pointer items-center gap-1 text-xs text-[var(--color-primary)] transition-colors hover:underline focus:outline-none"
                  >
                    <Check className="h-3 w-3" />
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
                      className="border-border cursor-pointer border-b p-4 text-left transition-colors hover:bg-zinc-800/50"
                    >
                      <p className="text-foreground text-sm font-medium">
                        {n.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-[var(--color-muted-foreground)]">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="border-border border-t bg-black/20 px-4 py-2 text-center">
                <Link
                  href="/notifications"
                  onClick={onCloseMenus}
                  className="text-xs font-medium text-[var(--color-primary)] transition-colors hover:underline"
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
            className={`rounded-full p-2 transition-colors outline-none focus:outline-none ${isWaffleOpen ? "text-foreground bg-white/10" : "text-muted-foreground hover:text-foreground hover:bg-card"}`}
          >
            <LayoutGrid className="h-5 w-5" />
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
            className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] font-bold text-zinc-950 transition-transform outline-none focus:outline-none ${isProfileOpen ? "scale-110 ring-2 ring-[var(--color-primary)] ring-offset-2 ring-offset-zinc-950" : "hover:scale-105"}`}
          >
            CW
          </button>

          {isProfileOpen && (
            <div className="border-border absolute right-0 z-[100003] mt-2 w-48 overflow-hidden rounded-xl border bg-[var(--color-card)] py-1 shadow-xl">
              <Link
                href="/settings"
                onClick={onCloseMenus}
                className="text-muted-foreground hover:bg-card flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  onCloseMenus();
                  onLogout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-[var(--color-destructive)] transition-colors hover:bg-[var(--color-destructive)]/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
