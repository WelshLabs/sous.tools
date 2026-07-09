"use client";

import { Hamburger } from "./Hamburger";
import { ThemeToggle } from "./ThemeToggle";
import { AppBarProfileDropdown } from "./AppBarProfileDropdown";
import { AppBarNotifDropdown } from "./AppBarNotifDropdown";
import type { AppBarNotification } from "./AppBar.types";

export type { AppBarNotification };

export interface AppBarProps {
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  notifications?: AppBarNotification[];
  onNotificationClick?: (id: string, link?: string | null) => void;
  onMarkAllRead?: () => void;
  onLogout?: () => void;
}

export function AppBar({
  isMobileOpen,
  onToggleMobile,
  notifications = [],
  onNotificationClick,
  onMarkAllRead,
  onLogout,
}: AppBarProps) {
  return (
    <header
      className="sticky top-0 h-16 backdrop-blur-md flex items-center justify-between px-4 transition-colors duration-300 min-w-0 w-full overflow-hidden"
      style={{
        zIndex: 35,
        backgroundColor: "rgb(15 23 42 / 0.80)", // --color-background @ 80%
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Hamburger
          isOpen={isMobileOpen}
          onClick={onToggleMobile}
          className="md:hidden"
        />
      </div>

      <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink-0">
        <ThemeToggle />
        <AppBarNotifDropdown
          notifications={notifications}
          onNotificationClick={onNotificationClick}
          onMarkAllRead={onMarkAllRead}
        />
        <AppBarProfileDropdown onLogout={onLogout} />
      </div>
    </header>
  );
}
