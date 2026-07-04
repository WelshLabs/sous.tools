import React from "react";
import { GlobalAppBar } from "@soustools/design-system";
import { logoutAction } from "../actions/auth";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <GlobalAppBar onLogoutAction={logoutAction} />
      <main className="flex-1 flex flex-col relative">
        {children}
      </main>
    </div>
  );
}
