"use client";

import { Palette } from "lucide-react";
import { type GlobalDesignTokens } from "@soustools/api-types";

type OnChange = (key: keyof GlobalDesignTokens, value: string) => void;

/** Molecule: Brand Colors section with Primary and Accent color pickers. */
export function StyleColorsSection({
  tokens,
  onChange,
}: {
  tokens: GlobalDesignTokens;
  onChange: OnChange;
}) {
  const primaryHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.primaryColor ?? "")
    ? tokens.primaryColor!
    : "#00f0ff";
  const accentHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.accentColor ?? "")
    ? tokens.accentColor!
    : "#00f0ff";

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2">
        <Palette className="w-4 h-4 text-cyan-400" />
        Brand Colors
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Primary Color (OKLCH, HEX, RGB)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryHex}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              onClick={() => { if (!tokens.primaryColor) onChange("primaryColor", "#00f0ff"); }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              placeholder="e.g. oklch(0.7 0.15 200) or #00f0ff"
              value={tokens.primaryColor ?? ""}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentHex}
              onChange={(e) => onChange("accentColor", e.target.value)}
              onClick={() => { if (!tokens.accentColor) onChange("accentColor", "#00f0ff"); }}
              className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              placeholder="e.g. oklch(0.8 0.1 250)"
              value={tokens.accentColor ?? ""}
              onChange={(e) => onChange("accentColor", e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
