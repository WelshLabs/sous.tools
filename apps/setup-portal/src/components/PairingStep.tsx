'use client';

interface PairingStepProps {
  pairingCode: string | null;
}

export function PairingStep({ pairingCode }: PairingStepProps) {
  return (
    <div className="p-12 text-center">
      <div className="w-20 h-20 mx-auto bg-[#00FFFF]/10 rounded-full flex items-center justify-center mb-6">
        <span className="text-3xl">🔗</span>
      </div>
      <h2 className="text-2xl font-semibold mb-2 text-white">Device Ready to Pair</h2>
      <p className="text-zinc-400 mb-8 max-w-md mx-auto">
        Enter this code in the Sous Dashboard to assign displays to this hardware.
      </p>
      
      {pairingCode ? (
        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-8 mb-8 inline-block">
          <span className="text-6xl font-mono font-bold tracking-[0.2em] text-[#00FFFF]">
            {pairingCode}
          </span>
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center">
          <div className="animate-pulse text-zinc-500">Fetching code...</div>
        </div>
      )}
      
      <p className="text-sm text-zinc-500">
        This screen is currently mirrored for hardware diagnostics.<br/>
        It will automatically split once pairing is confirmed.
      </p>
    </div>
  );
}