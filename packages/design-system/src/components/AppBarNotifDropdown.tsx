"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import type { AppBarNotification } from "./AppBar.types";

export interface AppBarNotifDropdownProps {
  notifications: AppBarNotification[];
  onNotificationClick?: (id: string, link?: string | null) => void;
  onMarkAllRead?: () => void;
}

export function AppBarNotifDropdown({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}: AppBarNotifDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 cursor-pointer"
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

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl z-40 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col overflow-hidden max-h-96"
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
              <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
                Notifications
              </span>
              {notifications.length > 0 && onMarkAllRead && (
                <button
                  onClick={onMarkAllRead}
                  className="text-xs flex items-center gap-1 cursor-pointer transition-colors"
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
                      setIsOpen(false);
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
  );
}
