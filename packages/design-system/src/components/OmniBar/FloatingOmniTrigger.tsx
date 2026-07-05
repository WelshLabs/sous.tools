"use client";


import { OmniBar } from "./index";

export function FloatingOmniTrigger() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <OmniBar />
    </div>
  );
}
