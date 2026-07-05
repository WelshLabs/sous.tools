"use client";

import { useEffect } from "react";
import { patchConsole } from "@soustools/logger/browser";

/**
 * Client-side instrumentation component.
 * Mounts at the root of the app to monkey-patch console methods on the browser.
 */
export function InstrumentationClient() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      patchConsole();
    }
  }, []);

  return null;
}
