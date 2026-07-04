"use client";

import { useState, useEffect } from "react";
import { GlobalAppBarPresentation } from "./GlobalAppBarPresentation";

export function GlobalAppBarContainer() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaffleOpen, setIsWaffleOpen] = useState(false);
  
  // Scaffold: Hardcoded notification count for now
  const notificationCount = 3;

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

  const handleLogout = () => {
    // Scaffold logic - Supabase auth sign-out would go in the controller layer
    // but the actual invocation triggers here.
    console.log("Logging out...");
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
      notificationCount={notificationCount}
      isProfileOpen={isProfileOpen}
      isNotificationsOpen={isNotificationsOpen}
      isWaffleOpen={isWaffleOpen}
      onToggleProfile={handleToggleProfile}
      onToggleNotifications={handleToggleNotifications}
      onToggleWaffle={handleToggleWaffle}
      onCloseMenus={handleCloseMenus}
      onLogout={handleLogout}
    />
  );
}
