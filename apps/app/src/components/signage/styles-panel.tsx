"use client";

import React, { useState } from "react";
import { SignageLayoutConfig, ColumnLayoutSlide } from "@soustools/api-types";
import { Code2 } from "lucide-react";
import { CssEditorModal } from "./css-editor-modal";
import { DisplayPicker } from "./display-picker";
import { BodyPortal } from "./body-portal";

export interface StylesPanelProps {
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  deckId?: string;
}

const DIVIDER = <div className="border-t border-black/5 dark:border-white/5 my-3" />;

export const StylesPanel: React.FC<StylesPanelProps> = ({
  config, activeSlideIndex, onUpdateConfig, onUpdateSlide, deckId,
}) => {
  const [cssModalOpen, setCssModalOpen] = useState(false);

  const activeSlide = config.slides[activeSlideIndex] as ColumnLayoutSlide | undefined;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 text-zinc-700 dark:text-zinc-300">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Slide Settings</p>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Duration (s)</label>
          <input type="number" min={1} max={600} value={activeSlide?.durationSeconds ?? 10}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { durationSeconds: Number(e.target.value) })}
            className="w-20 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary/60" />
        </div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <label className="text-xs text-zinc-500 dark:text-zinc-400">Background Color</label>
          <input type="color" value={activeSlide?.backgroundColor ?? "#000000"}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundColor: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-black/10 dark:border-white/10 bg-zinc-800 p-0.5" />
        </div>
        <div className="mt-2">
          <label className="text-xs text-zinc-500 dark:text-zinc-400 block mb-1">Background Image URL</label>
          <input type="url" placeholder="https://example.com/image.jpg" value={activeSlide?.backgroundImageUrl ?? ""}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundImageUrl: e.target.value || undefined })}
            className="w-full bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-primary/60" />
        </div>

        {DIVIDER}

        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-1">Layout Sizing</p>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-tight mb-2">This dictates the targeted display output for hardware players. The editor canvas remains responsive for ease of use.</p>
        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between gap-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400">Aspect Ratio</label>
            <select
              value={config.aspectRatio ?? "16:9"}
              onChange={(e) => onUpdateConfig({ aspectRatio: e.target.value as "16:9" | "responsive" })}
              className="bg-zinc-800 border border-black/10 dark:border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-primary/60"
            >
              <option value="16:9">Fixed 16:9 (1920x1080)</option>
              <option value="responsive">Responsive</option>
            </select>
          </div>
          {config.aspectRatio !== "responsive" && (
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs text-zinc-500 dark:text-zinc-400">Scale to Fit</label>
              <input
                type="checkbox"
                checked={config.scaleToFit !== false}
                onChange={(e) => onUpdateConfig({ scaleToFit: e.target.checked })}
                className="w-4 h-4 rounded border-black/10 dark:border-white/10 bg-zinc-800 focus:ring-0 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Base Font section removed - now handled by Global Design Tokens */}

        {DIVIDER}

        <DisplayPicker deckId={deckId} />

        {DIVIDER}



        <button onClick={() => setCssModalOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer text-left">
          <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Custom CSS</div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500">
              {config.customCss?.trim() ? "CSS applied — click to edit" : "Click to open CSS editor"}
            </div>
          </div>
        </button>
      </div>

      {cssModalOpen && (
        <BodyPortal>
          <CssEditorModal value={config.customCss ?? ""} onChange={(v) => onUpdateConfig({ customCss: v })} onClose={() => setCssModalOpen(false)} />
        </BodyPortal>
      )}

    </>
  );
};
