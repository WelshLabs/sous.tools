"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ChefHat, ShoppingBag } from "lucide-react";
import { MicroIcon } from "@soustools/ui";

export interface BottomNavProps {
  onToggleMobile: () => void;
}

export function BottomNav({ onToggleMobile: _onToggleMobile }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden st-glass-panel fixed bottom-0 left-0 right-0 h-20 border-t border-black/5 dark:border-white/5 flex items-center justify-around px-2 pb-safe z-[60]">
      {/* 1. Dashboard */}
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation ${
          pathname.startsWith("/dashboard") ? "text-sky-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
        }`}
      >
        <LayoutDashboard className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Dashboard</span>
      </Link>

      {/* 2. Recipes */}
      <Link
        href="/recipes"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation ${
          pathname.startsWith("/recipes") ? "text-sky-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
        }`}
      >
        <ChefHat className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Recipes</span>
      </Link>

      {/* 3. Central Brand Home Button */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center p-2 bg-zinc-50 dark:bg-zinc-950 rounded-full border border-black/10 dark:border-white/10 shadow-lg shadow-sky-500/20 active:scale-95 transition-transform touch-manipulation z-[61]"
      >
        <MicroIcon className="w-12 h-12 text-sky-500" />
      </Link>

      {/* 4. Orders */}
      <Link
        href="/inventory/orders"
        className={`flex flex-col items-center justify-center min-w-[64px] min-h-[64px] transition-transform active:scale-90 touch-manipulation ${
          pathname.startsWith("/inventory/orders") ? "text-sky-500" : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:text-zinc-200"
        }`}
      >
        <ShoppingBag className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Orders</span>
      </Link>
    </nav>
  );
}
