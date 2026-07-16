"use client";

import React from "react";
import { PinInput, Button, TwoToneHeader } from "@soustools/design-system";
import { Watch } from "lucide-react";

export interface TeamPortalViewProps {
  pairingCode: string;
  setPairingCode: (code: string) => void;
  status: "idle" | "pairing" | "success" | "error";
  message: string;
  onSubmit: (e: React.FormEvent) => void;
}

export function TeamPortalView({
  pairingCode,
  setPairingCode,
  status,
  message,
  onSubmit,
}: TeamPortalViewProps) {
  return (
    <div className="flex flex-col gap-8 p-8 max-w-4xl mx-auto w-full h-full">
      <TwoToneHeader title="Team Management" />

      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6 w-full max-w-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Watch className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Pair Smartwatch
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code shown on your WearOS device.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Pairing Code
            </label>
            <PinInput
              length={6}
              value={pairingCode}
              onChange={setPairingCode}
            />
          </div>

          <Button
            type="submit"
            disabled={status === "pairing" || pairingCode.length !== 6}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold"
          >
            {status === "pairing" ? "Pairing..." : "Pair Device"}
          </Button>
        </form>

        {message && status !== "idle" && (
          <div
            className={`p-4 rounded-xl text-sm text-center border ${
              status === "success"
                ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400"
                : status === "error"
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-zinc-800/50 border-zinc-700 text-muted-foreground"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
TeamPortalView.displayName = "TeamPortalView";
