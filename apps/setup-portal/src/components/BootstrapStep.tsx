'use client';

import type { RefObject } from 'react';

interface BootstrapStepProps {
  logs: string[];
  logEndRef: RefObject<HTMLDivElement | null>;
}

export function BootstrapStep({ logs, logEndRef }: BootstrapStepProps) {
  return (
    <div className="p-0">
      <div className="bg-zinc-950 p-6 h-[400px] overflow-y-auto font-mono text-sm leading-relaxed text-zinc-400">
        {logs.length === 0 && <div className="animate-pulse">Waiting for bootstrap logs...</div>}
        {logs.map((log, i) => (
          <div key={i} className={`${log.includes('✓') ? 'text-emerald-400' : log.includes('✗') || log.includes('WARN') ? 'text-amber-400' : ''}`}>
            {log}
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
      <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex items-center justify-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-[#00FFFF] border-t-transparent animate-spin" />
        <span className="text-sm text-zinc-300">Provisioning device... do not power off.</span>
      </div>
    </div>
  );
}