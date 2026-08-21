"use client";

interface PairingScreenProps {
  code: string;
}

export function PairingScreen({ code }: PairingScreenProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[oklch(0.08_0.01_260)] p-6 text-white">
      <div className="glass-panel relative w-full max-w-lg space-y-8 overflow-hidden rounded-3xl border-black/10 p-12 text-center shadow-2xl dark:border-white/10">
        <div className="absolute -top-12 -left-12 h-24 w-24 rounded-full bg-[oklch(0.60_0.25_250)] opacity-20 blur-3xl" />
        <div className="absolute -right-12 -bottom-12 h-24 w-24 rounded-full bg-[oklch(0.60_0.25_250)] opacity-20 blur-3xl" />

        <div className="space-y-3">
          <div className="inline-block rounded-full bg-[oklch(0.60_0.25_250)]/10 px-4 py-1.5 text-xs font-bold tracking-wider text-[oklch(0.60_0.25_250)] uppercase">
            Setup Mode
          </div>
          <h1 className="font-brand text-4xl font-extrabold tracking-tight text-white">
            Pair Your Display
          </h1>
          <p className="dark:text-muted-foreground text-sm text-zinc-500">
            Enter the code below in your dashboard to connect this screen.
          </p>
        </div>

        <div className="flex items-center justify-center py-4">
          <div className="flex gap-3">
            {code.split("").map((char, index) => (
              <div
                key={index}
                className="bg-card font-brand flex h-20 w-16 items-center justify-center rounded-2xl border border-black/10 bg-black/5 text-4xl font-black text-[oklch(0.60_0.25_250)] shadow-lg shadow-black/30 dark:border-white/10"
              >
                {char}
              </div>
            ))}
          </div>
        </div>

        <div className="text-muted-foreground flex items-center justify-center gap-3 text-xs dark:text-zinc-500">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[oklch(0.70_0.25_150)]" />
          <span>Waiting for connection...</span>
        </div>
      </div>
    </div>
  );
}
