"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown, Bell, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { AppNotification } from "@soustools/api-types";
import { toast } from "sonner";
import { Hamburger } from "./hamburger";
import { ThemeToggle } from "./theme-toggle";

/**
 * Props for the AppBar component.
 */
export interface AppBarProps {
  /** Whether the mobile drawer sidebar is currently open. */
  isMobileOpen: boolean;
  /** Callback to toggle the mobile drawer sidebar. */
  onToggleMobile: () => void;
}

/**
 * AppBar component renders the sticky top header bar.
 * Contains responsive hamburger menu toggles and a user profile dropdown.
 *
 * @tenant-docs-export
 * Use the app bar's top-right profile dropdown to quickly navigate to Settings
 * or log out of the Kitchen application.
 */
export default function AppBar({
  isMobileOpen,
  onToggleMobile,
}: AppBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  React.useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      if (data) {
        setNotifications(data as any as AppNotification[]);
      }
    };
    fetchNotifs();

    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: Record<string, unknown> }) => {
          const newNotif = payload.new as unknown as AppNotification;
          setNotifications((prev) => [newNotif, ...prev]);
          toast.success(newNotif.title, {
            description: newNotif.message,
            action: newNotif.link
              ? {
                  label: "Review",
                  onClick: () => (window.location.href = newNotif.link!),
                }
              : undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const markAsRead = async (id: string, link?: string | null) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setIsNotifOpen(false);
    if (link) window.location.href = link;
  };

  const markAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", ids);
      setNotifications([]);
    }
  };

  return (
    <header className="sticky top-0 z-[35] h-16 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 flex items-center justify-between px-4 transition-colors duration-300">
      {/* Left section: Hamburger toggles */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <Hamburger
          isOpen={isMobileOpen}
          onClick={onToggleMobile}
          className="md:hidden"
        />
      </div>

      {/* Right section: Notifications and Profile */}
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative flex items-center justify-center">
          <ThemeToggle />
        </div>
        
        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Notifications menu"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {isNotifOpen && (
            <>
              <div
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setIsNotifOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden max-h-96">
                <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-zinc-500">
                      No new notifications
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id, n.link)}
                        className="p-3 border-b border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors cursor-pointer text-left last:border-b-0"
                      >
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{n.title}</div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">{n.message}</div>
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
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          aria-label="User profile menu"
        >
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-500">
            <User className="w-4 h-4" />
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu Overlay and List */}
        {isProfileOpen && (
          <>
            <div
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setIsProfileOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-colors text-left cursor-pointer"
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
