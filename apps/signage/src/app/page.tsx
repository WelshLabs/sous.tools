"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * HomePage is the landing route for the TV signage player.
 * It provides links to launch specific screens (e.g. dynamic screen IDs).
 */
export default function HomePage() {
  const handleLaunchDisplay = (): void => {
    window.location.href = "/display/default-tv";
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[oklch(0.1_0.02_260)]">
      <div className="max-w-md p-8 rounded-2xl shadow-xl bg-[oklch(0.15_0.03_260)] border border-[oklch(0.25_0.04_260)]">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[oklch(0.85_0.12_140)]">
          TV Signage Player
        </h1>
        <p className="text-base mb-6 text-[oklch(0.75_0.05_260)]">
          Launch digital signage client. Displays active menus, promotional
          content, and kitchen queue notifications.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleLaunchDisplay}>Launch Player</Button>
        </div>
      </div>
    </main>
  );
}
