"use client";

import { useState, useEffect, useRef } from "react";
import { BootstrapStep } from "./BootstrapStep";

type Phase = "wifi" | "bootstrap" | "pairing" | "done";

interface Network {
  ssid: string;
  signal: number;
  security: string;
}

export function SetupWizard() {
  const [phase, setPhase] = useState<Phase>("wifi");

  // WiFi state
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedSsid, setSelectedSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiError, setWifiError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Bootstrap state
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Pairing state
  const [pairingCode, setPairingCode] = useState<string | null>(null);

  // ── Phase 1: WiFi Scan ──────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "wifi") return;

    const scan = async () => {
      try {
        setIsScanning(true);
        const res = await fetch("/api/wifi/scan");
        const data = await res.json();
        setNetworks(data.networks || []);
      } catch (err) {
        console.error("Scan failed", err);
      } finally {
        setIsScanning(false);
      }
    };

    scan();
    const interval = setInterval(scan, 10000);
    return () => clearInterval(interval);
  }, [phase]);

  // ── Handle WiFi Connect ─────────────────────────────────────────────────────
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setWifiError("");
    setIsConnecting(true);

    try {
      const res = await fetch("/api/wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ssid: selectedSsid, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to connect");

      // Connected! Transition to bootstrap phase
      setPhase("bootstrap");
    } catch (err) {
      setWifiError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConnecting(false);
    }
  };

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
      // Stream might drop momentarily if the server restarts during bootstrap
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center p-8 font-sans">
      <div className="max-w-2xl w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sous Signage
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
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

        {/* Phase: WiFi */}
        {phase === "wifi" && (
          <div className="p-8">
            <h2 className="text-xl font-semibold mb-6">Connect to Network</h2>
            <form onSubmit={handleConnect} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Network Name (SSID)
                </label>
                <div className="relative">
                  <select
                    value={selectedSsid}
                    onChange={(e) => setSelectedSsid(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] appearance-none"
                    required
                  >
                    <option value="" disabled>
                      Select a network...
                    </option>
                    {networks.map((n) => (
                      <option key={n.ssid} value={n.ssid}>
                        {n.ssid} ({n.signal}%){" "}
                        {n.security.includes("WPA") ? "🔒" : ""}
                      </option>
                    ))}
                  </select>
                  {isScanning && (
                    <div className="absolute right-3 top-3 text-zinc-500 text-sm animate-pulse">
                      Scanning...
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF]"
                  placeholder="Enter WiFi password"
                  required
                />
              </div>

              {wifiError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {wifiError}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedSsid || !password || isConnecting}
                className="w-full bg-[#00FFFF] text-zinc-950 font-semibold rounded-lg p-3 hover:bg-[#00cccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </button>
            </form>
          </div>
        )}

        {/* Phase: Bootstrap Terminal */}
        {phase === "bootstrap" && (
          <BootstrapStep logs={logs} logEndRef={logEndRef} />
        )}

        {/* Phase: Pairing Code */}
        {phase === "pairing" && (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto bg-[#00FFFF]/10 rounded-full flex items-center justify-center mb-6">
              <span className="text-3xl">🔗</span>
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">
              Device Ready to Pair
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Enter this code in the Sous Dashboard to assign displays to this
              hardware.
            </p>

            {pairingCode ? (
              <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 mb-8 inline-block">
                <span className="text-6xl font-mono font-bold tracking-[0.2em] text-[#00FFFF]">
                  {pairingCode}
                </span>
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">
                  Fetching code...
                </div>
              </div>
            )}

            <p className="text-sm text-zinc-500">
              This screen is currently mirrored for hardware diagnostics.
              <br />
              It will automatically split once pairing is confirmed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
