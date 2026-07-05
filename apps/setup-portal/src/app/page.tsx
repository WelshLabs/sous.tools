"use client";

import { useState } from "react";
import { PinInput } from "@soustools/design-system";

export default function SetupPortal() {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "pairing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handlePair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ssid || !password || !pairingCode) return;

    setStatus("connecting");
    setMessage("Authenticating pairing code...");

    // Simulate wifi save delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setStatus("pairing");
    setMessage("Connecting to organization...");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/signage/devices/pair`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hardwareMac: "00:11:22:33:44:55",
          tenantAdminToken: pairingCode,
          requestedName: "Kitchen Display 1",
        }),
      });

      if (!response.ok) {
        throw new Error("Pairing failed");
      }

      const data = await response.json();
      
      setStatus("success");
      setMessage("Successfully paired! Rebooting device...");
    } catch (err) {
      setStatus("error");
      setMessage("Failed to pair with organization. Check token.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-400/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <svg className="w-16 h-16 text-cyan-400 mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 mb-2">Device Setup</h1>
          <p className="text-sm text-zinc-400">Connect this display to your network and organization.</p>
        </div>

        <form onSubmit={handlePair} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">WiFi SSID</label>
            <input
              type="text"
              required
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="Guest_Network"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-2xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Pairing Code</label>
            <PinInput
              length={6}
              value={pairingCode}
              onChange={setPairingCode}
            />
          </div>

          <button
            type="submit"
            disabled={status === "connecting" || status === "pairing"}
            className="w-full mt-6 bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-semibold rounded-2xl px-4 py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
          >
            {(status === "connecting" || status === "pairing") ? (
              <>
                <svg className="animate-spin h-5 w-5 text-zinc-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{status === "connecting" ? "Connecting..." : "Pairing..."}</span>
              </>
            ) : (
              <span>Connect & Pair Device</span>
            )}
          </button>
        </form>

        {(message && status !== "idle") && (
          <div className={`mt-6 p-4 rounded-xl text-sm text-center border ${
            status === "success" ? "bg-cyan-400/10 border-cyan-400/20 text-cyan-400" : 
            status === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" : 
            "bg-zinc-800/50 border-zinc-700 text-zinc-400"
          }`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
