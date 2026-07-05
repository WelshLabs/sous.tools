import React from "react";
import { OmniBar } from "@soustools/design-system";

export default function OmniBarFocusPage() {
  return (
    <div className="flex-1 w-full bg-[var(--color-background)]">
      {/* 
        Perfect viewport-relative fixed container for absolute centering 
      */}
      <div className="fixed inset-0 top-[64px] flex flex-col items-center justify-center pointer-events-none">
        <div className="pointer-events-auto w-full max-w-3xl flex justify-center px-4">
          <OmniBar />
        </div>
      </div>
    </div>
  );
}
