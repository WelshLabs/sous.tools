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
  Building2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Hamburger } from "./hamburger";
import { PrimaryLogo, MicroIcon } from "@soustools/ui";

export interface SidebarProps {
  isMobileOpen: boolean;
  isDesktopCollapsed: boolean;
  onCloseMobile: () => void;
  onToggleDesktop: () => void;
}

import { config } from "@soustools/config";

const BASE_NAV_ITEMS = [
  { label: "Kitchen Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "Signage", href: "/signage", icon: Tv },
  { label: "Orders", href: "/inventory/orders", icon: ShoppingBag },
  { label: "Vendors", href: "/inventory/vendors", icon: Building2 },
  { label: "Ingestion Queue", href: "/ingestion", icon: BrainCircuit },
  { label: "Devices", href: "/devices", icon: Smartphone },
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

  const navItems = [...BASE_NAV_ITEMS];
  if (config.IS_DEVELOPMENT) {
    navItems.push({ label: "POS Simulator", href: "http://localhost:5009", icon: Calculator });
  }

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
        className={`fixed inset-y-0 left-0 z-40 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-white/5 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isDesktopCollapsed ? "md:w-16" : "md:w-16 lg:w-64"}
        `}
      >
        {/* Header containing Brand Logo and Hamburger */}
        <div
          className={`h-16 flex items-center border-b border-zinc-200 dark:border-white/5 transition-all justify-between px-4
            ${isDesktopCollapsed ? "md:px-0 md:justify-center" : ""}
          `}
        >
          <div
            className={`flex items-center gap-2 transition-all ${
              isDesktopCollapsed ? "cursor-pointer hover:opacity-85" : ""
            }`}
            onClick={isDesktopCollapsed ? onToggleDesktop : undefined}
          >
            {isDesktopCollapsed ? (
              <MicroIcon className="w-8 h-8 text-sky-500" />
            ) : (
              <PrimaryLogo className="h-10 w-auto text-sky-500" />
            )}
          </div>

          {/* Morphing Hamburger inside Sidebar header on Mobile to close the drawer */}
          <Hamburger
            isOpen={isMobileOpen}
            onClick={onCloseMobile}
            className="md:hidden"
          />

          {/* Hamburger for desktop (to toggle collapse) - only show when expanded */}
          {!isDesktopCollapsed && (
            <Hamburger
              isOpen={true}
              onClick={onToggleDesktop}
              className="hidden md:flex"
            />
          )}
        </div>

         {/* Navigation list */}
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isExternal = item.href.startsWith("http");
            const isActive =
              isExternal
                ? false
                : item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            const content = (
              <>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={`text-sm font-medium transition-all duration-200 whitespace-nowrap md:hidden
                  ${isDesktopCollapsed ? "lg:hidden" : "lg:block"}
                `}
                >
                  {item.label}
                </span>
              </>
            );

            const className = `flex items-center gap-3 p-3 rounded-lg transition-colors group
              ${
                isActive
                  ? "bg-sky-500/10 text-sky-600 dark:text-sky-500"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
              }
            `;

            return isExternal ? (
              <a
                key={item.href}
                href={item.href}
                className={className}
                onClick={onCloseMobile}
                target="_blank"
                rel="noopener noreferrer"
              >
                {content}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={className}
                onClick={onCloseMobile}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-zinc-200 dark:border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-500 transition-colors group text-left"
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
