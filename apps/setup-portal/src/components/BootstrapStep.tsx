"use client";

import type { RefObject } from "react";

interface BootstrapStepProps {
  logs: string[];
  logEndRef: RefObject<HTMLDivElement | null>;
}

export function BootstrapStep({ logs, logEndRef }: BootstrapStepProps) {
  return (
    <div className="p-0">
      <div className="h-[400px] overflow-y-auto bg-zinc-950 p-6 font-mono text-sm leading-relaxed text-zinc-400">
        {logs.length === 0 && (
          <div className="animate-pulse">Waiting for bootstrap logs...</div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className={`${log.includes("✓") ? "text-emerald-400" : log.includes("✗") || log.includes("WARN") ? "text-amber-400" : ""}`}
          >
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
      <div className="flex items-center justify-center gap-3 border-t border-zinc-800 bg-zinc-900 p-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00FFFF] border-t-transparent" />
        <span className="text-sm text-zinc-300">
          Provisioning device... do not power off.
        </span>
      </div>
    </div>
  );
}
