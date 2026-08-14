"use client";

import React from "react";

interface FullscreenLayoutProps {
  children: any;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
      {children}
    </div>
  );
}
