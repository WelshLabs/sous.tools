import { SidebarLayout } from "@soustools/design-system";
import Link from "next/link";
import React from "react";
import { Package, ListOrdered, Factory, FileText } from "lucide-react";

export default function InventoryLayout({ children, modal }: { children: any, modal: any }) {
  const sidebarContent = (
    <div className="flex flex-col gap-2 p-4">
      <Link href="/inventory/items" className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
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
      <Link href="/inventory/invoices" className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
        <FileText className="w-4 h-4" />
        Invoices
      </Link>
    </div>
  );

  return (
    <SidebarLayout 
      sidebarContent={sidebarContent}
      mainContent={
        <>
          {children}
          {modal}
        </>
      }
    />
  );
}
