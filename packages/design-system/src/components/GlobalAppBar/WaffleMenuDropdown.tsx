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

export function WaffleMenuDropdown({ onCloseMenus, isAdmin }: WaffleMenuDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-64 bg-[var(--color-card)] border border-border rounded-xl shadow-xl overflow-hidden py-2 z-[var(--z-modal)] grid grid-cols-3 gap-2 p-4">
      <Link
        href="/home"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-sky-500/10 rounded-full flex items-center justify-center mb-2">
          <Home className="w-5 h-5 text-sky-400" />
        </div>
        <span className="text-xs font-medium">Home</span>
      </Link>
      <Link
        href="/dashboard"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center mb-2">
          <LayoutDashboard className="w-5 h-5 text-cyan-400" />
        </div>
        <span className="text-xs font-medium">Dashboard</span>
      </Link>
      <Link
        href="/pos"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-violet-500/10 rounded-full flex items-center justify-center mb-2">
          <MonitorPlay className="w-5 h-5 text-violet-400" />
        </div>
        <span className="text-xs font-medium">POS</span>
      </Link>
      <Link
        href="/kds"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center mb-2">
          <ChefHat className="w-5 h-5 text-orange-400" />
        </div>
        <span className="text-xs font-medium">KDS</span>
      </Link>
      <Link
        href="/team"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
          <Users className="w-5 h-5 text-green-400" />
        </div>
        <span className="text-xs font-medium">Team</span>
      </Link>
      <Link
        href="/recipes"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center mb-2">
          <ClipboardList className="w-5 h-5 text-yellow-400" />
        </div>
        <span className="text-xs font-medium">Recipes</span>
      </Link>
      <Link
        href="/inventory"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
          <Package className="w-5 h-5 text-blue-400" />
        </div>
        <span className="text-xs font-medium">Inventory</span>
      </Link>
      <Link
        href="/signage"
        onClick={onCloseMenus}
        className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
      >
        <div className="w-10 h-10 bg-pink-500/10 rounded-full flex items-center justify-center mb-2">
          <Tv className="w-5 h-5 text-pink-400" />
        </div>
        <span className="text-xs font-medium">Signage</span>
      </Link>
      {isAdmin && (
        <Link
          href="/admin/devices"
          onClick={onCloseMenus}
          className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-card transition-colors text-muted-foreground hover:text-foreground"
        >
          <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="w-5 h-5 text-red-400" />
          </div>
          <span className="text-xs font-medium">Admin</span>
        </Link>
      )}
    </div>
  );
}
