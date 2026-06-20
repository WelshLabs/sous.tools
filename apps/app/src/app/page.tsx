"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/dashboard-content";
import { Button } from "@soustools/ui";
import { useRouter } from "next/navigation";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

/**
 * HomePage conditionally renders either the public-facing marketing lander
 * (if the user is not authenticated) or the kitchen dashboard layout/page
 * (if the user is authenticated). This avoids Next.js route conflicts.
 */
export default function HomePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    /**
     * Checks the current session status and updates local state.
     */
    const fetchSession = async (): Promise<void> => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(currentSession);
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    // Listen for auth state updates (e.g. login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, currentSession: Session | null) => {
        if (mounted) {
          setSession(currentSession);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Render the authenticated kitchen dashboard
  if (session) {
    return (
      <DashboardLayout modal={null}>
        <DashboardPage />
      </DashboardLayout>
    );
  }

  /**
   * Directs the user to the login flow.
   */
  const handleGetStarted = (): void => {
    router.push("/login");
  };

  // Render the unauthenticated marketing landing page
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[oklch(0.15_0.02_240)]">
      <div className="max-w-md p-8 rounded-2xl shadow-xl bg-[oklch(0.2_0.03_240)] border border-[oklch(0.3_0.05_240)]">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[oklch(0.85_0.12_140)]">
          Welcome to Sous Tools
        </h1>
        <p className="text-base mb-6 text-[oklch(0.75_0.05_240)]">
          The ultimate control panel for professional kitchens. Standardize
          menus, manage inventory, and display live signage.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleGetStarted}>Explore Platform</Button>
        </div>
      </div>
    </main>
  );
}
