"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import Sidebar from "../../components/layout/sidebar";
import AppBar from "../../components/layout/app-bar";
import { BottomNav } from "../../components/layout/bottom-nav";

import { config } from "@soustools/config";
import {
  LayoutDashboard,
  Tv,
  Smartphone,
  Calculator,
  ChefHat,
  ShoppingBag,
  BrainCircuit,
  Building2,
  Receipt,
  Database
} from "lucide-react";
import { PrimaryLogo, MicroIcon } from "@soustools/ui";

const BASE_NAV_ITEMS = [
  { label: "Kitchen Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "KDS Screen", href: "/kds", icon: Tv },
  { label: "POS Register", href: "/pos", icon: Calculator },
  { label: "Recipes", href: "/recipes", icon: ChefHat },
  { label: "Signage", href: "/signage", icon: Tv },
  { label: "Transactions", href: "/transactions", icon: Receipt },
  { label: "Catalog Editor", href: "/catalog", icon: Database },
  { label: "Orders", href: "/inventory/orders", icon: ShoppingBag },
  { label: "Vendors", href: "/inventory/vendors", icon: Building2 },
  { label: "Processing Hub", href: "/ingestion", icon: BrainCircuit },
  { label: "Devices", href: "/devices", icon: Smartphone },
];

/**
 * Props for the DashboardLayout component.
 */
export interface DashboardLayoutProps {
  /** The child views to render within the layout shell. */
  children: React.ReactNode;
  /** Parallel route slot — populated by @modal routes, null otherwise. */
  modal: React.ReactNode;
}

/**
 * DashboardLayout wraps all dashboard sub-routes in a responsive shell.
 * It manages sidebar state (drawer vs collapsed) and enforces Supabase authentication gating.
 *
 * @tenant-docs-export
 * Access to the kitchen portal dashboard is restricted to authorized employees.
 * If your session expires, you will automatically be redirected to the passcode login page.
 */
export default function DashboardLayout({
  children,
  modal,
}: DashboardLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSessionAndRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push(
            `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
          return;
        }

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: orgData } = await supabase.from("organizations").select("id").limit(1).single();
          if (orgData?.id) {
            const { data: membership } = await supabase
              .from("org_members")
              .select("role")
              .eq("organization_id", orgData.id)
              .eq("user_id", user.id)
              .limit(1)
              .single();
            if (membership?.role === "admin" && mounted) {
              setIsAdmin(true);
            }
          }
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to retrieve authentication session:", error);
        router.push(
          `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
        );
      }
    };

    checkSessionAndRole();

    // Set up auth state change listener to auto-redirect on logout/expiry
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.push(
            `/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`,
          );
        } else if (mounted) {
          setIsLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [...BASE_NAV_ITEMS];
  if (config.IS_DEVELOPMENT) {
    navItems.push({ label: "POS Simulator", href: "http://localhost:5009", icon: Calculator });
  }

  return (
    <div className="min-h-screen w-full bg-white text-zinc-900 dark:bg-card dark:text-zinc-100 flex overflow-x-hidden transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        onCloseMobile={() => setIsMobileOpen(false)}
        onToggleDesktop={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        navItems={navItems}
        isAdmin={isAdmin}
        expandedLogo={<PrimaryLogo className="h-10 w-auto text-sky-500" />}
        collapsedIcon={<MicroIcon className="w-8 h-8 text-sky-500" />}
      />

      {/* Main Content Pane */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full max-w-full
          ${isDesktopCollapsed ? "md:pl-16" : "md:pl-16 lg:pl-16 xl:pl-64"}
        `}
      >
        <div className="hidden md:block">
          <AppBar
            isMobileOpen={isMobileOpen}
            onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          />
        </div>
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav 
        onToggleMobile={() => setIsMobileOpen(true)} 
        centerIcon={<MicroIcon className="w-8 h-8 text-sky-500" />}
      />

      {/* @modal parallel route slot — renders URL-addressed modals (deck preview, device detail, etc.) */}
      {modal}
    </div>
  );
}
