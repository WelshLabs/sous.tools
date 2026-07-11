/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SidebarLayoutProps {
  /** The content of the sidebar (e.g., InsightsSidebar or standard navigation) */
  sidebarContent: any;
  /** The main content area */
  mainContent: any;
}

/**
 * A standard layout template for routes that need a secondary side-panel layout
 * (e.g., Inventory, Recipes, Settings). Uses Midnight Slate theme variables.
 */
export function SidebarLayout({ sidebarContent, mainContent }: SidebarLayoutProps) {
  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar Panel */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card overflow-y-auto min-h-full">
        {sidebarContent}
      </aside>

      {/* Main Content Panel */}
      <main className="flex-1 min-w-0 overflow-y-auto relative">
        {mainContent}
      </main>
    </div>
  );
}
