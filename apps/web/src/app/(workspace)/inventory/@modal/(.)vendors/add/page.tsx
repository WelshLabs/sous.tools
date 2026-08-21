import React from "react";
import { AddVendorContainer } from "@soustools/domain-inventory";

export const dynamic = "force-dynamic";

export default function InterceptedAddVendorModal() {
  return (
    <div className="fixed inset-0 z-[var(--z-overlay)] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="bg-background border-border animate-in zoom-in-95 flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl border shadow-2xl duration-200">
        <AddVendorContainer />
      </div>
    </div>
  );
}
