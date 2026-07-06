"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { FloatingOmniTrigger } from "@soustools/design-system";

interface FullscreenLayoutProps {
  children: React.ReactNode;
}

export default function FullscreenLayout({ children }: FullscreenLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to retrieve authentication session:", error);
        router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (!session) {
          router.push(`/login?returnTo=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        } else if (mounted) {
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-card flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {children}
      <FloatingOmniTrigger />
    </div>
  );
}
