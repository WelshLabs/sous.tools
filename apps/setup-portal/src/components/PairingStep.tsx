"use client";

interface PairingStepProps {
  pairingCode: string | null;
}

export function PairingStep({ pairingCode }: PairingStepProps) {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00FFFF]/10">
        <span className="text-3xl">🔗</span>
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-white">
        Device Ready to Pair
      </h2>
      <p className="mx-auto mb-8 max-w-md text-zinc-400">
        Enter this code in the Sous Dashboard to assign displays to this
        hardware.
      </p>

      {pairingCode ? (
        <div className="mb-8 inline-block rounded-xl border border-zinc-800 bg-zinc-950 p-8">
          <span className="font-mono text-6xl font-bold tracking-[0.2em] text-[#00FFFF]">
            {pairingCode}
          </span>
        </div>
      ) : (
        <div className="flex h-32 items-center justify-center">
          <div className="animate-pulse text-zinc-500">Fetching code...</div>
        </div>
      )}

      <p className="text-sm text-zinc-500">
        This screen is currently mirrored for hardware diagnostics.
        <br />
        It will automatically split once pairing is confirmed.
      </p>
    </div>
  );
}
