"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

export interface AppBarProfileDropdownProps {
  onLogout?: () => void;
}

export function AppBarProfileDropdown({ onLogout }: AppBarProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full transition-colors focus-visible:outline-none cursor-pointer"
        aria-label="User profile menu"
        aria-expanded={isOpen}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: "rgb(76 201 240 / 0.10)", // primary/10
            border: "1px solid rgb(76 201 240 / 0.20)",
            color: "var(--color-primary)",
          }}
        >
          <User className="w-4 h-4" />
        </div>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--color-muted-foreground)" }}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30 cursor-default" onClick={() => setIsOpen(false)} />
          <div
            className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-150"
            style={{
              backgroundColor: "var(--color-popover)",
              border: "1px solid var(--color-border)",
            }}
          >
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 text-sm transition-colors"
              style={{ color: "var(--color-muted-foreground)" }}
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout?.();
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-left cursor-pointer"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
