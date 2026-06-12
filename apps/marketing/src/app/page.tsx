"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * HomePage renders the public-facing marketing lander for Sous Tools.
 * It demonstrates custom oklch color configurations and incorporates the shared Button component.
 */
export default function HomePage() {
  const handleGetStarted = (): void => {
    alert("Thank you for your interest! Coming soon.");
  };

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
