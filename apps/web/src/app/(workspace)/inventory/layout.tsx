import { SidebarLayout } from "@soustools/design-system";
import Link from "next/link";
import React from "react";
import { Package, ListOrdered, Factory } from "lucide-react";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  const sidebarContent = (
    <div className="flex flex-col gap-2 p-4">
      <Link href="/inventory/items-ledger" className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <Package className="w-4 h-4" />
        Items Ledger
      </Link>
      <Link href="/inventory/orders" className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <ListOrdered className="w-4 h-4" />
        Orders
      </Link>
      <Link href="/inventory/vendors" className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <Factory className="w-4 h-4" />
        Vendors
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
