"use client";

import React, { useEffect } from "react";
import { useSidebarStore } from "../../store/sidebarStore";

export interface SidebarLayoutProps {
  /** The content of the sidebar (e.g., InsightsSidebar or standard navigation) */
  sidebarContent: React.ReactNode;
  /** The main content area */
  mainContent: React.ReactNode;
}

/**
 * A standard layout template for routes that need a secondary side-panel layout
 * (e.g., Inventory, Recipes, Settings). Uses Midnight Slate theme variables.
 */
export function SidebarLayout({
  sidebarContent,
  mainContent,
}: SidebarLayoutProps) {
  const { isExpanded, setHasSidebar, setExpanded } = useSidebarStore();

  useEffect(() => {
    setHasSidebar(true);
    return () => setHasSidebar(false);
  }, [setHasSidebar]);

  return (
    <div className="bg-background text-foreground relative flex h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isExpanded && (
        <div
          className="bg-background/60 fixed inset-0 z-40 cursor-pointer backdrop-blur-sm md:hidden"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`border-border bg-card fixed top-0 bottom-0 left-0 z-50 flex min-h-full flex-shrink-0 flex-col overflow-y-auto border-r transition-all duration-300 ease-in-out md:relative md:z-auto ${isExpanded ? "w-64 translate-x-0" : "w-16 -translate-x-0 md:w-64"} `}
      >
        <div
          className={
            isExpanded
              ? "sidebar-expanded"
              : "sidebar-collapsed md:sidebar-expanded"
          }
        >
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Panel */}
      <main className="relative min-w-0 flex-1 overflow-y-auto pl-16 md:pl-0">
        {mainContent}
      </main>
    </div>
  );
}
