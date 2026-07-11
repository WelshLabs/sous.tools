"use client";

import { useEffect } from "react";
import { initializeBrowserLogger } from "@soustools/logger";

export function LoggerInitializer() {
  useEffect(() => {
    initializeBrowserLogger();
  }, []);

  return null;
}
