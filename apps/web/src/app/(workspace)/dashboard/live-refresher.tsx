"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function LiveRefresher() {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 15000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
