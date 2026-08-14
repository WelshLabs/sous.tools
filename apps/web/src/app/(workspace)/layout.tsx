import React from "react";
import { AppBar, OmniBarProvider } from "@soustools/design-system";
import { logoutAction } from "@/app/actions/auth";
import { GoogleDriveBrowserWrapper } from "@/components/GoogleDriveBrowserWrapper";
import { api } from "@soustools/api-client";

export default async function WorkspaceLayout({
  children,
  modal,
}: {
  children: any;
  modal: any;
}) {
  let notifications = [];
  try {
    const { data, error } = await api.GET("/notifications/unread", {
      cache: "no-store",
    });
    if (!error && data) {
      notifications = (data as any).data || [];
    }
  } catch (error: any) {
    if (
      error &&
      (error.digest === "DYNAMIC_SERVER_USAGE" ||
        error.message?.includes("Dynamic server usage") ||
        error.message?.includes("dynamic-server-error"))
    ) {
      throw error;
    }
    console.error("Failed to fetch notifications:", error);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppBar
        notifications={notifications || []}
        onLogoutAction={logoutAction}
        isAdmin={true}
      />
      <main
        id="workspace-main"
        className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto"
      >
        <OmniBarProvider>
          {children}
          {modal}
          <GoogleDriveBrowserWrapper />
        </OmniBarProvider>
      </main>
    </div>
  );
}
