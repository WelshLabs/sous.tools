import React from "react";
import { GlobalAppBar, OmniBarProvider } from "@soustools/design-system";
import { logoutAction } from "@/app/actions/auth";
export default async function WorkspaceLayout({ 
  children,
  modal
}: { 
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  let notifications = [];
  try {
    const res = await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6001'}/notifications/unread`, {
      cache: "no-store",
    });
    if (res.ok) {
      const payload = await res.json();
      notifications = payload.data || [];
    }
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalAppBar 
        notifications={notifications || []} 
        onLogoutAction={logoutAction} 
        isAdmin={true}
      />
      <main className="flex-1 flex flex-col relative h-[calc(100vh-64px)] overflow-y-auto min-w-0">
        <OmniBarProvider>
          {children}
          {modal}
        </OmniBarProvider>
      </main>
    </div>
  );
}
