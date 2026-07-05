import React from "react";

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
  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Panel */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-y-auto">
        {sidebarContent}
      </aside>

      {/* Main Content Panel */}
      <main className="flex-1 overflow-y-auto relative">
        {mainContent}
      </main>
    </div>
  );
}
