import React from "react";
import { PosSimulatorContainer } from "../components/PosSimulator.container";

/**
 * PosSimulatorPage mounts the interactive Toast/Square webhook and inventory simulator.
 * This runs isolated in its own dedicated dev environment.
 */
export default function PosSimulatorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-8 text-zinc-100">
      <div className="border-zinc-850 w-full max-w-4xl space-y-8 rounded-3xl border bg-zinc-900 p-8 shadow-2xl">
        <div>
          <h1 className="bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
            POS Simulator Dev Utility
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            This workspace serves as a dedicated portal for local POS
            simulation. The backend controller handles mock actions and maps POS
            items to `pos_items`.
          </p>
        </div>

        <PosSimulatorContainer />
      </div>
    </main>
  );
}
// Force rebuild 1
