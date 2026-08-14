"use client";

import React from "react";
import { Button } from "@soustools/design-system";

/**
 * HomePage is the landing route for the TV signage player.
 * It provides links to launch specific screens (e.g. dynamic screen IDs).
 */
export default function HomePage() {
  const handleLaunchDisplay = (): void => {
    window.location.href = "/display/default-tv";
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.1_0.02_260)] p-8 text-center">
      <div className="max-w-md rounded-2xl border border-[oklch(0.25_0.04_260)] bg-[oklch(0.15_0.03_260)] p-8 shadow-xl">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-[oklch(0.85_0.12_140)]">
          TV Signage Player
        </h1>
        <p className="mb-6 text-base text-[oklch(0.75_0.05_260)]">
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
