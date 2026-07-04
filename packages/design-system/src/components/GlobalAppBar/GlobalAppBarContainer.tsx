"use client";

import { useState, useEffect } from "react";
import { GlobalAppBarPresentation } from "./GlobalAppBarPresentation";

export interface GlobalAppBarContainerProps {
  onLogoutAction?: () => void | Promise<void>;
}

export function GlobalAppBarContainer({ onLogoutAction }: GlobalAppBarContainerProps = {}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  
  // Scaffold: Hardcoded notification count for now
  const [unreadCount, setUnreadCount] = useState(3);

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

  const handleMarkAllAsRead = () => {
    setUnreadCount(0);
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
      notificationCount={unreadCount}
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
