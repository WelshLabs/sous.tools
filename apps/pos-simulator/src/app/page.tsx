import React from "react";

export default function PosSimulatorPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-[oklch(0.12_0.02_280)] text-slate-100">
      <div className="max-w-4xl w-full p-8 rounded-3xl bg-[oklch(0.16_0.02_280)]/95 border border-slate-800 shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent mb-4">
          POS Simulator Dev Utility
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          Simulate Square / Toast POS catalog synchronizations, inventory stock updates, and webhook events locally.
        </p>
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-850">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Simulation Dashboard</h2>
          <p className="text-sm text-slate-400 mb-4">
            This workspace serves as a dedicated portal for local POS simulation. The backend controller handles mock actions and maps POS items to `pos_items`.
          </p>
          <div className="flex gap-4">
            <span className="px-3 py-1 text-xs rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
              Mock POS: Enabled
            </span>
            <span className="px-3 py-1 text-xs rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              Local Sandbox: Port 5004
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
