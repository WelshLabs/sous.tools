"use client";

import { useState, useEffect } from "react";
import { GlobalAppBarPresentation, AppBarNotification } from "./GlobalAppBarPresentation";
import { createBrowserClient } from "@soustools/supabase";

export interface GlobalAppBarContainerProps {
  onLogoutAction?: () => void | Promise<void>;
}

export function GlobalAppBarContainer({ onLogoutAction }: GlobalAppBarContainerProps = {}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  
  // Real notifications state
  const [notifications, setNotifications] = useState<AppBarNotification[]>([]);
  const supabase = createBrowserClient();

  // Fetch initial notifications and subscribe to realtime
  useEffect(() => {
    const fetchNotifs = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("is_read", false)
        .order("created_at", { ascending: false });
      if (data) {
        setNotifications(data as any as AppBarNotification[]);
      }
    };
    fetchNotifs();

    const channel = supabase
      .channel("realtime_notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload: { new: Record<string, unknown> }) => {
          const newNotif = payload.new as unknown as AppBarNotification;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
    setIsNotificationsOpen(false);
    setIsWaffleOpen(false);
  };

  const handleToggleNotifications = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileOpen(false);
    setIsWaffleOpen(false);
  };

  const handleToggleWaffle = () => {
    setIsWaffleOpen((prev) => !prev);
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
  };

  const handleCloseMenus = () => {
    setIsProfileOpen(false);
    setIsNotificationsOpen(false);
    setIsWaffleOpen(false);
  };

  const handleLogout = async () => {
    if (onLogoutAction) {
      await onLogoutAction();
    } else {
      console.log("Logging out...");
    }
  };

  const handleMarkAllAsRead = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length > 0) {
      await supabase.from("notifications").update({ is_read: true }).in("id", ids);
      setNotifications([]);
    }
  };

  // Close menus on escape
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseMenus();
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  return (
    <GlobalAppBarPresentation
      notifications={notifications}
      isProfileOpen={isProfileOpen}
      isNotificationsOpen={isNotificationsOpen}
      isWaffleOpen={isWaffleOpen}
      onToggleProfile={handleToggleProfile}
      onToggleNotifications={handleToggleNotifications}
      onToggleWaffle={handleToggleWaffle}
      onCloseMenus={handleCloseMenus}
      onLogout={handleLogout}
      onMarkAllAsRead={handleMarkAllAsRead}
    />
  );
}
