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
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-8 p-8">
      <TwoToneHeader title="Team Management" />

      <div className="bg-card border-border flex w-full max-w-md flex-col gap-6 rounded-2xl border p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Watch className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide text-white">
              Pair Smartwatch
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter the 6-digit code shown on your WearOS device.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="space-y-2">
            <label className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
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
            className="w-full bg-cyan-500 font-bold text-zinc-950 hover:bg-cyan-400"
          >
            {status === "pairing" ? "Pairing..." : "Pair Device"}
          </Button>
        </form>

        {message && status !== "idle" && (
          <div
            className={`rounded-xl border p-4 text-center text-sm ${
              status === "success"
                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                : status === "error"
                  ? "border-red-500/20 bg-red-500/10 text-red-400"
                  : "text-muted-foreground border-zinc-700 bg-zinc-800/50"
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
