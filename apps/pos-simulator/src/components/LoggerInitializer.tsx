"use client";

import { useEffect } from "react";
import initializeBrowserLogger from "@soustools/logger/browser";

export function LoggerInitializer() {
  useEffect(() => {
    initializeBrowserLogger();
  }, []);

  return null;
}
