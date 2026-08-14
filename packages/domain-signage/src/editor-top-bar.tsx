"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { useSaveState } from "./use-save-state";
import { EditorTopBarActions } from "./editor-top-bar-actions";

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
  isPlaying,
  onTogglePlay,
  activeSlideIndex,
  totalSlides,
  onNextSlide,
  onPrevSlide,
  isPreviewing,
  onTogglePreview,
  isStylesOpen,
  onToggleStyles,
  saving,
  onSave,
  layoutName,
  deckSlug,
  isDraft,
  onDiscard,
  onRenameDeck,
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
      const newSlug =
        deckSlug ||
        nameInput
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
      onRenameDeck?.(nameInput.trim(), newSlug);
    }
  };

  const handleCopySlug = async () => {
    if (!deckSlug) return;
    const isLocal =
      typeof window !== "undefined" && window.location.hostname === "localhost";
    const origin = isLocal ? "http://localhost:5003" : window.location.origin;
    await navigator.clipboard.writeText(`${origin}/s/dtown-cafe/${deckSlug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between gap-2 h-12 px-3 bg-card/90 backdrop-blur border-b border-border shrink-0 relative">
      {/* Left — name / slug · play · nav */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col min-w-0">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            className="bg-transparent hover:bg-muted/50 border border-transparent hover:border-border rounded px-1 py-0.5 text-foreground font-bold text-xs focus:bg-background focus:border-primary/40 focus:outline-none max-w-[150px] truncate"
            title="Click to rename"
          />
          {deckSlug && (
            <div className="flex items-center gap-1.5 pl-1 text-[10px] font-mono">
              <span
                className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors flex items-center gap-0.5"
                onClick={handleCopySlug}
                title="Copy live URL"
              >
                /s/{deckSlug}
                {copied ? (
                  <Check className="w-2.5 h-2.5 text-green-400" />
                ) : (
                  <Copy className="w-2.5 h-2.5" />
                )}
              </span>
              <a
                href={
                  typeof window !== "undefined" &&
                  window.location.hostname === "localhost"
                    ? `http://localhost:5003/s/dtown-cafe/${deckSlug}`
                    : `/s/dtown-cafe/${deckSlug}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Open live view in new tab"
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          )}
        </div>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          id="editor-top-bar-play"
          onClick={onTogglePlay}
          disabled={noSlides}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-border bg-muted/50 hover:bg-muted disabled:opacity-40 transition-all cursor-pointer text-foreground"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          ) : (
            <Play className="w-3.5 h-3.5 text-green-400 fill-green-400" />
          )}
          <span className="text-foreground font-mono tracking-tight">
            {totalSlides > 0
              ? `${activeSlideIndex + 1} / ${totalSlides}`
              : "0 / 0"}
          </span>
        </button>
        <div className="flex items-center rounded-md overflow-hidden border border-border">
          <button
            id="editor-top-bar-prev"
            onClick={onPrevSlide}
            disabled={noSlides}
            className="p-1 hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            id="editor-top-bar-next"
            onClick={onNextSlide}
            disabled={noSlides}
            className="p-1 hover:bg-muted disabled:opacity-40 transition-colors cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Right — Draft badge · Discard · Styles · Preview · Save */}
      <EditorTopBarActions
        saving={saving}
        saveState={saveState}
        isPreviewing={isPreviewing}
        isStylesOpen={isStylesOpen}
        isDraft={isDraft}
        onSave={onSave}
        onTogglePreview={onTogglePreview}
        onToggleStyles={onToggleStyles}
        onDiscard={onDiscard}
      />
    </div>
  );
};

export default EditorTopBar;
