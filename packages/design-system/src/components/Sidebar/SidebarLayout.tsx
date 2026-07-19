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
export function SidebarLayout({ sidebarContent, mainContent }: SidebarLayoutProps) {
  const { isExpanded, setHasSidebar, setExpanded } = useSidebarStore();

  useEffect(() => {
    setHasSidebar(true);
    return () => setHasSidebar(false);
  }, [setHasSidebar]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background text-foreground relative">
      {/* Mobile Backdrop Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden cursor-pointer"
          onClick={() => setExpanded(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`
          fixed md:relative top-0 bottom-0 left-0 z-50 md:z-auto
          flex flex-col flex-shrink-0 border-r border-border bg-card overflow-y-auto min-h-full
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-64 translate-x-0" : "w-16 md:w-64 -translate-x-0"}
        `}
      >
        <div className={isExpanded ? "sidebar-expanded" : "sidebar-collapsed md:sidebar-expanded"}>
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Panel */}
      <main className="flex-1 min-w-0 overflow-y-auto relative pl-16 md:pl-0">
        {mainContent}
      </main>
    </div>
  );
}

