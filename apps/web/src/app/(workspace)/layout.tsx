import React from "react";
import { cookies } from "next/headers";
import { GlobalAppBar } from "@soustools/design-system";
import { logoutAction } from "../actions/auth";
import { createServerClient } from "@soustools/supabase";

export default async function WorkspaceLayout({ 
  children,
  modal
}: { 
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore as any);

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("is_read", false)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col min-h-screen">
      <GlobalAppBar 
        notifications={notifications || []} 
        onLogoutAction={logoutAction} 
        isAdmin={true}
      />
      <main className="flex-1 flex flex-col relative">
        {children}
        {modal}
      </main>
    </div>
  );
}
