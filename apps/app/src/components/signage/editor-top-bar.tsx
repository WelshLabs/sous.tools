"use client";

import React from "react";
import { Button } from "@soustools/ui";
import { Play, Pause, ChevronLeft, ChevronRight, Plus, Palette, Eye, Save, RefreshCw, Check } from "lucide-react";
import { useSaveState } from "./use-save-state";

export interface EditorTopBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  activeSlideIndex: number;
  totalSlides: number;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  isStylesOpen: boolean;
  onToggleStyles: () => void;
  onAddSlide: () => void;
  saving: boolean;
  onSave: () => void;
  layoutName: string;
}

const activeCls = "bg-white/10 border border-white/20 text-white";
const inactiveCls = "bg-transparent border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-colors";
const iconBtnCls = "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer";

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  isPlaying, onTogglePlay, activeSlideIndex, totalSlides,
  onNextSlide, onPrevSlide, isPreviewing, onTogglePreview,
  isStylesOpen, onToggleStyles, onAddSlide, saving, onSave, layoutName,
}) => {
  const saveState = useSaveState(saving);
  const noSlides = totalSlides === 0;

  const SaveIcon = saveState === "saving"
    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    : saveState === "saved"
    ? <Check className="w-3.5 h-3.5 text-green-400" />
    : <Save className="w-3.5 h-3.5" />;

  const saveLabel = saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save";

  return (
    <div className="flex items-center justify-between gap-2 h-12 px-3 bg-zinc-950/80 backdrop-blur border-b border-white/5 shrink-0 relative">
      {/* Left — name · play · nav */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs text-slate-500 font-medium truncate max-w-[120px]" title={layoutName}>
          {layoutName}
        </span>
        <div className="w-px h-4 bg-white/10 mx-1" />

        <button
          id="editor-top-bar-play"
          onClick={onTogglePlay}
          disabled={noSlides}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-white/10 hover:border-white/25 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          {isPlaying
            ? <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            : <Play className="w-3.5 h-3.5 text-green-400 fill-green-400" />}
          <span className="text-slate-300 font-mono tracking-tight">
            {totalSlides > 0 ? `${activeSlideIndex + 1} / ${totalSlides}` : "0 / 0"}
          </span>
        </button>

        <div className="flex items-center rounded-md overflow-hidden border border-white/10">
          <button id="editor-top-bar-prev" onClick={onPrevSlide} disabled={noSlides}
            className="p-1 hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button id="editor-top-bar-next" onClick={onNextSlide} disabled={noSlides}
            className="p-1 hover:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Center — Add Slide */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <Button id="editor-top-bar-add-slide" variant="outline" size="sm" onClick={onAddSlide}
          className="flex items-center gap-1.5 text-xs font-semibold text-white border-white/20 hover:bg-white/10">
          <Plus className="w-3.5 h-3.5" /> Add Slide
        </Button>
      </div>

      {/* Right — Styles · Preview · Save */}
      <div className="flex items-center gap-1.5">
        <button id="editor-top-bar-styles" onClick={onToggleStyles}
          className={`${iconBtnCls} ${isStylesOpen ? activeCls : inactiveCls}`}>
          <Palette className="w-3.5 h-3.5" /> Styles
        </button>
        <button id="editor-top-bar-preview" onClick={onTogglePreview}
          className={`${iconBtnCls} ${isPreviewing ? activeCls : inactiveCls}`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button id="editor-top-bar-save" onClick={onSave} disabled={saving}
          className={`${iconBtnCls} border transition-all disabled:opacity-60 ${
            saveState === "saved"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-white/10 bg-zinc-900 hover:bg-zinc-800 text-slate-300"
          }`}>
          {SaveIcon} {saveLabel}
        </button>
      </div>
    </div>
  );
};

export default EditorTopBar;
