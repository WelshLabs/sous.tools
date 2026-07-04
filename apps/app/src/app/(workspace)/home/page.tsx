import React from "react";
import { OmniBar } from "@soustools/design-system";

export default function OmniBarFocusPage() {
  return (
    <div className="flex-1 w-full bg-[var(--color-background)] relative">
      {/* 
        Absolute center wrapper for OmniBar 
      */}
      <div className="absolute inset-0 flex items-center justify-center">
        <OmniBar />
      </div>
    </div>
  );
}
