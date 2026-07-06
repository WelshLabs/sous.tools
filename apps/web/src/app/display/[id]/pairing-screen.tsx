"use client";

import React from "react";

interface PairingScreenProps {
  code: string;
}

export function PairingScreen({ code }: PairingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[oklch(0.08_0.01_260)] text-white p-6">
      <div className="glass-panel p-12 rounded-3xl max-w-lg w-full text-center space-y-8 border-black/10 dark:border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[oklch(0.60_0.25_250)] rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[oklch(0.60_0.25_250)] rounded-full blur-3xl opacity-20" />

        <div className="space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[oklch(0.60_0.25_250)]/10 text-[oklch(0.60_0.25_250)]">
            Setup Mode
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white font-brand">
            Pair Your Display
          </h1>
          <p className="text-sm text-zinc-500 dark:text-muted-foreground">
            Enter the code below in your dashboard to connect this screen.
          </p>
        </div>

        <div className="flex justify-center items-center py-4">
          <div className="flex gap-3">
            {code.split("").map((char, index) => (
              <div
                key={index}
                className="w-16 h-20 flex items-center justify-center text-4xl font-black rounded-2xl bg-black/5 bg-card border border-black/10 dark:border-white/10 text-[oklch(0.60_0.25_250)] shadow-lg shadow-black/30 font-brand"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 text-muted-foreground dark:text-zinc-500 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[oklch(0.70_0.25_150)] animate-pulse" />
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
}
