"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Sidebar from "../../components/layout/sidebar";
import AppBar from "../../components/layout/app-bar";

/**
 * Props for the DashboardLayout component.
 */
export interface DashboardLayoutProps {
  /** The child views to render within the layout shell. */
  children: React.ReactNode;
}

/**
 * DashboardLayout wraps all dashboard sub-routes in a responsive shell.
 * It manages sidebar state (drawer vs collapsed) and enforces Supabase authentication gating.
 *
 * @tenant-docs-export
 * Access to the kitchen portal dashboard is restricted to authorized employees.
 * If your session expires, you will automatically be redirected to the passcode login page.
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to retrieve authentication session:", error);
        router.push("/login");
      }
    };

    checkSession();

    // Set up auth state change listener to auto-redirect on logout/expiry
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login");
      } else if (mounted) {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300
          ${isDesktopCollapsed ? "md:pl-16" : "md:pl-16 lg:pl-64"}
        `}
      >
        <AppBar
          isMobileOpen={isMobileOpen}
          isDesktopCollapsed={isDesktopCollapsed}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onToggleDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
