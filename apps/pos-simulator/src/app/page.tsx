import React from "react";
import { PosSimulator } from "../components/PosSimulator";

/**
 * PosSimulatorPage mounts the interactive Toast/Square webhook and inventory simulator.
 * This runs isolated in its own dedicated dev environment.
 */
export default function PosSimulatorPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-zinc-950 text-zinc-100">
      <div className="max-w-4xl w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-850 shadow-2xl space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            POS Simulator Dev Utility
          </h1>
          <p className="text-sm text-zinc-400 mt-2">
            This workspace serves as a dedicated portal for local POS simulation. The backend controller handles mock actions and maps POS items to `pos_items`.
          </p>
        </div>

        <PosSimulator />
      </div>
    </main>
  );
}
// Force rebuild 1
