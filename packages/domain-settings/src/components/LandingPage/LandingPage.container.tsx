"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LandingPageView } from "./LandingPage.view";

export function LandingPageContainer() {
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    setSession(null);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500/20 border-t-sky-500" />
      </div>
    );
  }

  return (
    <LandingPageView
      session={session}
      onNavigate={(path) => router.push(path)}
    />
  );
}

export { LandingPageContainer as LandingPage };
