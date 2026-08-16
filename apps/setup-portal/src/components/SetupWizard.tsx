"use client";

import { useState, useEffect, useRef } from "react";
import { WifiStep } from "./WifiStep";
import { BootstrapStep } from "./BootstrapStep";
import { PairingStep } from "./PairingStep";

type Phase = "wifi" | "bootstrap" | "pairing" | "done";

export function SetupWizard() {
  const [phase, setPhase] = useState<Phase>("wifi");

  // Bootstrap state
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Pairing state
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // ── Phase 2: Bootstrap SSE stream ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== "bootstrap") return;

    const eventSource = new EventSource("/api/progress");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [...prev, data.line]);

        // If we see the completion message, move to pairing phase
        if (data.line.includes("Bootstrap complete")) {
          setTimeout(() => setPhase("pairing"), 2000);
        }
      } catch (err) {
        console.error("Failed to parse SSE data", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE connection lost, reconnecting...");
    };

    return () => eventSource.close();
  }, [phase]);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // ── Phase 3: Pairing Code Polling ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== "pairing") return;

    const pollPairingCode = async () => {
      try {
        const res = await fetch("/api/pairing");
        const data = await res.json();
        if (data.pairing_code && data.pairing_code !== "UNKNOWN") {
          setPairingCode(data.pairing_code);
        }
      } catch (err) {
        console.error("Failed to fetch pairing code", err);
      }
    };

    pollPairingCode();
    const interval = setInterval(pollPairingCode, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  // ── UI Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-8 font-sans text-zinc-50">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sous Signage
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Hardware Diagnostic & Setup
            </p>
          </div>
          <div className="flex gap-2">
            <div
              className={`h-2 w-12 rounded-full ${phase === "wifi" ? "bg-[#00FFFF]" : "bg-zinc-800"}`}
            />
            <div
              className={`h-2 w-12 rounded-full ${phase === "bootstrap" ? "bg-[#00FFFF]" : "bg-zinc-800"}`}
            />
            <div
              className={`h-2 w-12 rounded-full ${phase === "pairing" || phase === "done" ? "bg-[#00FFFF]" : "bg-zinc-800"}`}
            />
          </div>
        </div>

        {/* Wizard Steps */}
        {phase === "wifi" && (
          <WifiStep onConnected={() => setPhase("bootstrap")} />
        )}
        {phase === "bootstrap" && (
          <BootstrapStep logs={logs} logEndRef={logEndRef} />
        )}
        {phase === "pairing" && <PairingStep pairingCode={pairingCode} />}
      </div>
    </div>
  );
}
