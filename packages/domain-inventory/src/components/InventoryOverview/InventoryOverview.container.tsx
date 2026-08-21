"use client";

import { InventoryOverviewView } from "./InventoryOverview.view";

export function InventoryOverviewContainer() {
  const handleUploadClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger-omnibar-upload"));
    }
  };

  return <InventoryOverviewView onUploadInvoiceClick={handleUploadClick} />;
}

export { InventoryOverviewContainer as InventoryOverview };
