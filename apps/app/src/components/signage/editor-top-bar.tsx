"use client";

import React, { useState, useEffect } from "react";

import { Play, Pause, ChevronLeft, ChevronRight, Palette, Eye, Save, RefreshCw, Check, Copy, RefreshCcw, ExternalLink } from "lucide-react";
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
  saving: boolean;
  onSave: () => void;
  layoutName: string;
  deckSlug?: string;
  isDraft?: boolean;
  onDiscard?: () => void;
  onRenameDeck?: (name: string, slug: string) => void;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  isPlaying, onTogglePlay, activeSlideIndex, totalSlides,
  onNextSlide, onPrevSlide, isPreviewing, onTogglePreview,
  isStylesOpen, onToggleStyles, saving, onSave,
  layoutName, deckSlug, isDraft, onDiscard, onRenameDeck,
}) => {
  const saveState = useSaveState(saving);
  const noSlides = totalSlides === 0;
  const [nameInput, setNameInput] = useState(layoutName);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setNameInput(layoutName);
  }, [layoutName]);

  const handleNameBlur = () => {
    if (nameInput.trim() && nameInput.trim() !== layoutName) {
      const newSlug = deckSlug || nameInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
      onRenameDeck?.(nameInput.trim(), newSlug);
    }
  };

  const handleCopySlug = async () => {
    if (!deckSlug) return;
    const isLocal = typeof window !== "undefined" && window.location.hostname === "localhost";
    const origin = isLocal ? "http://localhost:5003" : window.location.origin;
    const url = `${origin}/s/dtown-cafe/${deckSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const SaveIcon = saveState === "saving"
    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
    : saveState === "saved"
    ? <Check className="w-3.5 h-3.5 text-green-400" />
    : <Save className="w-3.5 h-3.5" />;

  return (
    <div className="flex items-center justify-between gap-2 h-12 px-3 bg-zinc-950/80 backdrop-blur border-b border-black/5 dark:border-white/5 shrink-0 relative">
      {/* Left — name / slug · play · nav */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            className="bg-transparent hover:bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/10 dark:border-white/10 rounded px-1 py-0.5 text-white font-bold text-xs focus:bg-zinc-50 dark:bg-zinc-950 focus:border-white/20 focus:outline-none max-w-[150px] truncate"
            title="Click to rename"
          />
          {deckSlug && (
            <div className="flex items-center gap-1.5 pl-1 text-[10px] font-mono">
              <span className="cursor-pointer text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-0.5" onClick={handleCopySlug} title="Copy live URL">
                /s/{deckSlug}
                {copied ? <Check className="w-2.5 h-2.5 text-green-400" /> : <Copy className="w-2.5 h-2.5" />}
              </span>
              <a
                href={typeof window !== "undefined" && window.location.hostname === "localhost" ? `http://localhost:5003/s/dtown-cafe/${deckSlug}` : `/s/dtown-cafe/${deckSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-500 hover:text-slate-300 transition-colors"
                title="Open live view in new tab"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-black/10 dark:bg-white/10 mx-1" />

        <button
          id="editor-top-bar-play"
          onClick={onTogglePlay}
          disabled={noSlides}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-black/10 dark:border-white/10 hover:border-white/25 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 transition-all cursor-pointer"
        >
          {isPlaying
            ? <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            : <Play className="w-3.5 h-3.5 text-green-400 fill-green-400" />}
          <span className="text-slate-300 font-mono tracking-tight">
            {totalSlides > 0 ? `${activeSlideIndex + 1} / ${totalSlides}` : "0 / 0"}
          </span>
        </button>

        <div className="flex items-center rounded-md overflow-hidden border border-black/10 dark:border-white/10">
          <button id="editor-top-bar-prev" onClick={onPrevSlide} disabled={noSlides}
            className="p-1 hover:bg-black/10 dark:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button id="editor-top-bar-next" onClick={onNextSlide} disabled={noSlides}
            className="p-1 hover:bg-black/10 dark:bg-white/10 disabled:opacity-40 transition-colors cursor-pointer">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>



      {/* Right — Draft badge · Discard · Styles · Preview · Save */}
      <div className="flex items-center gap-1.5">
        {isDraft && (
          <>
            <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 border border-amber-500/25 rounded-md">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Draft</span>
            </div>
            {onDiscard && (
              <button
                onClick={onDiscard}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-400 hover:text-white bg-transparent border border-black/10 dark:border-white/10 hover:border-white/20 rounded-md cursor-pointer transition-colors"
                title="Discard unsaved changes"
              >
                <RefreshCcw className="w-3 h-3" /> Discard
              </button>
            )}
          </>
        )}
        <button id="editor-top-bar-styles" onClick={onToggleStyles}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
            isStylesOpen ? "bg-black/10 dark:bg-white/10 border-white/20 text-white" : "bg-transparent border-black/10 dark:border-white/10 text-slate-400 hover:text-white"
          }`}>
          <Palette className="w-3.5 h-3.5" /> Slide Workspace
        </button>
        <button id="editor-top-bar-preview" onClick={onTogglePreview}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${
            isPreviewing ? "bg-black/10 dark:bg-white/10 border-white/20 text-white" : "bg-transparent border-black/10 dark:border-white/10 text-slate-400 hover:text-white"
          }`}>
          <Eye className="w-3.5 h-3.5" /> Preview
        </button>
        <button id="editor-top-bar-save" onClick={onSave} disabled={saving}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer border transition-all disabled:opacity-60 ${
            saveState === "saved"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : "border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-800 text-slate-300"
          }`}>
          {SaveIcon} {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditorTopBar;
