"use client";

import React from "react";
import { Button } from "@soustools/ui";

/**
 * HomePage renders the customer ordering menu index.
 * It leverages oklch color attributes and features the shared Button component.
 */
export default function HomePage() {
  const handleViewMenu = (): void => {
    alert("Loading food menu...");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-[oklch(0.14_0.02_300)]">
      <div className="max-w-md p-8 rounded-2xl shadow-xl bg-[oklch(0.2_0.03_300)] border border-[oklch(0.3_0.04_300)]">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 text-[oklch(0.85_0.12_140)]">
          Table Ordering
        </h1>
        <p className="text-base mb-6 text-[oklch(0.75_0.05_300)]">
          Scan your table QR code to order fresh meals, customize drinks, and
          pay directly.
        </p>
        <div className="flex justify-center">
          <Button onClick={handleViewMenu}>Browse Menu</Button>
        </div>
      </div>
    </main>
  );
}
