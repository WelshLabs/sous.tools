"use client";

import { useState } from "react";
import { GlobalAppBarPresentation } from "./GlobalAppBarPresentation";

export function GlobalAppBarContainer() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Scaffold: Hardcoded notification count for now
  const notificationCount = 3;

  const handleToggleProfile = () => {
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    // Scaffold logic - Supabase auth sign-out would go in the controller layer
    // but the actual invocation triggers here.
    console.log("Logging out...");
  };

  return (
    <GlobalAppBarPresentation
      notificationCount={notificationCount}
      isProfileOpen={isProfileOpen}
      onToggleProfile={handleToggleProfile}
      onLogout={handleLogout}
    />
  );
}
