"use client";

import React, { useState } from "react";
import { SignageLayoutConfig, ColumnLayoutSlide, MenuItemStyles } from "@soustools/api-types";
import { Code2, Sliders } from "lucide-react";
import { FontPickerPopover } from "./font-picker-popover";
import { CssEditorModal } from "./css-editor-modal";
import { MenuItemStyleModal } from "./menu-item-style-modal";
import { DEFAULT_MENU_ITEM_STYLES } from "./config-migration";
import { DisplayPicker } from "./display-picker";
import { BodyPortal } from "./body-portal";

export interface StylesPanelProps {
  config: SignageLayoutConfig;
  activeSlideIndex: number;
  onUpdateConfig: (updates: Partial<SignageLayoutConfig>) => void;
  onUpdateSlide: (index: number, updates: Partial<ColumnLayoutSlide>) => void;
  menuItemStyles: MenuItemStyles;
  onUpdateMenuItemStyles: (s: MenuItemStyles) => void;
  deckId?: string;
}

const DIVIDER = <div className="border-t border-white/5 my-3" />;

export const StylesPanel: React.FC<StylesPanelProps> = ({
  config, activeSlideIndex, onUpdateConfig, onUpdateSlide,
  menuItemStyles, onUpdateMenuItemStyles, deckId,
}) => {
  const [fontOpen, setFontOpen] = useState(false);
  const [cssModalOpen, setCssModalOpen] = useState(false);
  const [stylesModalOpen, setStylesModalOpen] = useState(false);

  const activeSlide = config.slides[activeSlideIndex] as ColumnLayoutSlide | undefined;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 text-zinc-300">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Slide Settings</p>
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs text-zinc-400">Duration (s)</label>
          <input type="number" min={1} max={600} value={activeSlide?.durationSeconds ?? 10}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { durationSeconds: Number(e.target.value) })}
            className="w-20 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:border-primary/60" />
        </div>
        <div className="flex items-center justify-between gap-3 mt-2">
          <label className="text-xs text-zinc-400">Background Color</label>
          <input type="color" value={activeSlide?.backgroundColor ?? "#000000"}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundColor: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-white/10 bg-zinc-800 p-0.5" />
        </div>
        <div className="mt-2">
          <label className="text-xs text-zinc-400 block mb-1">Background Image URL</label>
          <input type="url" placeholder="https://example.com/image.jpg" value={activeSlide?.backgroundImageUrl ?? ""}
            onChange={(e) => onUpdateSlide(activeSlideIndex, { backgroundImageUrl: e.target.value || undefined })}
            className="w-full bg-zinc-800 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-primary/60" />
        </div>

        {DIVIDER}

        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Base Font</p>
        <div className="relative">
          <button onClick={() => setFontOpen(!fontOpen)}
            className="w-full text-left px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer"
            style={{ fontFamily: config.googleFont ?? "Outfit" }}>
            <span className="text-sm text-zinc-100">The quick brown fox</span>
            <span className="block text-[10px] text-zinc-500 mt-0.5">{config.googleFont ?? "Outfit"}</span>
          </button>
          {fontOpen && (
            <FontPickerPopover label="Base Font" currentFont={config.googleFont}
              onSelect={(f) => { onUpdateConfig({ googleFont: f }); setFontOpen(false); }}
              onClose={() => setFontOpen(false)} />
          )}
        </div>

        {DIVIDER}

        <DisplayPicker deckId={deckId} />

        {DIVIDER}

        <button onClick={() => setStylesModalOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer text-left">
          <Sliders className="w-4 h-4 text-violet-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-zinc-200">Edit Menu Item Styles</div>
            <div className="text-[10px] text-zinc-500">Customize per-state card appearance</div>
          </div>
        </button>

        {DIVIDER}

        <button onClick={() => setCssModalOpen(true)}
          className="flex items-center gap-2 w-full px-3 py-2.5 bg-zinc-800 border border-white/10 rounded-xl hover:border-white/20 transition-all cursor-pointer text-left">
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
        <BodyPortal>
          <CssEditorModal value={config.customCss ?? ""} onChange={(v) => onUpdateConfig({ customCss: v })} onClose={() => setCssModalOpen(false)} />
        </BodyPortal>
      )}
      {stylesModalOpen && (
        <BodyPortal>
          <MenuItemStyleModal open={stylesModalOpen} onClose={() => setStylesModalOpen(false)}
            styles={menuItemStyles ?? DEFAULT_MENU_ITEM_STYLES}
            onChange={onUpdateMenuItemStyles} googleFont={config.googleFont} />
        </BodyPortal>
      )}
    </>
  );
};
