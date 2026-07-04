"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Check,
} from "lucide-react";
import { Hamburger } from "./Hamburger";
import { ThemeToggle } from "./ThemeToggle";

/**
 * A single unread notification displayed in the bell dropdown.
 */
export interface AppBarNotification {
  id: string;
  title: string;
  message: string;
  link?: string | null;
}

/**
 * Props for the AppBar component.
 */
export interface AppBarProps {
  /** Whether the mobile drawer sidebar is currently open. */
  isMobileOpen: boolean;
  /** Callback to toggle the mobile drawer sidebar. */
  onToggleMobile: () => void;
  /**
   * Unread notifications to display in the bell dropdown.
   * Data-fetching and real-time subscription stay in the `apps/app` layer;
   * this component is purely presentational.
   */
  notifications?: AppBarNotification[];
  /**
   * Called when the user clicks a notification item.
   * The app layer should mark it read and optionally navigate.
   */
  onNotificationClick?: (id: string, link?: string | null) => void;
  /** Called when the user clicks "Mark all read". */
  onMarkAllRead?: () => void;
  /** Called when the user clicks "Logout". The app layer handles the signOut call. */
  onLogout?: () => void;
}

/**
 * AppBar — the sticky top header shell for the Neon-Glass design system.
 *
 * Renders at z-index 35 (below `--z-sidebar: 50` so the sidebar overlaps it
 * on mobile). Uses `--color-background/80` + `backdrop-blur-md` for the
 * frosted glass header effect.
 *
 * **Data boundary**: All Supabase calls, real-time subscriptions, and auth
 * operations MUST live in the `apps/app` controller layer. Pass data and
 * callbacks as props.
 *
 * @tenant-docs-export
 * # AppBar
 * ```tsx
 * import { AppBar } from "@soustools/design-system";
 *
 * <AppBar
 *   isMobileOpen={isMobileOpen}
 *   onToggleMobile={toggleMobile}
 *   notifications={notifications}
 *   onNotificationClick={handleNotifClick}
 *   onMarkAllRead={markAllRead}
 *   onLogout={handleLogout}
 * />
 * ```
 */
export function AppBar({
  isMobileOpen,
  onToggleMobile,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onLogout,
}: AppBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header
      className="sticky top-0 h-16 backdrop-blur-md flex items-center justify-between
        px-4 transition-colors duration-300 min-w-0 w-full overflow-hidden"
      style={{
        zIndex: 35,
        backgroundColor: "rgb(15 23 42 / 0.80)", // --color-background @ 80%
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      {/* Left — Hamburger (mobile only) */}
      <div className="flex items-center gap-3 min-w-0">
        <Hamburger
          isOpen={isMobileOpen}
          onClick={onToggleMobile}
          className="md:hidden"
        />
      </div>

      {/* Right — Theme toggle, Notifications, Profile */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full transition-colors
              focus-visible:outline-none focus-visible:ring-2 cursor-pointer"
            aria-label="Notifications"
            style={{
              color: "var(--color-muted-foreground)",
              ["--tw-ring-color" as string]: "var(--color-ring)",
            }}
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ backgroundColor: "var(--color-destructive)" }}
              />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsNotifOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl z-40
                  animate-in fade-in slide-in-from-top-2 duration-150
                  flex flex-col overflow-hidden max-h-96"
                style={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between p-3"
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    Notifications
                  </span>
                  {notifications.length > 0 && onMarkAllRead && (
                    <button
                      onClick={onMarkAllRead}
                      className="text-xs flex items-center gap-1 cursor-pointer
                        transition-colors"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notification list */}
                <div className="overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div
                      className="p-4 text-center text-sm"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNotificationClick?.(n.id, n.link);
                          setIsNotifOpen(false);
                        }}
                        className="p-3 transition-colors cursor-pointer text-left"
                        style={{ borderBottom: "1px solid var(--color-border)" }}
                      >
                        <div
                          className="text-sm font-medium"
                          style={{ color: "var(--color-foreground)" }}
                        >
                          {n.title}
                        </div>
                        <div
                          className="text-xs mt-0.5 line-clamp-2"
                          style={{ color: "var(--color-muted-foreground)" }}
                        >
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-full
              transition-colors focus-visible:outline-none cursor-pointer"
            aria-label="User profile menu"
            aria-expanded={isProfileOpen}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: "rgb(76 201 240 / 0.10)", // primary/10
                border: "1px solid rgb(76 201 240 / 0.20)",
                color: "var(--color-primary)",
              }}
            >
              <User className="w-4 h-4" />
            </div>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              style={{ color: "var(--color-muted-foreground)" }}
            />
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsProfileOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1 z-40
                  animate-in fade-in slide-in-from-top-2 duration-150"
                style={{
                  backgroundColor: "var(--color-popover)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <Link
                  href="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
                  style={{ color: "var(--color-muted-foreground)" }}
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout?.();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm
                    transition-colors text-left cursor-pointer"
                  style={{ color: "var(--color-muted-foreground)" }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
