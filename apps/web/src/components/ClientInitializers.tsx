"use client";

import React, { useEffect } from "react";
import { LoggerInitializer } from "./LoggerInitializer";

export function ClientInitializers() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }
    if ("caches" in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
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
