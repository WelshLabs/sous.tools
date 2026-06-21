"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Tv,
  Smartphone,
  Calculator,
  LogOut,
  ChefHat,
  ShoppingBag,
  BrainCircuit,
  PenTool
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Hamburger } from "./hamburger";

export interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

const NAV_ITEMS = [
  { label: "Kitchen Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "TV Signage", href: "/tv", icon: Tv },
  { label: "Purchasing", href: "/purchasing", icon: ShoppingBag },
  { label: "Ingestion Queue", href: "/ingestion", icon: BrainCircuit },
  { label: "Whiteboard", href: "/inventory/whiteboard", icon: PenTool },
  { label: "Devices", href: "/devices", icon: Smartphone },
  { label: "POS Simulator", href: "/pos", icon: Calculator },
];

/**
 * Sidebar component provides the main navigation shell for the dashboard.
 */
export default function Sidebar({
  isMobileOpen,
  isDesktopCollapsed,
  onCloseMobile,
  onToggleDesktop,
}: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar shell */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-zinc-950 border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopCollapsed ? "md:w-16" : "md:w-16 lg:w-64"}
        `}
      >
        {/* Header containing Brand Logo and Hamburger */}
        <div
          className={`h-16 flex items-center border-b border-white/5 transition-all justify-between px-4
            ${isDesktopCollapsed ? "md:px-0 md:justify-center" : ""}
          `}
        >
          <div
            className={`flex items-center gap-2 transition-all
              ${isDesktopCollapsed ? "md:hidden" : ""}
            `}
          >
            <span className="text-xl font-bold text-sky-500 font-brand whitespace-nowrap">
              SOUS TOOLS
            </span>
          </div>

          {/* Morphing Hamburger inside Sidebar header on Mobile to close the drawer */}
          <Hamburger
            isOpen={isMobileOpen}
            onClick={onCloseMobile}
            className="md:hidden"
          />

          {/* Hamburger for desktop (to toggle collapse) */}
          <Hamburger
            isOpen={!isDesktopCollapsed}
            onClick={onToggleDesktop}
            className="hidden md:flex"
          />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors group
                  ${
                    isActive
                      ? "bg-sky-500/10 text-sky-500"
                      : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }
                `}
                onClick={onCloseMobile}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={`text-sm font-medium transition-all duration-200 whitespace-nowrap md:hidden
                  ${isDesktopCollapsed ? "lg:hidden" : "lg:block"}
                `}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors group text-left"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={`text-sm font-medium transition-all duration-200 whitespace-nowrap md:hidden
              ${isDesktopCollapsed ? "lg:hidden" : "lg:block"}
            `}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
