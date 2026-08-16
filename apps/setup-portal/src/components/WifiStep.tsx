"use client";

import { useState, useEffect } from "react";
import { QRCodeDisplay } from "./QRCodeDisplay";

interface Network {
  ssid: string;
  signal: number;
  security: string;
}

interface WifiStepProps {
  onConnected: () => void;
}

export function WifiStep({ onConnected }: WifiStepProps) {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [selectedSsid, setSelectedSsid] = useState("");
  const [password, setPassword] = useState("");
  const [wifiError, setWifiError] = useState("");
  const [isScanning, setIsScanning] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
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
  }, []);

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

      onConnected();
    } catch (err) {
      setWifiError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Connect to Network
          </h2>
          <p className="text-xs text-zinc-400">
            Select Wi-Fi on screen or scan the QR code to setup from your phone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <form onSubmit={handleConnect} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Network Name (SSID)
            </label>
            <div className="relative">
              <select
                value={selectedSsid}
                onChange={(e) => setSelectedSsid(e.target.value)}
                className="w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
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
                <div className="absolute right-3 top-3 animate-pulse text-sm text-zinc-500">
                  Scanning...
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-white focus:border-[#00FFFF] focus:outline-none focus:ring-1 focus:ring-[#00FFFF]"
              placeholder="Enter WiFi password"
              required
            />
          </div>

          {wifiError && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
              {wifiError}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedSsid || !password || isConnecting}
            className="w-full rounded-lg bg-[#00FFFF] p-3 font-semibold text-zinc-950 transition-colors hover:bg-[#00cccc] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Connect"}
          </button>
        </form>

        <div className="flex flex-col items-center justify-center rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-5 text-center">
          <QRCodeDisplay
            text="WIFI:T:WPA;S:Sous-Signage-Setup;P:SousSetup2025!;;;http://192.168.4.1:3000"
            size={140}
            label="Scan to connect to 'Sous-Signage-Setup'"
          />
          <p className="mt-3 text-[11px] text-zinc-400">
            Connect phone to hotspot, then open{" "}
            <span className="font-mono text-[#00FFFF]">192.168.4.1:3000</span>
          </p>
        </div>
      </div>
    </div>
  );
}
