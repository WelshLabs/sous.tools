"use client";

import React from "react";

interface FullscreenLayoutProps {
  children: any;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {children}
    </div>
  );
}
