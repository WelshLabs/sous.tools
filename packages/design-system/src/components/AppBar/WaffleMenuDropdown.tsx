"use client";

import Link from "next/link";
import {
  Home,
  LayoutDashboard,
  MonitorPlay,
  ChefHat,
  Users,
  ClipboardList,
  Package,
  Tv,
  ShieldCheck,
} from "lucide-react";

interface WaffleMenuDropdownProps {
  onCloseMenus: () => void;
  isAdmin?: boolean;
}

export function WaffleMenuDropdown({
  onCloseMenus,
  isAdmin,
}: WaffleMenuDropdownProps) {
  return (
    <>
      {/* Full-viewport click-outside overlay — sits above page content (z-overlay)
          but below the dropdown itself (z-modal), so any click outside the grid
          reliably fires onCloseMenus regardless of the header's stacking context. */}
      <div
        className="fixed inset-0 z-[var(--z-overlay)] h-dvh w-screen"
        aria-hidden="true"
        onClick={onCloseMenus}
      />
      <div className="border-border absolute right-0 z-[var(--z-modal)] mt-2 grid w-64 grid-cols-3 gap-2 overflow-hidden rounded-xl border bg-[var(--color-card)] p-4 py-2 shadow-xl">
        <Link
          href="/home"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/10">
            <Home className="h-5 w-5 text-sky-400" />
          </div>
          <span className="text-xs font-medium">Home</span>
        </Link>
        <Link
          href="/dashboard"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10">
            <LayoutDashboard className="h-5 w-5 text-cyan-400" />
          </div>
          <span className="text-xs font-medium">Dashboard</span>
        </Link>
        <Link
          href="/pos"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10">
            <MonitorPlay className="h-5 w-5 text-violet-400" />
          </div>
          <span className="text-xs font-medium">POS</span>
        </Link>
        <Link
          href="/kds"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
            <ChefHat className="h-5 w-5 text-orange-400" />
          </div>
          <span className="text-xs font-medium">KDS</span>
        </Link>
        <Link
          href="/team"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
            <Users className="h-5 w-5 text-green-400" />
          </div>
          <span className="text-xs font-medium">Team</span>
        </Link>
        <Link
          href="/recipes"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10">
            <ClipboardList className="h-5 w-5 text-yellow-400" />
          </div>
          <span className="text-xs font-medium">Recipes</span>
        </Link>
        <Link
          href="/inventory"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
            <Package className="h-5 w-5 text-blue-400" />
          </div>
          <span className="text-xs font-medium">Inventory</span>
        </Link>
        <Link
          href="/signage"
          onClick={onCloseMenus}
          className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
        >
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-pink-500/10">
            <Tv className="h-5 w-5 text-pink-400" />
          </div>
          <span className="text-xs font-medium">Signage</span>
        </Link>
        {isAdmin && (
          <Link
            href="/admin/devices"
            onClick={onCloseMenus}
            className="hover:bg-card text-muted-foreground hover:text-foreground flex flex-col items-center justify-center rounded-lg p-2 transition-colors"
          >
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
            <span className="text-xs font-medium">Admin</span>
          </Link>
        )}
      </div>
    </>
  );
}
