"use client";

import React, { useState } from "react";
import {
  SignageLayoutConfig,
  ColumnLayoutSlide,
  TypographyConfig,
} from "@soustools/api-types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { FontPickerPopover } from "./font-picker-popover";
import { CssHelper } from "./css-helper";

export interface StylesPanelProps {
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
}

type TypographyKey = keyof TypographyConfig;

const SOLD_OUT_DESCRIPTIONS: Record<string, string> = {
  HIDE: "Remove item from display",
  LABEL: "Show a 'SOLD OUT' badge",
  STRIKE: "Strikethrough + dim opacity",
  GRAY_OUT: "Reduce opacity only",
};

const TYPOGRAPHY_SAMPLES: { key: TypographyKey; label: string; sample: string }[] = [
  { key: "menuItemTitle", label: "Title", sample: "Burger & Fries" },
  { key: "menuItemPrice", label: "Price", sample: "$12.99" },
  { key: "menuItemDescription", label: "Description", sample: "Hand-crafted with care" },
  { key: "marketingText", label: "Promo", sample: "Chef's Special" },
];

const DIVIDER = <div className="border-t border-white/5 my-3" />;

const TypographySample: React.FC<{
  sample: { key: TypographyKey; label: string; sample: string };
  font: string | undefined; isOpen: boolean;
  onToggle: () => void; onSelect: (font: string) => void; onClose: () => void;
}> = ({ sample, font, isOpen, onToggle, onSelect, onClose }) => (
  <div className="relative">
    <p className="text-[10px] text-zinc-500 mb-0.5">{sample.label}</p>
    <button
      onClick={onToggle}
      className="w-full text-left px-2.5 py-2 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer"
      style={{ fontFamily: font ?? "inherit" }}
    >
      <span className="text-xs text-zinc-100 truncate block">{sample.sample}</span>
      <span className="text-[9px] text-zinc-500">{font ?? "inherit"}</span>
    </button>
    {isOpen && (
      <FontPickerPopover label={sample.label} currentFont={font} onSelect={onSelect} onClose={onClose} />
    )}
  </div>
);

/**
 * StylesPanel renders slide-specific and global style controls
 * inside the right-side panel when in 'styles' mode.
 */
export const StylesPanel: React.FC<StylesPanelProps> = ({
  config, activeSlideIndex, onUpdateConfig, onUpdateSlide,
}) => {
  const [openKey, setOpenKey] = useState<TypographyKey | "base" | null>(null);
  const [cssOpen, setCssOpen] = useState(false);

  const activeSlide = config.slides[activeSlideIndex] as ColumnLayoutSlide | undefined;
  const typography = config.typography ?? {};

  const updateTypo = (key: TypographyKey, font: string): void => {
    onUpdateConfig({ typography: { ...typography, [key]: font } });
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 text-zinc-300">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Slide Settings</p>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs text-zinc-400">Duration (s)</label>
        <input type="number" min={1} max={600} value={activeSlide?.durationSeconds ?? 10}
          onChange={(e) => onUpdateSlide(activeSlideIndex, { durationSeconds: Number(e.target.value) })}
          className="w-20 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-primary/60"
        />
      </div>
      <div className="flex items-center justify-between gap-3 mt-2">
        <label className="text-xs text-zinc-400">Background</label>
        <input type="color" className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-zinc-800 p-0.5" />
      </div>

      {DIVIDER}

      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Base Font</p>
      <div className="relative">
        <button onClick={() => setOpenKey(openKey === "base" ? null : "base")}
          className="w-full text-left px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer"
          style={{ fontFamily: config.googleFont ?? "Outfit" }}>
          <span className="text-sm text-zinc-100">The quick brown fox</span>
          <span className="block text-[10px] text-zinc-500 mt-0.5">{config.googleFont ?? "Outfit"}</span>
        </button>
        {openKey === "base" && (
          <FontPickerPopover label="Base Font" currentFont={config.googleFont}
            onSelect={(f) => onUpdateConfig({ googleFont: f })} onClose={() => setOpenKey(null)} />
        )}
      </div>

      {DIVIDER}

      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Typography</p>
      <div className="grid grid-cols-2 gap-2">
        {TYPOGRAPHY_SAMPLES.map((s) => (
          <TypographySample key={s.key} sample={s} font={typography[s.key]}
            isOpen={openKey === s.key} onToggle={() => setOpenKey(openKey === s.key ? null : s.key)}
            onSelect={(f) => { updateTypo(s.key, f); setOpenKey(null); }} onClose={() => setOpenKey(null)} />
        ))}
      </div>

      {DIVIDER}

      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Sold Out Behavior</p>
      <div className="grid grid-cols-2 gap-2">
        {(["HIDE", "LABEL", "STRIKE", "GRAY_OUT"] as const).map((b) => (
          <button key={b} onClick={() => onUpdateConfig({ soldOutBehavior: b })}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              config.soldOutBehavior === b
                ? "bg-primary/15 border-primary text-zinc-100"
                : "bg-zinc-800 border-white/10 text-zinc-400 hover:border-white/20"
            }`}>
            <div className="text-[11px] font-bold">{b}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{SOLD_OUT_DESCRIPTIONS[b]}</div>
          </button>
        ))}
      </div>

      {DIVIDER}

      <button onClick={() => setCssOpen((o) => !o)}
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer w-full">
        {cssOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        Custom CSS
      </button>
      {cssOpen && (
        <div className="mt-2">
          <CssHelper value={config.customCss ?? ""} onChange={(v) => onUpdateConfig({ customCss: v })} />
        </div>
      )}
    </div>
  );
};
