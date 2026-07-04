"use client";

import { useState, useEffect } from "react";
import { GlobalAppBarPresentation } from "./GlobalAppBarPresentation";

export interface GlobalAppBarContainerProps {
  onLogoutAction?: () => void | Promise<void>;
}

// Scaffold dummy notifications matching legacy
const initialNotifications = [
  { id: "1", title: "Inventory due", message: "Counts for Walk-in 1 are due in 10 mins." },
  { id: "2", title: "Low Stock", message: "Low stock alert: Butter, Unsalted." },
  { id: "3", title: "Order received", message: "US Foods order delivered." }
];

export function GlobalAppBarContainer({ onLogoutAction }: GlobalAppBarContainerProps = {}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  
  // Real notifications state
  const [notifications, setNotifications] = useState(initialNotifications);

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
    setNotifications([]);
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
