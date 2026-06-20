import React from "react";

export default function DocsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-[oklch(0.12_0.02_240)] text-slate-100">
      <div className="max-w-3xl w-full p-8 rounded-3xl bg-[oklch(0.16_0.02_240)]/80 backdrop-blur-md border border-slate-800 shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent mb-4">
          Sous Tools Platform Docs
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          The developer and operator manual for the abstract multi-tenant SaaS Restaurant Operating System.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-850 hover:border-teal-500 transition-colors">
            <h2 className="text-xl font-bold text-slate-200 mb-2">POS Integrations</h2>
            <p className="text-sm text-slate-400">
              Configure Square & Toast 2-Way Shadow Sync webhook endpoints.
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-850 hover:border-teal-500 transition-colors">
            <h2 className="text-xl font-bold text-slate-200 mb-2">Digital Signage</h2>
            <p className="text-sm text-slate-400">
              Deploy Edge nodes (Raspberry Pi 5) with custom Monaco CSS injectors.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
