import { SidebarLayout } from "@soustools/design-system";
import Link from "next/link";
import React from "react";
import { MonitorSmartphone, Users } from "lucide-react";

export default function AdminLayout({ children }: { children: any }) {
  const sidebarContent = (
    <div className="flex flex-col gap-2 p-4">
      <Link href="/admin/devices" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-zinc-300 hover:text-white transition-colors text-sm font-medium">
        <MonitorSmartphone className="w-4 h-4" />
        Devices
      </Link>
      <Link href="/admin/users" className="flex items-center gap-2 p-2 hover:bg-white/5 rounded-lg text-zinc-300 hover:text-white transition-colors text-sm font-medium">
        <Users className="w-4 h-4" />
        Users
      </Link>
    </div>
  );

  return (
    <SidebarLayout 
      sidebarContent={sidebarContent}
      mainContent={children}
    />
  );
}
