"use client";

import React, { useState } from "react";
import {
  SignageLayoutConfig,
  ColumnLayoutSlide,
} from "@soustools/api-types";
import { Code2 } from "lucide-react";
import { FontPickerPopover } from "./font-picker-popover";
import { CssEditorModal } from "./css-editor-modal";
import { TypographySample, TYPOGRAPHY_SAMPLES, TypographyKey } from "./typography-sample";

export interface StylesPanelProps {
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
}

const SOLD_OUT_DESCRIPTIONS: Record<string, string> = {
  HIDE: "Remove item from display",
  LABEL: "Show a 'SOLD OUT' badge",
  STRIKE: "Strikethrough + dim opacity",
  GRAY_OUT: "Reduce opacity only",
};

const DIVIDER = <div className="border-t border-white/5 my-3" />;

export const StylesPanel: React.FC<StylesPanelProps> = ({
  config, activeSlideIndex, onUpdateConfig, onUpdateSlide,
}) => {
  const [openKey, setOpenKey] = useState<TypographyKey | "base" | null>(null);
  const [cssModalOpen, setCssModalOpen] = useState(false);

  const activeSlide = config.slides[activeSlideIndex] as ColumnLayoutSlide | undefined;
  const typography = config.typography ?? {};

  const updateTypo = (key: TypographyKey, font: string): void => {
    onUpdateConfig({ typography: { ...typography, [key]: font } });
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 text-zinc-300">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Slide Settings</p>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-zinc-400">Duration (s)</label>
          <input type="number" min={1} max={600} value={activeSlide?.durationSeconds ?? 10}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { durationSeconds: Number(e.target.value) })}
            className="w-20 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-primary/60"
          />
        </div>

        {/* Background color */}
        <div className="flex items-center justify-between gap-3 mt-2">
          <label className="text-xs text-zinc-400">Background Color</label>
          <input
            type="color"
            value={activeSlide?.backgroundColor ?? "#000000"}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundColor: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-zinc-800 p-0.5"
          />
        </div>

        {/* Background image URL */}
        <div className="mt-2">
          <label className="text-xs text-zinc-400 block mb-1">Background Image URL</label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={activeSlide?.backgroundImageUrl ?? ""}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundImageUrl: e.target.value || undefined })}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-primary/60"
          />
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
            <TypographySample
              key={s.key}
              sample={s}
              font={typography[s.key]}
              color={typography[s.colorKey]}
              isOpen={openKey === s.key}
              onToggle={() => setOpenKey(openKey === s.key ? null : s.key)}
              onSelect={(f) => { updateTypo(s.key, f); setOpenKey(null); }}
              onColorChange={(color) => {
                onUpdateConfig({ typography: { ...typography, [s.colorKey]: color } });
              }}
              onClose={() => setOpenKey(null)}
            />
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

        <button
          onClick={() => setCssModalOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer text-left"
        >
          <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-zinc-200">Custom CSS</div>
            <div className="text-[10px] text-zinc-500">
              {config.customCss?.trim() ? "CSS applied — click to edit" : "Click to open CSS editor"}
            </div>
          </div>
        </button>
      </div>

      {cssModalOpen && (
        <CssEditorModal
          value={config.customCss ?? ""}
          onChange={(v) => onUpdateConfig({ customCss: v })}
          onClose={() => setCssModalOpen(false)}
        />
      )}
    </>
  );
};
