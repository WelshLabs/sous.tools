"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Hamburger } from "./hamburger";

/**
 * Props for the AppBar component.
 */
export interface AppBarProps {
  /** Whether the mobile drawer sidebar is currently open. */
  isMobileOpen: boolean;
  /** Callback to toggle the mobile drawer sidebar. */
  onToggleMobile: () => void;
}

/**
 * AppBar component renders the sticky top header bar.
 * Contains responsive hamburger menu toggles and a user profile dropdown.
 *
 * @tenant-docs-export
 * Use the app bar's top-right profile dropdown to quickly navigate to Settings
 * or log out of the Kitchen application.
 */
export default function AppBar({
  isMobileOpen,
  onToggleMobile,
}: AppBarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 h-16 bg-zinc-950/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4">
      {/* Left section: Hamburger toggles */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger toggle */}
        <Hamburger
          isOpen={isMobileOpen}
          onClick={onToggleMobile}
          className="md:hidden"
        />
      </div>

      {/* Right section: Profile button and Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-white/5 transition-colors focus:outline-none cursor-pointer"
          aria-label="User profile menu"
        >
          <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500">
            <User className="w-4 h-4" />
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              isProfileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu Overlay and List */}
        {isProfileOpen && (
          <>
            <div
              className="fixed inset-0 z-30 cursor-default"
              onClick={() => setIsProfileOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-2xl py-1 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-500 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
