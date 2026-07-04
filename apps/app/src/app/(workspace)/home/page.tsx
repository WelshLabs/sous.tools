import React from "react";
import { OmniBar } from "@soustools/design-system";

export default function OmniBarFocusPage() {
  return (
    <div className="flex-1 w-full bg-[var(--color-background)] flex flex-col h-[calc(100vh-64px)] items-center justify-center">
      {/* 
        This is an intentionally blank canvas.
        The expanded OmniBar will render over this via Framer Motion. 
      */}
      <OmniBar />
    </div>
  );
}
