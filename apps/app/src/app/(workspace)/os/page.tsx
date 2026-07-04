import React from "react";
import { OmniBar } from "@soustools/design-system";

export default function OmniBarFocusPage() {
  return (
    <div className="flex-1 w-full bg-[var(--color-background)] min-h-screen flex items-center justify-center h-[calc(100vh-64px)]">
      {/* 
        This is an intentionally blank canvas.
        The expanded OmniBar will render over this via Framer Motion. 
      */}
      <OmniBar />
    </div>
  );
}
