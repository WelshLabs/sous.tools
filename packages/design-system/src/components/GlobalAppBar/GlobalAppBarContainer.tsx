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

  const handleLogout = () => {
    // Scaffold logic - Supabase auth sign-out would go in the controller layer
    // but the actual invocation triggers here.
    console.log("Logging out...");
  };

  // Close menus on outside click or escape
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("header")) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsWaffleOpen(false);
      }
    };
    
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
        setIsWaffleOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
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
      onLogout={handleLogout}
    />
  );
}
