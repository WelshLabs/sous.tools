"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ChefHat, Bell, Menu } from "lucide-react";
import { MicroIcon } from "@soustools/ui";

export interface BottomNavProps {
  onToggleMobile: () => void;
}

export function BottomNav({ onToggleMobile }: BottomNavProps) {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: "Kitchen", href: "/", icon: LayoutDashboard },
    { label: "Recipes", href: "/recipes", icon: ChefHat },
  ];

  return (
    <nav className="md:hidden st-glass-panel fixed bottom-0 left-0 right-0 h-20 border-t border-white/5 flex items-center justify-around px-2 pb-safe z-[60]">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation ${
              isActive ? "text-sky-500" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}

      {/* Central Brand Home Button */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center p-2 -mt-8 bg-zinc-950 rounded-full border border-white/10 shadow-lg shadow-sky-500/20 active:scale-95 transition-transform touch-manipulation z-[61]"
      >
        <MicroIcon className="w-12 h-12 text-sky-500" />
      </Link>

      <Link
        href="/signage"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation ${
          pathname.startsWith("/signage") ? "text-sky-500" : "text-zinc-400 hover:text-zinc-200"
        }`}
      >
        <Bell className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Alerts</span>
      </Link>

      <button
        onClick={onToggleMobile}
        className="flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation text-zinc-400 hover:text-zinc-200"
      >
        <Menu className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Menu</span>
      </button>
    </nav>
  );
}
