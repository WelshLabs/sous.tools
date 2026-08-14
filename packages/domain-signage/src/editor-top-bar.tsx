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
    <div className="bg-card/90 border-border relative flex h-12 shrink-0 items-center justify-between gap-2 border-b px-3 backdrop-blur">
      {/* Left — name / slug · play · nav */}
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-col">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === "Enter" && handleNameBlur()}
            className="hover:bg-muted/50 hover:border-border text-foreground focus:bg-background focus:border-primary/40 max-w-[150px] truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-bold focus:outline-none"
            title="Click to rename"
          />
          {deckSlug && (
            <div className="flex items-center gap-1.5 pl-1 font-mono text-[10px]">
              <span
                className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-0.5 transition-colors"
                onClick={handleCopySlug}
                title="Copy live URL"
              >
                /s/{deckSlug}
                {copied ? (
                  <Check className="h-2.5 w-2.5 text-green-400" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
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
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          )}
        </div>
        <div className="bg-border mx-1 h-6 w-px" />
        <button
          id="editor-top-bar-play"
          onClick={onTogglePlay}
          disabled={noSlides}
          className="border-border bg-muted/50 hover:bg-muted text-foreground flex cursor-pointer items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-all disabled:opacity-40"
        >
          {isPlaying ? (
            <Pause className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          ) : (
            <Play className="h-3.5 w-3.5 fill-green-400 text-green-400" />
          )}
          <span className="text-foreground font-mono tracking-tight">
            {totalSlides > 0
              ? `${activeSlideIndex + 1} / ${totalSlides}`
              : "0 / 0"}
          </span>
        </button>
        <div className="border-border flex items-center overflow-hidden rounded-md border">
          <button
            id="editor-top-bar-prev"
            onClick={onPrevSlide}
            disabled={noSlides}
            className="hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            id="editor-top-bar-next"
            onClick={onNextSlide}
            disabled={noSlides}
            className="hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer p-1 transition-colors disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
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
