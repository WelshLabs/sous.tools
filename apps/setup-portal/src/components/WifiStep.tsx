'use client';

interface Network {
  ssid: string;
  signal: number;
  security: string;
}

interface WifiStepProps {
  networks: Network[];
  selectedSsid: string;
  setSelectedSsid: (ssid: string) => void;
  password: string;
  setPassword: (password: string) => void;
  wifiError: string;
  isScanning: boolean;
  isConnecting: boolean;
  onConnect: (e: React.FormEvent) => void;
}

export function WifiStep({
  networks,
  selectedSsid,
  setSelectedSsid,
  password,
  setPassword,
  wifiError,
  isScanning,
  isConnecting,
  onConnect,
}: WifiStepProps) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold mb-6">Connect to Network</h2>
      <form onSubmit={onConnect} className="space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Network Name (SSID)</label>
          <div className="relative">
            <select 
              value={selectedSsid}
              onChange={(e) => setSelectedSsid(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-white focus:outline-none focus:border-[#00FFFF] focus:ring-1 focus:ring-[#00FFFF] appearance-none"
              required
            >
              <option value="" disabled>Select a network...</option>
              {networks.map(n => (
                <option key={n.ssid} value={n.ssid}>
                  {n.ssid} ({n.signal}%) {n.security.includes('WPA') ? '🔒' : ''}
                </option>
              ))}
            </select>
            {isScanning && (
              <div className="absolute right-3 top-3 text-zinc-500 text-sm animate-pulse">Scanning...</div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-300">Password</label>
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
          {isConnecting ? 'Connecting...' : 'Connect'}
        </button>
      </form>
    </div>
  );
}