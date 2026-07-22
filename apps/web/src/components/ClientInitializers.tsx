"use client";

import React, { useEffect } from "react";
import { LoggerInitializer } from "./LoggerInitializer";

export function ClientInitializers() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return (
    <>
      <LoggerInitializer />
    </>
  );
}
