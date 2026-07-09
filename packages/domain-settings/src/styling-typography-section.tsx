"use client";

import { type GlobalDesignTokens } from "@soustools/api-types";

/** The 13 Google Fonts supported by the signage typography system. */
const FONT_OPTIONS = [
  "", "Inter", "Roboto", "Plus Jakarta Sans", "Outfit", "Oswald",
  "Playfair Display", "Merriweather", "Montserrat", "Lora", "Lato",
  "Poppins", "Nunito", "Raleway",
] as const;

const WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" },
  { value: "100", label: "100 - Thin" },
  { value: "300", label: "300 - Light" },
  { value: "500", label: "500 - Medium" },
  { value: "700", label: "700 - Bold" },
  { value: "900", label: "900 - Black" },
] as const;

type TokenKey = keyof GlobalDesignTokens;

interface FontGroupProps {
  label: string;
  fontKey: TokenKey;
  colorKey: TokenKey;
  weightKey: TokenKey;
  tokens: GlobalDesignTokens;
  onChange: (key: TokenKey, value: string) => void;
}

/** Atom: Font/Color/Weight controls for a single typography level (Heading, Subtitle, Body). */
function FontGroup({ label, fontKey, colorKey, weightKey, tokens, onChange }: FontGroupProps) {
  const colorValue = String(tokens[colorKey] ?? "");
  const hexColor = /^#[0-9A-Fa-f]{6}$/i.test(colorValue) ? colorValue : "#ffffff";

  return (
    <div className="space-y-2 border border-black/5 dark:border-white/5 rounded-xl p-4 bg-card/30">
      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Font Family</label>
          <select
            value={String(tokens[fontKey] ?? "")}
            onChange={(e) => onChange(fontKey, e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>{f || "Default Font"}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Color</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => onChange(colorKey, e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              placeholder="e.g. #ffffff"
              value={colorValue}
              onChange={(e) => onChange(colorKey, e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Weight</label>
          <select
            value={String(tokens[weightKey] ?? "")}
            onChange={(e) => onChange(weightKey, e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all"
          >
            {WEIGHT_OPTIONS.map(({ value, label: wl }) => (
              <option key={value} value={value}>{wl}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

interface TypographySectionProps {
  tokens: GlobalDesignTokens;
  onChange: (key: TokenKey, value: string) => void;
}

/** Molecule: Typography section with Heading, Subtitle, and Body font controls. */
export function TypographySection({ tokens, onChange }: TypographySectionProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FontGroup label="Heading Typography" fontKey="headingFont" colorKey="headingColor" weightKey="headingWeight" tokens={tokens} onChange={onChange} />
      <FontGroup label="Subtitle Typography" fontKey="subtitleFont" colorKey="subtitleColor" weightKey="subtitleWeight" tokens={tokens} onChange={onChange} />
      <FontGroup label="Body Typography" fontKey="bodyFont" colorKey="bodyColor" weightKey="bodyWeight" tokens={tokens} onChange={onChange} />
    </div>
  );
}
