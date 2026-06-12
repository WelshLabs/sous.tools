"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * HomePage is the landing route for the kitchen application, providing entry points to the login page.
 */
export default function HomePage() {
  const handleEnterKitchen = (): void => {
    window.location.href = "/login";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[oklch(0.12_0.02_180)]">
      <div className="max-w-md p-8 rounded-2xl shadow-xl bg-[oklch(0.18_0.03_180)] border border-[oklch(0.28_0.04_180)]">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[oklch(0.85_0.12_140)]">
          Kitchen Portal
        </h1>
        <p className="text-base mb-6 text-[oklch(0.75_0.05_180)]">
          Access active tickets, cook stations, and back-of-house operations
          dashboard.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleEnterKitchen}>Enter Station Code</Button>
        </div>
      </div>
    </main>
  );
}
