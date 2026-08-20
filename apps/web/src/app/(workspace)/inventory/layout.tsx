import { SidebarLayout } from "@soustools/design-system";
import Link from "next/link";
import React from "react";
import { Package, Factory, FileText } from "lucide-react";

export default function InventoryLayout({
  children,
  modal,
}: {
  children: any;
  modal: any;
}) {
  const sidebarContent = (
    <div className="flex flex-col gap-2 p-4">
      <Link
        href="/inventory/items"
        className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors"
      >
        <Package className="h-4 w-4" />
        <span>Items Ledger</span>
      </Link>
      <Link
        href="/inventory/vendors"
        className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors"
      >
        <Factory className="h-4 w-4" />
        <span>Vendors</span>
      </Link>
      <Link
        href="/inventory/invoices"
        className="hover:bg-accent text-muted-foreground hover:text-foreground flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span>Invoices</span>
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
