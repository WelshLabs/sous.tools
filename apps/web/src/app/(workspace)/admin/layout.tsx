import { SidebarLayout } from "@soustools/design-system";
import Link from "next/link";
import React from "react";
import { MonitorSmartphone, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: any }) {
  const sidebarContent = (
    <div className="flex flex-col gap-2 p-4">
      <div className="mb-1 px-2 font-mono text-xs text-zinc-500 uppercase">
        Administration
      </div>
      <Link
        href="/admin/devices"
        className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <MonitorSmartphone className="h-4 w-4 text-cyan-400" />
        <span>Devices</span>
      </Link>
      <Link
        href="/admin/users"
        className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        <Users className="h-4 w-4 text-violet-400" />
        <span>Users</span>
      </Link>
    </div>
  );

  return (
    <SidebarLayout sidebarContent={sidebarContent} mainContent={children} />
  );
}
