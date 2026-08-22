"use client";

import React from "react";
import { OmniBarProvider } from "@soustools/design-system";

interface FullscreenLayoutProps {
  children: React.ReactNode;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
  return (
    <OmniBarProvider>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
        {children}
      </div>
    </OmniBarProvider>
  );
}
