"use client";

import { useState, useEffect } from "react";
import { GlobalAppBarPresentation, type AppBarNotification } from "./GlobalAppBarPresentation";
export interface GlobalAppBarContainerProps {
  notifications?: AppBarNotification[];
  onLogoutAction?: () => void | Promise<void>;
  onMarkAllAsReadAction?: () => void | Promise<void>;
  isAdmin?: boolean;
}

export function GlobalAppBarContainer({ 
  notifications = [],
  onLogoutAction,
  onMarkAllAsReadAction,
  isAdmin,
}: GlobalAppBarContainerProps = {}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);

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
    if (onMarkAllAsReadAction) {
      await onMarkAllAsReadAction();
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
      isAdmin={isAdmin}
    />
  );
}
